import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { Session } from 'Ads/Models/Session';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { Backend } from 'Backend/Backend';

import { DisplayHTMLBannerAdUnit } from 'Banners/AdUnits/DisplayHTMLBannerAdUnit';
import { IBannersApi } from 'Banners/IBanners';
import { BannerCampaign, IBannerCampaign } from 'Banners/Models/BannerCampaign';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
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

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('DisplayHTMLBannerAdUnit', () => {

        let adUnit: DisplayHTMLBannerAdUnit;
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let banners: IBannersApi;
        let deviceInfo: DeviceInfo;
        let placement: Placement;
        let campaign: BannerCampaign;
        let clientInfo: ClientInfo;
        let thirdPartyEventManager: ThirdPartyEventManager;
        let webPlayerContainer: WebPlayerContainer;

        const getBannerCampaign = (session: Session) => {
            const campaignData = JSON.parse(ValidBannerCampaignJSON);
            return <IBannerCampaign>{
                session: session,
                markup: encodeURIComponent(campaignData.content),
                trackingUrls: campaignData.trackingUrls
            };
        };

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);

            if(platform === Platform.ANDROID) {
                core.Android!.Intent = sinon.createStubInstance(IntentApi);
            }
            if(platform === Platform.IOS) {
                core.iOS!.UrlScheme = sinon.createStubInstance(UrlSchemeApi);
            }

            banners = TestFixtures.getBannersApi(nativeBridge);
            (<unknown>banners.Banner).onBannerAttachedState = new Observable1<boolean>();
            (<unknown>banners.Banner).onBannerLoaded = new Observable0();
            (<unknown>banners.Banner).onBannerOpened = new Observable0();
            sinon.stub(banners.Banner, 'load').callsFake(() => {
                return Promise.resolve().then(() => banners.Banner.onBannerLoaded.trigger());
            });

            if(platform === Platform.ANDROID) {
                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            }
            if(platform === Platform.IOS) {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
            }
            placement = TestFixtures.getPlacement();

            campaign = new BannerCampaign(getBannerCampaign(TestFixtures.getSession()));

            clientInfo = TestFixtures.getClientInfo();
            thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
            asStub(thirdPartyEventManager.sendWithGet).resolves();

            webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
            (<unknown>webPlayerContainer).onPageFinished = new Observable1();
            (<unknown>webPlayerContainer).shouldOverrideUrlLoading = new Observable2();
            (<unknown>webPlayerContainer).onCreateWebView = new Observable2();
            asStub(webPlayerContainer.setData).callsFake(() => {
                return Promise.resolve().then(() => webPlayerContainer.onPageFinished.trigger('about:blank'));
            });
            asStub(webPlayerContainer.setEventSettings).resolves();
            asStub(webPlayerContainer.setSettings).resolves();

            adUnit = new DisplayHTMLBannerAdUnit({
                platform,
                core,
                campaign,
                placement,
                clientInfo,
                webPlayerContainer,
                thirdPartyEventManager
            });
        });

        describe('load', () => {
            describe('setting up the banner player', () => {
                describe('setting banner settings', () => {
                    if(platform === Platform.ANDROID) {
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
                                        'onPageFinished': {'sendEvent': true}
                                    });
                                });
                            });
                        });
                    }
                    if(platform === Platform.IOS) {
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
                                        'onPageFinished': {'sendEvent': true}
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
                    if(platform === Platform.ANDROID) {
                        describe('on android', () => {
                            it('should set up banner events with allowing the shouldOverrideUrlLoading event', () => {
                                return adUnit.onLoad().then(() => {
                                    const call = asSpy(webPlayerContainer.setEventSettings).getCall(1);
                                    sinon.assert.calledWith(call, {
                                        'shouldOverrideUrlLoading': {'sendEvent': true, 'returnValue': true}
                                    });
                                });
                            });
                        });
                    }

                    if(platform === Platform.IOS) {
                        describe('on ios', () => {
                            it('should set up banner events with allowing the onCreateWindow event', () => {
                                return adUnit.onLoad().then(() => {
                                    const call = asSpy(webPlayerContainer.setEventSettings).getCall(1);
                                    sinon.assert.calledWith(call, {
                                        'onCreateWindow': {'sendEvent': true}
                                    });
                                });
                            });
                        });
                    }
                });
            });
        });

        describe('when the banner is clicked', () => {
            if(platform === Platform.IOS) {
                describe('on iOS', () => {
                    it('should open the URL', () => {
                        return adUnit.onLoad().then(() => {
                            const url = 'http://unity3d.com';
                            webPlayerContainer.onCreateWebView.trigger(url);
                            sinon.assert.calledWith(asSpy(core.iOS!.UrlScheme.open), url);
                        });
                    });
                });
            }

            if(platform === Platform.ANDROID) {
                describe('on Android', () => {
                    it('should launch an intent with the given URL', () => {
                        return adUnit.onLoad().then(() => {
                            const url = 'http://unity3d.com';
                            webPlayerContainer.shouldOverrideUrlLoading.trigger(url, 'GET');
                            sinon.assert.calledWith(asSpy(core.Android!.Intent.launch), {
                                'action': 'android.intent.action.VIEW',
                                'uri': url
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
                        assert.equal((<unknown>webPlayerContainer.shouldOverrideUrlLoading)._observers.length, 0, 'Was still subscribed');
                    });
            });
        });
    });
});
