import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { Session } from 'Ads/Models/Session';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';

import { BannerAdUnit } from 'Banners/AdUnits/BannerAdUnit';
import { BannerCampaign, IBannerCampaign } from 'Banners/Models/BannerCampaign';
import { BannerApi } from 'Banners/Native/Banner';
import { BannerListenerApi } from 'Banners/Native/UnityBannerListener';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IntentApi } from 'Core/Native/Android/Intent';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable0, Observable1, Observable2 } from 'Core/Utilities/Observable';
import { Template } from 'Core/Utilities/Template';

import BannerContainer from 'html/banner/BannerContainer.html';
import ValidBannerCampaignJSON from 'json/campaigns/banner/ValidBannerCampaign.json';
import 'mocha';
import * as sinon from 'sinon';

import { asSpy, asStub } from 'TestHelpers/Functions';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { ICoreApi } from '../../../../../src/ts/Core/Core';

describe('BannerAdUnit', () => {

    let adUnit: BannerAdUnit;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let banner: BannerApi;
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
        nativeBridge = sinon.createStubInstance(NativeBridge);
        asStub(nativeBridge.getPlatform).returns(Platform.ANDROID);
        core = TestFixtures.getCoreApi(nativeBridge);
        const ads = TestFixtures.getAdsApi(nativeBridge);
        const banners = TestFixtures.getBannersApi(nativeBridge);
        core.Android!.Intent = sinon.createStubInstance(IntentApi);
        banners.Listener = sinon.createStubInstance(BannerListenerApi);

        banner = sinon.createStubInstance(BannerApi);
        (<any>banner).onBannerAttachedState = new Observable1<boolean>();
        (<any>banner).onBannerLoaded = new Observable0();
        (<any>banner).onBannerOpened = new Observable0();
        asStub(banner.load).callsFake(() => {
            return Promise.resolve().then(() => banner.onBannerLoaded.trigger());
        });
        banners.Banner = banner;

        deviceInfo = TestFixtures.getAndroidDeviceInfo();
        placement = TestFixtures.getPlacement();

        campaign = new BannerCampaign(getBannerCampaign(TestFixtures.getSession()));

        clientInfo = TestFixtures.getClientInfo();
        thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
        asStub(thirdPartyEventManager.sendEvent).resolves();

        webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
        (<any>webPlayerContainer).onPageFinished = new Observable1();
        (<any>webPlayerContainer).shouldOverrideUrlLoading = new Observable2();
        (<any>webPlayerContainer).onCreateWebView = new Observable2();
        asStub(webPlayerContainer.setData).callsFake(() => {
            return Promise.resolve().then(() => webPlayerContainer.onPageFinished.trigger('about:blank'));
        });
        asStub(webPlayerContainer.setEventSettings).resolves();
        asStub(webPlayerContainer.setSettings).resolves();

        adUnit = new BannerAdUnit({
            platform: nativeBridge.getPlatform(),
            core: TestFixtures.getCoreApi(nativeBridge),
            ads: TestFixtures.getAdsApi(nativeBridge),
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
                describe('on android', () => {
                    it('should set the proper settings', () => {
                        asStub(nativeBridge.getPlatform).returns(Platform.ANDROID);
                        return adUnit.load().then(() => {
                            sinon.assert.calledWith(asSpy(webPlayerContainer.setSettings), {
                                'setJavaScriptCanOpenWindowsAutomatically': [true],
                                'setSupportMultipleWindows': [false]
                            }, {});
                        });
                    });

                    it('should set up banner events disallowing the shouldOverrideUrlLoading event', () => {
                        return adUnit.load().then(() => {
                            const call = asSpy(webPlayerContainer.setEventSettings).getCall(0);
                            call.calledWith({
                                'onPageFinished': { 'sendEvent': true },
                                'shouldOverrideUrlLoading': { 'sendEvent': false, 'returnValue': true }
                            });
                        });
                    });
                });
                describe('on iOS', () => {
                    it('should set the proper settings', () => {
                        asStub(nativeBridge.getPlatform).returns(Platform.IOS);
                        return adUnit.load().then(() => {
                            sinon.assert.calledWith(asSpy(webPlayerContainer.setSettings), {
                                'javaScriptCanOpenWindowsAutomatically': true,
                                'scalesPagesToFit': true
                            }, {});
                        });
                    });
                    it('should set up banner events disallowing the createWindow event', () => {
                        return adUnit.load().then(() => {
                            const call = asSpy(webPlayerContainer.setEventSettings).getCall(0);
                            call.calledWith({
                                'onPageFinished': { 'sendEvent': true },
                                'onCreateWindow': { 'sendEvent': false }
                            });
                        });
                    });
                });
            });
        });

        describe('setting the markup', () => {
            it('should set the markup within the banner player', () => {
                return adUnit.load().then(() => {
                    const tpl = new Template(BannerContainer);
                    const markup = tpl.render({
                        markup: decodeURIComponent(campaign.getMarkup()!)
                    });
                    sinon.assert.calledWith(asSpy(webPlayerContainer.setData), markup, 'text/html', 'UTF-8');
                });
            });

            describe('when the page has finished', () => {
                describe('on android', () => {
                    it('should set up banner events with allowing the shouldOverrideUrlLoading event', () => {
                        return adUnit.load().then(() => {
                            const call = asSpy(webPlayerContainer.setEventSettings).getCall(1);
                            sinon.assert.calledWith(call, {
                                'onPageFinished': { 'sendEvent': true },
                                'shouldOverrideUrlLoading': { 'sendEvent': true, 'returnValue': true }
                            });
                        });
                    });
                });

                describe('on ios', () => {
                    it('should set up banner events with allowing the onCreateWindow event', () => {
                        asStub(nativeBridge.getPlatform).returns(Platform.IOS);
                        return adUnit.load().then(() => {
                            const call = asSpy(webPlayerContainer.setEventSettings).getCall(1);
                            sinon.assert.calledWith(call, {
                                'onPageFinished': { 'sendEvent': true },
                                'onCreateWindow': { 'sendEvent': true }
                            });
                        });
                    });
                });
            });
        });
    });

    describe('when the banner is clicked', () => {
        describe('on iOS', () => {
            it('should open the URL', () => {
                asStub(nativeBridge.getPlatform).returns(Platform.IOS);
                return adUnit.load().then(() => {
                    const url = 'http://unity3d.com';
                    webPlayerContainer.onCreateWebView.trigger(url);
                    sinon.assert.calledWith(asSpy(core.iOS!.UrlScheme.open), url);
                });
            });
        });

        describe('on Android', () => {
            it('should launch an intent with the given URL', () => {
                asStub(nativeBridge.getPlatform).returns(Platform.ANDROID);
                return adUnit.load().then(() => {
                    const url = 'http://unity3d.com';
                    webPlayerContainer.shouldOverrideUrlLoading.trigger(url, 'GET');
                    sinon.assert.calledWith(asSpy(core.Android!.Intent.launch), {
                        'action': 'android.intent.action.VIEW',
                        'uri': url
                    });
                });
            });
        });
    });

    describe('destroy', () => {
        it('should unsubscribe from the banner player override url loading observer', () => {
            return adUnit.load()
                .then(() => adUnit.destroy())
                .then(() => {
                    assert.equal((<any>webPlayerContainer.shouldOverrideUrlLoading)._observers.length, 0, 'Was still subscribed');
                });
        });
    });
});
