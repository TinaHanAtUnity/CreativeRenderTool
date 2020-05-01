import { RequestManagerMock } from 'Core/Managers/__mocks__/RequestManager';
import { StorageApiMock } from 'Core/Native/__mocks__/StorageApi';
import { StorageBridgeMock } from 'Core/Utilities/__mocks__/StorageBridge';
import { Core } from 'Core/__mocks__/Core';

import { StorageType } from 'Core/Native/Storage';
import { FailedPTSEventManager } from 'Ads/Managers/FailedPTSEventManager';
import { ICore } from 'Core/ICore';

describe('FailedPTSEventManager', () => {
    let failedPTSEventManager: FailedPTSEventManager;
    let core: ICore;
    let storageApi: StorageApiMock;
    let requestManager: RequestManagerMock;
    let storageBridge: StorageBridgeMock;

    beforeEach(() => {
        core = new Core();
        storageApi = <StorageApiMock>core.Api.Storage;
        requestManager = <RequestManagerMock>core.RequestManager;
        storageBridge = <StorageBridgeMock>core.StorageBridge;
        failedPTSEventManager = new FailedPTSEventManager(core.Api, 'fakeSession', 'fakeEvent');
    });

    describe('getEventsStorageKey', () => {
        it('should return the correct session storage key', () => {
            expect(failedPTSEventManager.getEventsStorageKey()).toEqual('session.fakeSession.ptsevent');
        });
    });

    describe('sendFailedEvent', () => {
        describe('when storage promise resolves', () => {
            beforeEach(() => {
                storageApi.get.mockReturnValue(Promise.resolve({ url: 'http://test.url' }));
                return failedPTSEventManager.sendFailedEvent(requestManager, storageBridge);
            });

            it('should get from storage once', () => {
                expect(storageApi.get).toBeCalledTimes(1);
            });

            it('should get from storage with correct params', () => {
                expect(storageApi.get).toBeCalledWith(StorageType.PRIVATE, 'session.fakeSession.ptsevent.fakeEvent');
            });

            it('should send the event once', () => {
                expect(requestManager.get).toBeCalledTimes(1);
            });

            it('should send the event with the correct url', () => {
                expect(requestManager.get).toBeCalledWith('http://test.url');
            });

            it('should queue operation to storage once', () => {
                expect(storageBridge.queue).toBeCalledTimes(1);
            });
        });

        describe('when storage promise rejects', () => {
            beforeEach(() => {
                storageApi.get.mockReturnValue(Promise.reject());
                return failedPTSEventManager.sendFailedEvent(requestManager, storageBridge);
            });

            it('should not send an event', () => {
                expect(requestManager.get).not.toBeCalled();
            });

            it('should not queue operation to delete from storage', () => {
                expect(storageBridge.queue).not.toBeCalled();
            });
        });
    });

    describe('sendFailedEvents', () => {

        beforeEach(() => {
            storageApi.get.mockReturnValue(Promise.resolve({ url: 'http://test.url' }));
            storageApi.getKeys.mockReturnValue(Promise.resolve(['event1', 'event2']));
            return failedPTSEventManager.sendFailedEvents(requestManager, storageBridge);
        });

        it('should get from storage twice', () => {
            expect(storageApi.get).toBeCalledTimes(2);
        });

        it('should get from storage with correct params for the first event', () => {
            expect(storageApi.get).toHaveBeenCalledWith(StorageType.PRIVATE, 'session.fakeSession.ptsevent.event1');
        });

        it('should get from storage with correct params for the second event', () => {
            expect(storageApi.get).toHaveBeenCalledWith(StorageType.PRIVATE, 'session.fakeSession.ptsevent.event2');
        });

        it('should send two get requests', () => {
            expect(requestManager.get).toBeCalledTimes(2);
        });

        it('should send the event with the correct url each time', () => {
            expect(requestManager.get).toBeCalledWith('http://test.url');
        });

        it('should queue deletion operation twice', () => {
            expect(storageBridge.queue).toBeCalledTimes(2);
        });
    });
});
