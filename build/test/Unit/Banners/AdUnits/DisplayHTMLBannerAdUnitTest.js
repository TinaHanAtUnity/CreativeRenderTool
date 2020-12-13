import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { DisplayHTMLBannerAdUnit } from 'Banners/AdUnits/DisplayHTMLBannerAdUnit';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { Observable0, Observable1, Observable2 } from 'Core/Utilities/Observable';
import { Template } from 'Core/Utilities/Template';
import BannerContainer from 'html/banner/BannerContainer.html';
import ValidBannerCampaignJSON from 'json/campaigns/banner/ValidBannerCampaign.json';
import 'mocha';
import * as sinon from 'sinon';
import { asSpy, asStub } from 'TestHelpers/Functions';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IntentApi } from 'Core/Native/Android/Intent';
import { UrlSchemeApi } from 'Core/Native/iOS/UrlScheme';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('DisplayHTMLBannerAdUnit', () => {
        let adUnit;
        let backend;
        let nativeBridge;
        let core;
        let bannerNativeApi;
        let campaign;
        let thirdPartyEventManager;
        let webPlayerContainer;
        let bannerAdUnitParameters;
        const getBannerCampaign = (session) => {
            const campaignData = ValidBannerCampaignJSON;
            return {
                session: session,
                markup: encodeURIComponent(campaignData.content),
                trackingUrls: campaignData.trackingUrls
            };
        };
        const placementId = 'unity-test-banner-placement-id';
        const bannerAdViewId = 'unity-test-banner-id';
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            if (platform === Platform.ANDROID) {
                core.Android.Intent = sinon.createStubInstance(IntentApi);
                core.Android.Intent.launch = sinon.stub().returns(Promise.resolve());
            }
            if (platform === Platform.IOS) {
                core.iOS.UrlScheme = sinon.createStubInstance(UrlSchemeApi);
                core.iOS.UrlScheme.open = sinon.stub().returns(Promise.resolve());
            }
            bannerNativeApi = TestFixtures.getBannerNativeApi(nativeBridge);
            bannerNativeApi.BannerApi.onBannerAttachedState = new Observable1();
            bannerNativeApi.BannerApi.onBannerLoaded = new Observable0();
            bannerNativeApi.BannerApi.onBannerOpened = new Observable0();
            sinon.stub(bannerNativeApi.BannerApi, 'load').callsFake((bannerViewType, width, height, _bannerAdViewId) => {
                return Promise.resolve().then(() => bannerNativeApi.BannerApi.onBannerLoaded.trigger(_bannerAdViewId));
            });
            sinon.stub(bannerNativeApi.BannerListenerApi, 'sendClickEvent').returns(Promise.resolve());
            sinon.stub(bannerNativeApi.BannerListenerApi, 'sendLeaveApplicationEvent').returns(Promise.resolve());
            campaign = new BannerCampaign(getBannerCampaign(TestFixtures.getSession()));
            thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
            asStub(thirdPartyEventManager.sendWithGet).resolves();
            webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
            webPlayerContainer.onPageFinished = new Observable1();
            webPlayerContainer.shouldOverrideUrlLoading = new Observable2();
            webPlayerContainer.onCreateWebView = new Observable2();
            asStub(webPlayerContainer.setData).callsFake(() => {
                return Promise.resolve().then(() => webPlayerContainer.onPageFinished.trigger('about:blank'));
            });
            asStub(webPlayerContainer.setEventSettings).resolves();
            asStub(webPlayerContainer.setSettings).resolves();
            bannerAdUnitParameters = {
                platform,
                core,
                campaign,
                webPlayerContainer,
                thirdPartyEventManager,
                bannerNativeApi: bannerNativeApi,
                placementId,
                bannerAdViewId: bannerAdViewId
            };
            adUnit = new DisplayHTMLBannerAdUnit(bannerAdUnitParameters);
        });
        describe('load', () => {
            describe('setting up the banner player', () => {
                describe('setting banner settings', () => {
                    if (platform === Platform.ANDROID) {
                        describe('on android', () => {
                            it('should set the proper settings', () => {
                                return adUnit.onLoad().then(() => {
                                    sinon.assert.calledWith(asSpy(webPlayerContainer.setSettings), {
                                        'setJavaScriptCanOpenWindowsAutomatically': [true],
                                        'setSupportMultipleWindows': [false]
                                    }, {});
                                });
                            });
                            it('should set up banner events disallowing the shouldOverrideUrlLoading event', () => {
                                return adUnit.onLoad().then(() => {
                                    const call = asSpy(webPlayerContainer.setEventSettings).getCall(0);
                                    call.calledWith({
                                        'onPageFinished': { 'sendEvent': true },
                                        'onReceivedSslError': { 'shouldCallSuper': true }
                                    });
                                });
                            });
                        });
                    }
                    if (platform === Platform.IOS) {
                        describe('on iOS', () => {
                            it('should set the proper settings', () => {
                                return adUnit.onLoad().then(() => {
                                    sinon.assert.calledWith(asSpy(webPlayerContainer.setSettings), {
                                        'javaScriptCanOpenWindowsAutomatically': true,
                                        'scalesPagesToFit': true
                                    }, {});
                                });
                            });
                            it('should set up banner events disallowing the createWindow event', () => {
                                return adUnit.onLoad().then(() => {
                                    const call = asSpy(webPlayerContainer.setEventSettings).getCall(0);
                                    call.calledWith({
                                        'onPageFinished': { 'sendEvent': true },
                                        'onReceivedSslError': { 'shouldCallSuper': true }
                                    });
                                });
                            });
                        });
                    }
                });
            });
            describe('setting the markup', () => {
                it('should set the markup within the banner player', () => {
                    return adUnit.onLoad().then(() => {
                        const tpl = new Template(BannerContainer);
                        const markup = tpl.render({
                            markup: decodeURIComponent(campaign.getMarkup())
                        });
                        sinon.assert.calledWith(asSpy(webPlayerContainer.setData), markup, 'text/html', 'UTF-8');
                    });
                });
                describe('when the page has finished', () => {
                    if (platform === Platform.ANDROID) {
                        describe('on android', () => {
                            it('should set up banner events with allowing the shouldOverrideUrlLoading event', () => {
                                return adUnit.onLoad().then(() => {
                                    const call = asSpy(webPlayerContainer.setEventSettings).getCall(1);
                                    sinon.assert.calledWith(call, {
                                        'shouldOverrideUrlLoading': { 'sendEvent': true, 'returnValue': true },
                                        'onReceivedSslError': { 'shouldCallSuper': true }
                                    });
                                });
                            });
                        });
                    }
                    if (platform === Platform.IOS) {
                        describe('on ios', () => {
                            it('should set up banner events with allowing the onCreateWindow event', () => {
                                return adUnit.onLoad().then(() => {
                                    const call = asSpy(webPlayerContainer.setEventSettings).getCall(1);
                                    sinon.assert.calledWith(call, {
                                        'onCreateWindow': { 'sendEvent': true },
                                        'onReceivedSslError': { 'shouldCallSuper': true }
                                    });
                                });
                            });
                        });
                    }
                });
            });
        });
        describe('when the banner is clicked', () => {
            if (platform === Platform.IOS) {
                describe('on iOS', () => {
                    it('should open the URL', () => {
                        return adUnit.onLoad().then(() => {
                            const url = 'http://unity3d.com';
                            webPlayerContainer.onCreateWebView.trigger(url);
                            sinon.assert.calledWith(bannerNativeApi.BannerListenerApi.sendClickEvent, bannerAdViewId);
                            return core.iOS.UrlScheme.open.getCalls()[0].returnValue.then(() => {
                                sinon.assert.calledWith(bannerNativeApi.BannerListenerApi.sendLeaveApplicationEvent, bannerAdViewId);
                            });
                        });
                    });
                });
            }
            if (platform === Platform.ANDROID) {
                describe('on Android', () => {
                    it('should launch an intent with the given URL', () => {
                        return adUnit.onLoad().then(() => {
                            const url = 'http://unity3d.com';
                            webPlayerContainer.shouldOverrideUrlLoading.trigger(url, 'GET');
                            sinon.assert.calledWith(asSpy(core.Android.Intent.launch), {
                                'action': 'android.intent.action.VIEW',
                                'uri': url
                            });
                            sinon.assert.calledWith(bannerNativeApi.BannerListenerApi.sendClickEvent, bannerAdViewId);
                            return core.Android.Intent.launch.getCalls()[0].returnValue.then(() => {
                                sinon.assert.calledWith(bannerNativeApi.BannerListenerApi.sendLeaveApplicationEvent, bannerAdViewId);
                            });
                        });
                    });
                });
            }
        });
        describe('destroy', () => {
            it('should unsubscribe from the banner player override url loading observer', () => {
                return adUnit.onLoad()
                    .then(() => adUnit.onDestroy())
                    .then(() => {
                    assert.equal(webPlayerContainer.shouldOverrideUrlLoading._observers.length, 0, 'Was still subscribed');
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzcGxheUhUTUxCYW5uZXJBZFVuaXRUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0Jhbm5lcnMvQWRVbml0cy9EaXNwbGF5SFRNTEJhbm5lckFkVW5pdFRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFFN0UsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFHaEYsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFFbEYsT0FBTyxFQUFFLGNBQWMsRUFBbUIsTUFBTSwrQkFBK0IsQ0FBQztBQUNoRixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUduRCxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNsRixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxlQUFlLE1BQU0sa0NBQWtDLENBQUM7QUFDL0QsT0FBTyx1QkFBdUIsTUFBTSxnREFBZ0QsQ0FBQztBQUNyRixPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBRS9CLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDdEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFJekQsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENB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