import 'mocha';

import { BannerAdUnit, StandardBannerHeight, StandardBannerWidth } from 'AdTypes/Banner/AdUnits/BannerAdUnit';
import { BannerCampaign, IBannerCampaign } from 'AdTypes/Banner/Models/Campaigns/BannerCampaign';
import { AdUnitContainer, Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { assert } from 'chai';
import { Platform } from 'Constants/Platform';
import ValidBannerCampaignJSON from 'json/campaigns/banner/ValidBannerCampaign.json';
import { FocusManager } from 'Managers/FocusManager';
import { GdprManager } from 'Managers/GdprManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Placement } from 'Models/Placement';
import { Session } from 'Models/Session';
import { BannerApi } from 'Native/Api/Banner';
import { IntentApi } from 'Native/Api/Intent';
import { BannerListenerApi } from 'Native/Api/UnityBannerListener';
import { UrlSchemeApi } from 'Native/Api/UrlScheme';
import { WebPlayerApi } from 'Native/Api/WebPlayer';
import { NativeBridge } from 'Native/NativeBridge';
import * as sinon from 'sinon';
import { Observable0, Observable1, Observable2 } from 'Utilities/Observable';
import { Request } from 'Utilities/Request';
import { Template } from 'Utilities/Template';

import { asSpy, asStub } from '../../../TestHelpers/Functions';
import { TestFixtures } from '../../../TestHelpers/TestFixtures';

import BannerContainer from 'html/banner/BannerContainer.html';
import { WebPlayerContainer } from 'Utilities/WebPlayer/WebPlayerContainer';

describe('BannerAdUnit', () => {

    let adUnit: BannerAdUnit;
    let nativeBridge: NativeBridge;
    let banner: BannerApi;
    let deviceInfo: DeviceInfo;
    let placement: Placement;
    let campaign: BannerCampaign;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let webPlayerContainer: WebPlayerContainer;
    let isOpened = false;

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
        nativeBridge.UrlScheme = sinon.createStubInstance(UrlSchemeApi);
        nativeBridge.Intent = sinon.createStubInstance(IntentApi);
        nativeBridge.BannerListener = sinon.createStubInstance(BannerListenerApi);

        banner = sinon.createStubInstance(BannerApi);
        (<any>banner).onBannerAttachedState = new Observable1<boolean>();
        (<any>banner).onBannerLoaded = new Observable0();
        (<any>banner).onBannerOpened = new Observable0();
        asStub(banner.isOpened).callsFake(() => {
            if (nativeBridge.getPlatform() === Platform.ANDROID) {
                return Promise.resolve().then(() => banner.onBannerAttachedState.trigger(isOpened));
            }
            return Promise.resolve(isOpened);
        });
        asStub(banner.load).callsFake(() => {
            return Promise.resolve().then(() => banner.onBannerLoaded.trigger());
        });
        nativeBridge.Banner = banner;

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

        isOpened = false;

        adUnit = new BannerAdUnit(nativeBridge, {
            campaign,
            placement,
            deviceInfo,
            clientInfo,
            webPlayerContainer,
            thirdPartyEventManager,
            forceOrientation: Orientation.NONE,
            focusManager: sinon.createStubInstance(FocusManager),
            container: sinon.createStubInstance(AdUnitContainer),
            operativeEventManager: sinon.createStubInstance(OperativeEventManager),
            configuration: TestFixtures.getConfiguration(),
            request: sinon.createStubInstance(Request),
            gdprManager: sinon.createStubInstance(GdprManager),
            options: {}
        });
    });

    describe('show', () => {
        describe('opening the banner', () => {
            describe('on iOS', () => {

                beforeEach(() => {
                    (<any>adUnit)._deviceInfo = TestFixtures.getFakeNativeIosDeviceInfo();
                    asStub(nativeBridge.getPlatform).returns(Platform.IOS);
                });

                describe('and it is already opened', () => {
                    it('should not be opened again', () => {
                        isOpened = true;
                        return adUnit.show().then(() => {
                            sinon.assert.notCalled(asSpy(banner.load));
                        });
                    });
                });
                it('should open the banner with no screen scale applied', () => {
                    const w = StandardBannerWidth,
                          h = StandardBannerHeight;
                    return adUnit.show().then(() => {
                        sinon.assert.calledWith(asSpy(banner.load), ['bannerplayer'], 'bottomcenter', w, h);
                    });
                });
            });

            describe('on android', () => {
                describe('and it is already opened', () => {
                    it('should not be opened again', () => {
                        isOpened = true;
                        return adUnit.show().then(() => {
                            sinon.assert.notCalled(asSpy(banner.load));
                        });
                    });
                });

                it('should open the banner with screen scaling applied', () => {
                    const info = TestFixtures.getAndroidDeviceInfo();
                    const w = StandardBannerWidth * (info.getScreenDensity() / 160.0),
                          h = StandardBannerHeight * (info.getScreenDensity() / 160.0);
                    (<any>adUnit)._deviceInfo = info;
                    return adUnit.show().then(() => {
                        sinon.assert.calledWith(asSpy(banner.load), ['bannerplayer'], 'bottomcenter', w, h);
                    });
                });
            });
        });

        describe('setting up the banner player', () => {
            describe('setting banner settings', () => {
                describe('on android', () => {
                    it('should set the proper settings', () => {
                        asStub(nativeBridge.getPlatform).returns(Platform.ANDROID);
                        return adUnit.show().then(() => {
                            sinon.assert.calledWith(asSpy(webPlayerContainer.setSettings), {
                                'setJavaScriptCanOpenWindowsAutomatically': [true],
                                'setSupportMultipleWindows': [false]
                            }, {});
                        });
                    });

                    it('should set up banner events disallowing the shouldOverrideUrlLoading event', () => {
                        return adUnit.show().then(() => {
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
                        return adUnit.show().then(() => {
                            sinon.assert.calledWith(asSpy(webPlayerContainer.setSettings), {
                                'javaScriptCanOpenWindowsAutomatically': true,
                                'scalesPagesToFit': true
                            }, {});
                        });
                    });
                    it('should set up banner events disallowing the createWindow event', () => {
                        return adUnit.show().then(() => {
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
                return adUnit.show().then(() => {
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
                        return adUnit.show().then(() => {
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
                        return adUnit.show().then(() => {
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

        describe('sending start tracking events', () => {
            describe('with the send flag as true', () => {
                xit('should trigger onStart', () => {
                    const spy = sinon.spy();
                    adUnit.onStart.subscribe(spy);
                    return adUnit.show().then(() => {
                        sinon.assert.called(spy);
                    });
                });
                xit('should send the "impression" tracking event', () => {
                    const urls = campaign.getTrackingUrlsForEvent('impression');
                    return adUnit.show().then(() => {
                        const sdkVersion = clientInfo.getSdkVersion();
                        const placementId = placement.getId();
                        const sessionId = campaign.getSession().getId();
                        for (let url of urls) {
                            url = url.replace(/%ZONE%/, placementId);
                            url = url.replace(/%SDK_VERSION%/, sdkVersion.toString());
                            sinon.assert.calledWith(asSpy(thirdPartyEventManager.sendEvent), 'banner impression', sessionId, url, campaign.getUseWebViewUserAgentForTracking());
                        }
                    });
                });

            });
        });
    });

    describe('when the banner is clicked', () => {
        describe('on iOS', () => {
            it('should open the URL', () => {
                asStub(nativeBridge.getPlatform).returns(Platform.IOS);
                return adUnit.show().then(() => {
                    const url = 'http://unity3d.com';
                    webPlayerContainer.onCreateWebView.trigger(url);
                    sinon.assert.calledWith(asSpy(nativeBridge.UrlScheme.open), url);
                });
            });
        });

        describe('on Android', () => {
            it('should launch an intent with the given URL', () => {
                asStub(nativeBridge.getPlatform).returns(Platform.ANDROID);
                return adUnit.show().then(() => {
                    const url = 'http://unity3d.com';
                    webPlayerContainer.shouldOverrideUrlLoading.trigger(url, 'GET');
                    sinon.assert.calledWith(asSpy(nativeBridge.Intent.launch), {
                        'action': 'android.intent.action.VIEW',
                        'uri': url
                    });
                });
            });
        });
    });

    describe('hide', () => {
        it('should unsubscribe from the banner player override url loading observer', () => {
            return adUnit.show()
                .then(() => adUnit.hide())
                .then(() => {
                    assert.equal((<any>webPlayerContainer.shouldOverrideUrlLoading)._observers.length, 0, 'Was still subscribed');
                });
        });
    });
});
