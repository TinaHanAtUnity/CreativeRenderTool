import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { SilentAnalyticsManager } from 'Analytics/SilentAnalyticsManager';
import { StoreTransaction } from 'Store/Models/StoreTransaction';
class TestHelper {
    static getEventType(data) {
        const rawJson = data.split('\n')[1];
        const analyticsObject = JSON.parse(rawJson);
        return analyticsObject.type;
    }
}
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`AnalyticsManagerTest for ${Platform[platform]}`, () => {
        let backend;
        let nativeBridge;
        let analytics;
        let privacySDK;
        let analyticsManager;
        let analyticsStorage;
        let coreModule;
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            coreModule = TestFixtures.getCoreModule(nativeBridge);
            analytics = TestFixtures.getAnalyticsApi(nativeBridge);
            coreModule.Config.set('analytics', true);
            privacySDK = TestFixtures.getPrivacySDK(coreModule.Api);
            sinon.stub(coreModule.Api.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('6c7fa2c0-4333-47be-8de2-2f24e33e710c'));
            sinon.stub(coreModule.RequestManager, 'post').returns(Promise.resolve());
            analyticsStorage = new AnalyticsStorage(coreModule.Api);
            analyticsManager = new AnalyticsManager(coreModule, analytics, privacySDK, analyticsStorage);
        });
        describe('SilentAnalyticsManager (Analytics Disabled)', () => {
            beforeEach(() => {
                analyticsManager = new SilentAnalyticsManager();
            });
            it('should not send session start event', () => {
                const requestSpy = coreModule.RequestManager.post;
                return analyticsManager.init().then(() => {
                    sinon.assert.notCalled(requestSpy);
                });
            });
            it('should not send session running event', () => {
                return analyticsManager.init().then(() => {
                    const requestSpy = coreModule.RequestManager.post;
                    requestSpy.resetHistory();
                    coreModule.FocusManager.onActivityPaused.trigger('com.test.activity');
                    sinon.assert.notCalled(requestSpy);
                });
            });
        });
        describe('Analytics Enabled', () => {
            it('should send session start event', () => {
                const requestSpy = coreModule.RequestManager.post;
                return analyticsManager.init().then(() => {
                    sinon.assert.called(requestSpy);
                    assert.equal(requestSpy.getCall(0).args[0], 'https://thind.unityads.unity3d.com/v1/events');
                    assert.equal(TestHelper.getEventType(requestSpy.getCall(0).args[1]), 'ads.analytics.appStart.v1');
                });
            });
            it('should send session running event', () => {
                return analyticsManager.init().then(() => {
                    const requestSpy = coreModule.RequestManager.post;
                    requestSpy.resetHistory();
                    coreModule.FocusManager.onActivityPaused.trigger('com.test.activity');
                    sinon.assert.called(requestSpy);
                    assert.equal(requestSpy.getCall(0).args[0], 'https://thind.unityads.unity3d.com/v1/events');
                    assert.equal(TestHelper.getEventType(requestSpy.getCall(0).args[1]), 'ads.analytics.appRunning.v1');
                });
            });
            it('should send the transactionSuccess event', () => {
                return analyticsManager.init().then(() => {
                    const requestSpy = coreModule.RequestManager.post;
                    requestSpy.resetHistory();
                    const fakeTransaction = sinon.createStubInstance(StoreTransaction);
                    return analyticsManager.onTransactionSuccess(fakeTransaction).then(() => {
                        sinon.assert.called(requestSpy);
                        assert.equal(requestSpy.getCall(0).args[0], 'https://thind.unityads.unity3d.com/v1/events');
                        assert.equal(TestHelper.getEventType(requestSpy.getCall(0).args[1]), 'ads.analytics.transactionSuccess.v1');
                    });
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl0aWNzTWFuYWdlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvQW5hbHl0aWNzL0FuYWx5dGljc01hbmFnZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTlELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRzlELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBSW5ELE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBRzFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBRWpFLE1BQU0sVUFBVTtJQUNMLE1BQU0sQ0FBQyxZQUFZLENBQUksSUFBWTtRQUN0QyxNQUFNLE9BQU8sR0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sZUFBZSxHQUF3QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pFLE9BQU8sZUFBZSxDQUFDLElBQUksQ0FBQztJQUNoQyxDQUFDO0NBQ0o7QUFFRCxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtJQUNoRCxRQUFRLENBQUMsNEJBQTRCLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRTtRQUM1RCxJQUFJLE9BQWdCLENB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