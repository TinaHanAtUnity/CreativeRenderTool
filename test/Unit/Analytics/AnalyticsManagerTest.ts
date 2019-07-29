import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { IAnalyticsObject, IAnalyticsAppStartEventV1, IAnalyticsAppRunningEventV1 } from 'Analytics/AnalyticsProtocol';
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
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { SilentAnalyticsManager } from 'Analytics/SilentAnalyticsManager';

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
        let adsConfiguration: AdsConfiguration;
        let analyticsManager: AnalyticsManager;
        let analyticsStorage: AnalyticsStorage;
        let coreModule: ICore;

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            coreModule = TestFixtures.getCoreModule(nativeBridge);
            analytics = TestFixtures.getAnalyticsApi(nativeBridge);
            coreModule.Config.set('analytics', true);
            adsConfiguration = TestFixtures.getAdsConfiguration();

            sinon.stub(coreModule.Api.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('6c7fa2c0-4333-47be-8de2-2f24e33e710c'));
            sinon.stub(coreModule.RequestManager, 'post').returns(Promise.resolve());

            analyticsStorage = new AnalyticsStorage(coreModule.Api);
            analyticsManager = new AnalyticsManager(coreModule, analytics, adsConfiguration, analyticsStorage);
        });

        describe('SilentAnalyticsManager (Analytics Disabled)', () => {

            beforeEach(() => {
                analyticsManager = new SilentAnalyticsManager(coreModule, analytics, adsConfiguration, analyticsStorage);
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
                    assert.equal(TestHelper.getEventType<IAnalyticsAppStartEventV1>(requestSpy.getCall(0).args[1]), 'ads.analytics.appStart.v1');
                });
            });

            it('should send session running event', () => {
                return analyticsManager.init().then(() => {
                    const requestSpy = <sinon.SinonStub>coreModule.RequestManager.post;
                    requestSpy.resetHistory();

                    coreModule.FocusManager.onActivityPaused.trigger('com.test.activity');

                    sinon.assert.called(requestSpy);
                    assert.equal(TestHelper.getEventType<IAnalyticsAppRunningEventV1>(requestSpy.getCall(0).args[1]), 'ads.analytics.appRunning.v1');
                });
            });

            it('should clear queue after event is sent', () => {
                // tslint:disable:no-string-literal
                return analyticsManager.init().then(() => {
                    const eventQueue: any = analyticsManager['_analyticsEventQueue'];
                    const promise = analyticsManager.onIapTransaction('fakeProductId', 'fakeReceipt', 'USD', 1.99).then(() => {
                        assert.equal(Object.keys(eventQueue).length, 0);
                    });
                    assert.equal(Object.keys(eventQueue).length, 1);
                    return promise;
                });
                // tslint:enable:no-string-literal
            });

            it('should clear queue after multiple events are sent', () => {
                // tslint:disable:no-string-literal
                return analyticsManager.init().then(() => {
                    const eventQueue: any = analyticsManager['_analyticsEventQueue'];
                    const postStub = <sinon.SinonStub>coreModule.RequestManager.post;
                    postStub.resetHistory();
                    const first = analyticsManager.onIapTransaction('fakeProductId', 'fakeReceipt', 'USD', 1.99).catch((error) => {
                        assert.fail(error);
                    });
                    const second = analyticsManager.onIapTransaction('fakeProductId2', 'fakeReceipt', 'USD', 1.99).catch((error) => {
                        assert.fail(error);
                    });
                    assert.equal(Object.keys(eventQueue).length, 2);
                    return Promise.all([first, second]).then(() => {
                        let cdpPostCalls: number = 0;
                        postStub.getCalls().map((call) => {
                            const url = call.args[0];
                            if (url === 'https://cdp.cloud.unity3d.com/v1/events') {
                                cdpPostCalls++;
                            }
                        });
                        assert.equal(JSON.stringify(eventQueue), '{}');
                        assert.equal(cdpPostCalls, 2);
                        assert.equal(Object.keys(eventQueue).length, 0);
                    });
                });
                // tslint:enable:no-string-literal
            });

            it('should clear queue when first send fails and second succeeds', () => {
                // tslint:disable:no-string-literal
                return analyticsManager.init().then(() => {
                    const eventQueue: any = analyticsManager['_analyticsEventQueue'];
                    const postStub = <sinon.SinonStub>coreModule.RequestManager.post;
                    postStub.resetHistory();
                    postStub.rejects();
                    return analyticsManager.onIapTransaction('fakeProductId', 'fakeReceipt', 'USD', 1.99).then(() => {
                        assert.fail('should throw');
                    }).catch(() => {
                        assert.equal(Object.keys(eventQueue).length, 1);
                        postStub.resolves();
                        return analyticsManager.onIapTransaction('fakeProductId2', 'fakeReceipt', 'USD', 1.99)
                            .then(() => {
                                let cdpPostCalls: number = 0;
                                postStub.getCalls().map((call) => {
                                    const url = call.args[0];
                                    if (url === 'https://cdp.cloud.unity3d.com/v1/events') {
                                        cdpPostCalls++;
                                    }
                                });
                                assert.equal(JSON.stringify(eventQueue), '{}');
                                assert.equal(cdpPostCalls, 2);
                                assert.equal(Object.keys(eventQueue).length, 0);
                            })
                            .catch(() => {
                                assert.fail('should not throw');
                            });
                    });
                });
                // tslint:enable:no-string-literal
            });
        });

    });
});
