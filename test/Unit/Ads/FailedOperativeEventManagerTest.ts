import { FailedOperativeEventManager } from 'Ads/Managers/FailedOperativeEventManager';
import { assert } from 'chai';
import { FocusManager } from 'Core/Managers/FocusManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { StorageType } from 'Core/Native/Storage';
import { HttpKafka } from 'Core/Utilities/HttpKafka';
import { RequestManager } from 'Core/Managers/RequestManager';
import 'mocha';
import * as sinon from 'sinon';
import { FailedXpromoOperativeEventManager } from 'XPromo/Managers/FailedXpromoOperativeEventManager';
import { Platform } from 'Core/Constants/Platform';
import { Backend } from 'Backend/Backend';
import { ICoreApi } from 'Core/ICore';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { StorageBridgeHelper } from 'TestHelpers/StorageBridgeHelper';

describe('FailedOperativeEventManagerTest', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let request: RequestManager;
    let storageBridge: StorageBridge;
    let focusManager: FocusManager;
    let wakeUpManager: WakeUpManager;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);

        storageBridge = new StorageBridge(core, 1);
        focusManager = new FocusManager(platform, core);
        wakeUpManager = new WakeUpManager(core);
        request = new RequestManager(platform, core, wakeUpManager);
    });

    describe('Handling failed events', () => {
        beforeEach(() => {
            sinon.stub(core.Storage, 'getKeys').callsFake(() => {
                return Promise.resolve(['event1', 'event2']);
            });
            sinon.stub(request, 'post').callsFake(() => {
                return Promise.resolve();
            });
            sinon.stub(core.Storage, 'get').callsFake(() => {
                return Promise.resolve({url: 'http://test.url', data: '{\"testdata\": \"test\"}'});
            });
            sinon.stub(core.Storage, 'delete').callsFake(() => {
                return Promise.resolve();
            });
            sinon.stub(core.Storage, 'write').callsFake(() => {
                return Promise.resolve();
            });
        });

        describe('Resending', () => {
            describe('Performance events', () => {
                it('Should send single event', () => {
                    const storagePromise = StorageBridgeHelper.waitForPrivateStorageBatch(storageBridge);
                    const manager = new FailedOperativeEventManager(core.Storage, '12345', '12345');
                    return manager.sendFailedEvent(request, storageBridge).then(() => {
                        return storagePromise;
                    }).then(() => {
                        sinon.assert.calledOnce(<sinon.SinonSpy>request.post);
                        sinon.assert.calledWith(<sinon.SinonSpy>request.post, 'http://test.url', '{\"testdata\": \"test\"}');
                        sinon.assert.calledOnce(<sinon.SinonSpy>core.Storage.get);
                        sinon.assert.calledWith(<sinon.SinonSpy>core.Storage.get, StorageType.PRIVATE, 'session.12345.operative.12345');
                        sinon.assert.calledOnce(<sinon.SinonSpy>core.Storage.delete);
                        sinon.assert.calledWith(<sinon.SinonSpy>core.Storage.delete, StorageType.PRIVATE, 'session.12345.operative.12345');
                        sinon.assert.calledOnce(<sinon.SinonSpy>core.Storage.write);
                    });
                });

                it('Should send multiple events', () => {
                    const storagePromise = StorageBridgeHelper.waitForPrivateStorageBatch(storageBridge);
                    const manager = new FailedOperativeEventManager(core.Storage, '12345');
                    return manager.sendFailedEvents(core.Storage, request, storageBridge).then(() => {
                        return storagePromise;
                    }).then(() => {
                        sinon.assert.calledOnce(<sinon.SinonSpy>core.Storage.getKeys);
                        sinon.assert.calledTwice(<sinon.SinonSpy>core.Storage.get);
                        sinon.assert.calledTwice(<sinon.SinonSpy>core.Storage.delete);
                        assert.equal((<sinon.SinonSpy>core.Storage.delete).getCall(0).args[1], 'session.12345.operative.event1');
                        assert.equal((<sinon.SinonSpy>core.Storage.delete).getCall(1).args[1], 'session.12345.operative.event2');
                        sinon.assert.calledOnce(<sinon.SinonSpy>core.Storage.write);
                    });
                });

                it('Should not send event without eventId', () => {
                    const manager = new FailedOperativeEventManager(core.Storage, '12345');
                    return manager.sendFailedEvent(request, storageBridge).then(() => {
                        sinon.assert.notCalled(<sinon.SinonSpy>core.Storage.get);
                        sinon.assert.notCalled(<sinon.SinonSpy>request.post);
                        sinon.assert.notCalled(<sinon.SinonSpy>core.Storage.write);
                        sinon.assert.notCalled(<sinon.SinonSpy>core.Storage.delete);
                    });
                });
            });

            describe('Xpromo events', () => {
                it('Single event', () => {
                    (<sinon.SinonStub>core.Storage.get).restore();
                    sinon.stub(core.Storage, 'get').callsFake(() => {
                        return Promise.resolve({kafkaType: 'test.kafka.type', data: '{\"testdata\": \"test\"}'});
                    });

                    HttpKafka.setRequest(request);

                    const storagePromise = StorageBridgeHelper.waitForPrivateStorageBatch(storageBridge);
                    const manager = new FailedXpromoOperativeEventManager(core.Storage, '12345', '12345');
                    return manager.sendFailedEvent(request, storageBridge).then(() => {
                        return storagePromise;
                    }).then(() => {
                        sinon.assert.calledOnce(<sinon.SinonSpy>request.post);
                        sinon.assert.calledWith(<sinon.SinonSpy>request.post, 'https://httpkafka.unityads.unity3d.com/v1/events');
                        sinon.assert.calledOnce(<sinon.SinonSpy>core.Storage.get);
                        sinon.assert.calledWith(<sinon.SinonSpy>core.Storage.get, StorageType.PRIVATE, 'session.12345.xpromooperative.12345');
                        sinon.assert.calledOnce(<sinon.SinonSpy>core.Storage.delete);
                        sinon.assert.calledWith(<sinon.SinonSpy>core.Storage.delete, StorageType.PRIVATE, 'session.12345.xpromooperative.12345');
                        sinon.assert.calledOnce(<sinon.SinonSpy>core.Storage.write);
                    });
                });
            });
        });

        describe('Storing', () => {
            beforeEach(() => {
                sinon.stub(core.Storage, 'set').callsFake(() => {
                    return Promise.resolve();
                });
            });

            it('Single event', () => {
                const storagePromise = StorageBridgeHelper.waitForPrivateStorageBatch(storageBridge);
                const manager = new FailedOperativeEventManager(core.Storage, '12345', '12345');
                return manager.storeFailedEvent(storageBridge, {test1: 'test1', test2: 'test2'}).then(() => {
                    return storagePromise;
                }).then(() => {
                    sinon.assert.calledOnce(<sinon.SinonSpy>core.Storage.set);
                    sinon.assert.calledWith(<sinon.SinonSpy>core.Storage.set, StorageType.PRIVATE, 'session.12345.operative.12345', {test1: 'test1', test2: 'test2'});
                    sinon.assert.calledOnce(<sinon.SinonSpy>core.Storage.write);
                });
            });
        });
    });
});
