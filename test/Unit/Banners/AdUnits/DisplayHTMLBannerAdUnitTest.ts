import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Session } from 'Ads/Models/Session';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { Backend } from 'Backend/Backend';

import { DisplayHTMLBannerAdUnit } from 'Banners/AdUnits/DisplayHTMLBannerAdUnit';
import { IBannerNativeApi } from 'Banners/IBannerModule';
import { BannerCampaign, IBannerCampaign } from 'Banners/Models/BannerCampaign';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
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
import { IBannerAdUnitParameters } from 'Banners/AdUnits/HTMLBannerAdUnit';
import { BannerViewType } from 'Banners/Native/BannerApi';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('DisplayHTMLBannerAdUnit', () => {

        let adUnit: DisplayHTMLBannerAdUnit;
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let bannerNativeApi: IBannerNativeApi;
        let campaign: BannerCampaign;
        let thirdPartyEventManager: ThirdPartyEventManager;
        let webPlayerContainer: WebPlayerContainer;
        let bannerAdUnitParameters: IBannerAdUnitParameters;

        const getBannerCampaign = (session: Session) => {
            const campaignData = ValidBannerCampaignJSON;
            return <IBannerCampaign>{
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
                core.Android!.Intent = sinon.createStubInstance(IntentApi);
                core.Android!.Intent.launch = sinon.stub().returns(Promise.resolve());
            }
            if (platform === Platform.IOS) {
                core.iOS!.UrlScheme = sinon.createStubInstance(UrlSchemeApi);
                core.iOS!.UrlScheme.open = sinon.stub().returns(Promise.resolve());
            }

            bannerNativeApi = TestFixtures.getBannerNativeApi(nativeBridge);
            (<any>bannerNativeApi.BannerApi).onBannerAttachedState = new Observable1<boolean>();
            (<any>bannerNativeApi.BannerApi).onBannerLoaded = new Observable0();
            (<any>bannerNativeApi.BannerApi).onBannerOpened = new Observable0();
            sinon.stub(bannerNativeApi.BannerApi, 'load').callsFake((bannerViewType: BannerViewType, width: number, height: number, _bannerAdViewId: string) => {
                return Promise.resolve().then(() => bannerNativeApi.BannerApi.onBannerLoaded.trigger(_bannerAdViewId));
            });

            sinon.stub(bannerNativeApi.BannerListenerApi, 'sendClickEvent').returns(Promise.resolve());
            sinon.stub(bannerNativeApi.BannerListenerApi, 'sendLeaveApplicationEvent').returns(Promise.resolve());

            campaign = new BannerCampaign(getBannerCampaign(TestFixtures.getSession()));

            thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
            asStub(thirdPartyEventManager.sendWithGet).resolves();

            webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
            (<any>webPlayerContainer).onPageFinished = new Observable1();
            (<any>webPlayerContainer).shouldOverrideUrlLoading = new Observable2();
            (<any>webPlayerContainer).onCreateWebView = new Observable2();
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
                            sinon.assert.calledWith(<sinon.SinonSpy>bannerNativeApi.BannerListenerApi.sendClickEvent, bannerAdViewId);
                            return (<sinon.SinonStub>core.iOS!.UrlScheme.open).getCalls()[0].returnValue.then(() => {
                                sinon.assert.calledWith(<sinon.SinonSpy>bannerNativeApi.BannerListenerApi.sendLeaveApplicationEvent, bannerAdViewId);
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
                            sinon.assert.calledWith(asSpy(core.Android!.Intent.launch), {
                                'action': 'android.intent.action.VIEW',
                                'uri': url
                            });
                            sinon.assert.calledWith(<sinon.SinonSpy>bannerNativeApi.BannerListenerApi.sendClickEvent, bannerAdViewId);
                            return (<sinon.SinonStub>core.Android!.Intent.launch).getCalls()[0].returnValue.then(() => {
                                sinon.assert.calledWith(<sinon.SinonSpy>bannerNativeApi.BannerListenerApi.sendLeaveApplicationEvent, bannerAdViewId);
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
                        assert.equal((<any>webPlayerContainer.shouldOverrideUrlLoading)._observers.length, 0, 'Was still subscribed');
                    });
            });
        });
    });
});
