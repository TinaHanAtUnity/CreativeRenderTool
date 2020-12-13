import { Core } from 'Core/__mocks__/Core';
import { StorageType } from 'Core/Native/Storage';
import { FailedPTSEventManager } from 'Ads/Managers/FailedPTSEventManager';
describe('FailedPTSEventManager', () => {
    let failedPTSEventManager;
    let core;
    let storageApi;
    let requestManager;
    let storageBridge;
    beforeEach(() => {
        core = new Core();
        storageApi = core.Api.Storage;
        requestManager = core.RequestManager;
        storageBridge = core.StorageBridge;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmFpbGVkUFRTRXZlbnRNYW5hZ2VyLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL01hbmFnZXJzL0ZhaWxlZFBUU0V2ZW50TWFuYWdlci5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUUzQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbEQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFHM0UsUUFBUSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtJQUNuQyxJQUFJLHFCQUE0QyxDQUFDO0lBQ2pELElBQUksSUFBVyxDQUFDO0lBQ2hCLElBQUksVUFBMEIsQ0FBQztJQUMvQixJQUFJLGNBQWtDLENBQUM7SUFDdkMsSUFBSSxhQUFnQyxDQUFDO0lBRXJDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDWixJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNsQixVQUFVLEdBQW1CLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBQzlDLGNBQWMsR0FBdUIsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUN6RCxhQUFhLEdBQXNCLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDdEQscUJBQXFCLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUM1RixDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7UUFDakMsRUFBRSxDQUFDLCtDQUErQyxFQUFFLEdBQUcsRUFBRTtZQUNyRCxNQUFNLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1FBQ2hHLENBQUMsQ0FBQyxD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