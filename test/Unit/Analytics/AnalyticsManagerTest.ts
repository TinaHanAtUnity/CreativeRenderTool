import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { IAnalyticsObject, IAnalyticsAppStartEventV1, IAnalyticsAppRunningEventV1, IAnalyticsTransactionEventV1 } from 'Analytics/AnalyticsProtocol';
import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
import { IAnalyticsApi } from 'Analytics/IAnalytics';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { SilentAnalyticsManager } from 'Analytics/SilentAnalyticsManager';
import { IAnalyticsManager } from 'Analytics/IAnalyticsManager';
import { ITransactionDetails } from 'Purchasing/PurchasingAdapter';
import { PrivacySDK } from 'Privacy/PrivacySDK';

class TestHelper {
    public static getEventType<T>(data: string) {
        const rawJson: string = data.split('\n')[1];
        const analyticsObject: IAnalyticsObject<T> = JSON.parse(rawJson);
        return analyticsObject.type;
    }
}

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`AnalyticsManagerTest for ${Platform[platform]}`, () => {
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let analytics: IAnalyticsApi;
        let privacySDK: PrivacySDK;
        let analyticsManager: IAnalyticsManager;
        let analyticsStorage: AnalyticsStorage;
        let coreModule: ICore;

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
                const requestSpy = <sinon.SinonStub>coreModule.RequestManager.post;

                return analyticsManager.init().then(() => {
                    sinon.assert.notCalled(requestSpy);
                });
            });

            it('should not send session running event', () => {
                return analyticsManager.init().then(() => {
                    const requestSpy = <sinon.SinonStub>coreModule.RequestManager.post;
                    requestSpy.resetHistory();

                    coreModule.FocusManager.onActivityPaused.trigger('com.test.activity');

                    sinon.assert.notCalled(requestSpy);
                });
            });
        });

        describe('Analytics Enabled', () => {

            it('should send session start event', () => {
                const requestSpy = <sinon.SinonStub>coreModule.RequestManager.post;

                return analyticsManager.init().then(() => {
                    sinon.assert.called(requestSpy);
                    assert.equal(requestSpy.getCall(0).args[0], 'https://thind.unityads.unity3d.com');
                    assert.equal(TestHelper.getEventType<IAnalyticsAppStartEventV1>(requestSpy.getCall(0).args[1]), 'ads.analytics.appStart.v1');
                });
            });

            it('should send session running event', () => {
                return analyticsManager.init().then(() => {
                    const requestSpy = <sinon.SinonStub>coreModule.RequestManager.post;
                    requestSpy.resetHistory();

                    coreModule.FocusManager.onActivityPaused.trigger('com.test.activity');

                    sinon.assert.called(requestSpy);
                    assert.equal(requestSpy.getCall(0).args[0], 'https://thind.unityads.unity3d.com');
                    assert.equal(TestHelper.getEventType<IAnalyticsAppRunningEventV1>(requestSpy.getCall(0).args[1]), 'ads.analytics.appRunning.v1');
                });
            });

            it('should send iap transaction event', () => {
                return analyticsManager.init().then(() => {
                    const requestSpy = <sinon.SinonStub>coreModule.RequestManager.post;
                    requestSpy.resetHistory();

                    const fakeTransaction: ITransactionDetails = {
                        productId: 'scottProduct',
                        transactionId: '1234',
                        receipt: 'scoot made a transaction to buy doots on august 28th',
                        price: 69,
                        currency: 'SD (Scott Dollars)',
                        extras: undefined
                    };

                    return analyticsManager.onIapTransaction(fakeTransaction).then(() => {
                        sinon.assert.called(requestSpy);
                        assert.equal(requestSpy.getCall(0).args[0], 'https://thind.unityads.unity3d.com');
                        assert.equal(TestHelper.getEventType<IAnalyticsTransactionEventV1>(requestSpy.getCall(0).args[1]), 'ads.analytics.transaction.v1');
                    });
                });
            });
        });

    });
});
