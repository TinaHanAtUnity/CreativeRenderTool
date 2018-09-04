import { FailedOperativeEventManager } from 'Ads/Managers/FailedOperativeEventManager';
import { assert } from 'chai';
import { FocusManager } from 'Core/Managers/FocusManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageType } from 'Core/Native/Storage';
import { HttpKafka } from 'Core/Utilities/HttpKafka';
import { Request } from 'Core/Utilities/Request';
import 'mocha';
import * as sinon from 'sinon';
import { FailedXpromoOperativeEventManager } from 'XPromo/Managers/FailedXpromoOperativeEventManager';

describe('FailedOperativeEventManagerTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    let request: Request;
    let focusManager: FocusManager;
    let wakeUpManager: WakeUpManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        focusManager = new FocusManager(nativeBridge);
        wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
    });

    describe('Handling failed events', () => {
        beforeEach(() => {
            sinon.stub(nativeBridge.Storage, 'getKeys').callsFake(() => {
                return Promise.resolve(['event1', 'event2']);
            });
            sinon.stub(request, 'post').callsFake(() => {
                return Promise.resolve();
            });
            sinon.stub(nativeBridge.Storage, 'get').callsFake(() => {
                return Promise.resolve({url: 'http://test.url', data: '{\"testdata\": \"test\"}'});
            });
            sinon.stub(nativeBridge.Storage, 'delete').callsFake(() => {
                return Promise.resolve();
            });
            sinon.stub(nativeBridge.Storage, 'write').callsFake(() => {
                return Promise.resolve();
            });
        });

        describe('Resending', () => {
            describe('Performance events', () => {
                it('Should send single event', () => {
                    const manager = new FailedOperativeEventManager('12345', '12345');
                    return manager.sendFailedEvent(nativeBridge, request, true).then(() => {
                        sinon.assert.calledOnce(<sinon.SinonSpy>request.post);
                        sinon.assert.calledWith(<sinon.SinonSpy>request.post, 'http://test.url', '{\"testdata\": \"test\"}');
                        sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.get);
                        sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Storage.get, StorageType.PRIVATE, 'session.12345.operative.12345');
                        sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.delete);
                        sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Storage.delete, StorageType.PRIVATE, 'session.12345.operative.12345');
                        sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.write);
                    });
                });

                it('Should send multiple events', () => {
                    const manager = new FailedOperativeEventManager('12345');
                    return manager.sendFailedEvents(nativeBridge, request).then(() => {
                        sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.getKeys);
                        sinon.assert.calledTwice(<sinon.SinonSpy>nativeBridge.Storage.get);
                        sinon.assert.calledTwice(<sinon.SinonSpy>nativeBridge.Storage.delete);
                        assert.equal((<sinon.SinonSpy>nativeBridge.Storage.delete).getCall(0).args[1], 'session.12345.operative.event1');
                        assert.equal((<sinon.SinonSpy>nativeBridge.Storage.delete).getCall(1).args[1], 'session.12345.operative.event2');
                        sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.write);
                    });
                });

                it('Should not send event without eventId', () => {
                    const manager = new FailedOperativeEventManager('12345');
                    return manager.sendFailedEvent(nativeBridge, request, true).then(() => {
                        sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.Storage.get);
                        sinon.assert.notCalled(<sinon.SinonSpy>request.post);
                        sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.Storage.write);
                        sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.Storage.delete);
                    });
                });
            });

            describe('Xpromo events', () => {
                it('Single event', () => {
                    (<sinon.SinonStub>nativeBridge.Storage.get).restore();
                    sinon.stub(nativeBridge.Storage, 'get').callsFake(() => {
                        return Promise.resolve({kafkaType: 'test.kafka.type', data: '{\"testdata\": \"test\"}'});
                    });

                    HttpKafka.setRequest(request);

                    const manager = new FailedXpromoOperativeEventManager('12345', '12345');
                    return manager.sendFailedEvent(nativeBridge, request, true).then(() => {
                        sinon.assert.calledOnce(<sinon.SinonSpy>request.post);
                        sinon.assert.calledWith(<sinon.SinonSpy>request.post, 'https://httpkafka.unityads.unity3d.com/v1/events');
                        sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.get);
                        sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Storage.get, StorageType.PRIVATE, 'session.12345.xpromooperative.12345');
                        sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.delete);
                        sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Storage.delete, StorageType.PRIVATE, 'session.12345.xpromooperative.12345');
                        sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.write);
                    });
                });
            });
        });

        describe('Storing', () => {
            beforeEach(() => {
                sinon.stub(nativeBridge.Storage, 'set').callsFake(() => {
                    return Promise.resolve();
                });
            });

            it('Single event', () => {
                const manager = new FailedOperativeEventManager('12345', '12345');
                return manager.storeFailedEvent(nativeBridge, {test1: 'test1', test2: 'test2'}).then(() => {
                    sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.set);
                    sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Storage.set, StorageType.PRIVATE, 'session.12345.operative.12345', {test1: 'test1', test2: 'test2'});
                    sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Storage.write);
                });
            });
        });
    });
});
