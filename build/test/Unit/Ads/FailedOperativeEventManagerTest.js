import { FailedOperativeEventManager } from 'Ads/Managers/FailedOperativeEventManager';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { StorageType } from 'Core/Native/Storage';
import { HttpKafka } from 'Core/Utilities/HttpKafka';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import * as sinon from 'sinon';
import { StorageBridgeHelper } from 'TestHelpers/StorageBridgeHelper';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { FailedXpromoOperativeEventManager } from 'XPromo/Managers/FailedXpromoOperativeEventManager';
describe('FailedOperativeEventManagerTest', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let request;
    let storageBridge;
    let focusManager;
    let wakeUpManager;
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
                return Promise.resolve({ url: 'http://test.url', data: '{\"testdata\": \"test\"}' });
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
                    const manager = new FailedOperativeEventManager(core, '12345', '12345');
                    return manager.sendFailedEvent(request, storageBridge).then(() => {
                        return storagePromise;
                    }).then(() => {
                        sinon.assert.calledOnce(request.post);
                        sinon.assert.calledWith(request.post, 'http://test.url', '{\"testdata\": \"test\"}');
                        sinon.assert.calledOnce(core.Storage.get);
                        sinon.assert.calledWith(core.Storage.get, StorageType.PRIVATE, 'session.12345.operative.12345');
                        sinon.assert.calledOnce(core.Storage.delete);
                        sinon.assert.calledWith(core.Storage.delete, StorageType.PRIVATE, 'session.12345.operative.12345');
                        sinon.assert.calledOnce(core.Storage.write);
                    });
                });
                it('Should send multiple events', () => {
                    const storagePromise = StorageBridgeHelper.waitForPrivateStorageBatch(storageBridge);
                    const manager = new FailedOperativeEventManager(core, '12345');
                    return manager.sendFailedEvents(request, storageBridge).then(() => {
                        return storagePromise;
                    }).then(() => {
                        sinon.assert.calledOnce(core.Storage.getKeys);
                        sinon.assert.calledTwice(core.Storage.get);
                        sinon.assert.calledTwice(core.Storage.delete);
                        assert.equal(core.Storage.delete.getCall(0).args[1], 'session.12345.operative.event1');
                        assert.equal(core.Storage.delete.getCall(1).args[1], 'session.12345.operative.event2');
                        sinon.assert.calledOnce(core.Storage.write);
                    });
                });
                it('Should not send event without eventId', () => {
                    const manager = new FailedOperativeEventManager(core, '12345');
                    return manager.sendFailedEvent(request, storageBridge).then(() => {
                        sinon.assert.notCalled(core.Storage.get);
                        sinon.assert.notCalled(request.post);
                        sinon.assert.notCalled(core.Storage.write);
                        sinon.assert.notCalled(core.Storage.delete);
                    });
                });
            });
            describe('Xpromo events', () => {
                it('Single event', () => {
                    core.Storage.get.restore();
                    sinon.stub(core.Storage, 'get').callsFake(() => {
                        return Promise.resolve({ kafkaType: 'test.kafka.type', data: '{\"testdata\": \"test\"}' });
                    });
                    HttpKafka.setRequest(request);
                    const storagePromise = StorageBridgeHelper.waitForPrivateStorageBatch(storageBridge);
                    const manager = new FailedXpromoOperativeEventManager(core, '12345', '12345');
                    return manager.sendFailedEvent(request, storageBridge).then(() => {
                        return storagePromise;
                    }).then(() => {
                        sinon.assert.calledOnce(request.post);
                        sinon.assert.calledWith(request.post, 'https://httpkafka.unityads.unity3d.com/v1/events');
                        sinon.assert.calledOnce(core.Storage.get);
                        sinon.assert.calledWith(core.Storage.get, StorageType.PRIVATE, 'session.12345.xpromooperative.12345');
                        sinon.assert.calledOnce(core.Storage.delete);
                        sinon.assert.calledWith(core.Storage.delete, StorageType.PRIVATE, 'session.12345.xpromooperative.12345');
                        sinon.assert.calledOnce(core.Storage.write);
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
                const manager = new FailedOperativeEventManager(core, '12345', '12345');
                return manager.storeFailedEvent(storageBridge, { test1: 'test1', test2: 'test2' }).then(() => {
                    return storagePromise;
                }).then(() => {
                    sinon.assert.calledOnce(core.Storage.set);
                    sinon.assert.calledWith(core.Storage.set, StorageType.PRIVATE, 'session.12345.operative.12345', { test1: 'test1', test2: 'test2' });
                    sinon.assert.calledOnce(core.Storage.write);
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmFpbGVkT3BlcmF0aXZlRXZlbnRNYW5hZ2VyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9BZHMvRmFpbGVkT3BlcmF0aXZlRXZlbnRNYW5hZ2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUV2RixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUc1RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbEQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3RFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsaUNBQWlDLEVBQUUsTUFBTSxtREFBbUQsQ0FBQztBQUV0RyxRQUFRLENBQUMsaUNBQWlDLEVBQUUsR0FBRyxFQUFFO0lBQzdDLElBQUksUUFBa0IsQ0FBQztJQUN2QixJQUFJLE9BQWdCLENBQUM7SUFDckIsSUFBSSxZQUEwQixDQUFDO0lBQy9CLElBQUksSUFBYyxDQUFDO0lBQ25CLElBQUksT0FBdUIsQ0FBQztJQUM1QixJ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