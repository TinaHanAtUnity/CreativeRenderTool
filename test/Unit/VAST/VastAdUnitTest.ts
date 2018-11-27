import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IAdsApi } from 'Ads/IAds';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Video } from 'Ads/Models/Assets/Video';
import { Placement } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Overlay } from 'Ads/Views/Overlay';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

import { IVastAdUnitParameters, VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { IVastEndscreenParameters, VastEndScreen } from 'VAST/Views/VastEndScreen';

import EventTestVast from 'xml/EventTestVast.xml';
import { IARApi } from 'AR/AR';
import { IPurchasingApi } from 'Purchasing/IPurchasing';

describe('VastAdUnitTest', () => {

    let sandbox: sinon.SinonSandbox;
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let ar: IARApi;
    let purchasing: IPurchasingApi;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let vastAdUnit: VastAdUnit;
    let focusManager: FocusManager;
    let vastAdUnitParameters: IVastAdUnitParameters;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let placement: Placement;
    let vastCampaign: VastCampaign;

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(() => {
        const vastParser = TestFixtures.getVastParser();

        const vastXml = EventTestVast;

        const vast = vastParser.parseVast(vastXml);

        placement = new Placement({
            id: '123',
            name: 'test',
            default: true,
            allowSkip: true,
            skipInSeconds: 5,
            disableBackButton: true,
            useDeviceOrientationForVideo: false,
            muteVideo: false
        });

        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        ar = TestFixtures.getARApi(nativeBridge);
        purchasing = TestFixtures.getPurchasingApi(nativeBridge);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        const storageBridge = new StorageBridge(core);
        focusManager = new FocusManager(platform, core);
        const wakeUpManager = new WakeUpManager(core);
        const request = new RequestManager(platform, core, wakeUpManager);
        const activity = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
        thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        vastCampaign = TestFixtures.getEventVastCampaign();
        const video = vastCampaign.getVideo();
        const coreConfig = TestFixtures.getCoreConfiguration();
        const adsConfig = TestFixtures.getAdsConfiguration();

        let duration = vastCampaign.getVast().getDuration();
        if(duration) {
            duration = duration * 1000;
            video.setDuration(duration);
        }

        const sessionManager = new SessionManager(core, request, storageBridge);
        const metaDataManager = new MetaDataManager(core);
        const operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            platform,
            core,
            ads,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            storageBridge: storageBridge,
            campaign: vastCampaign
        });

        const privacyManager = sinon.createStubInstance(UserPrivacyManager);
        const privacy = new Privacy(platform, vastCampaign, privacyManager, adsConfig.isGDPREnabled(), coreConfig.isCoppaCompliant());
        const overlay = new Overlay(platform, ads, deviceInfo, false, 'en', clientInfo.getGameId(), privacy, false);
        const programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

        vastAdUnitParameters = {
            platform,
            core,
            ads,
            ar,
            purchasing,
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: focusManager,
            container: activity,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: placement,
            campaign: vastCampaign,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            request: request,
            options: {},
            endScreen: undefined,
            overlay: overlay,
            video: video,
            privacyManager: privacyManager,
            programmaticTrackingService: programmaticTrackingService
        };

        vastAdUnit = new VastAdUnit(vastAdUnitParameters);
    });

    afterEach(() => sandbox.restore());

    describe('with click through url', () => {
        beforeEach(() => {
            const video = new Video('', TestFixtures.getSession());
            vastCampaign = TestFixtures.getEventVastCampaign();
            sinon.stub(vastCampaign, 'getVideo').returns(video);
            const privacyManager = sinon.createStubInstance(UserPrivacyManager);
            const privacy = new Privacy(platform, vastCampaign, privacyManager, false, false);
            const overlay = new Overlay(platform, ads, deviceInfo, false, 'en', clientInfo.getGameId(), privacy, false);
            vastAdUnitParameters.overlay = overlay;
            vastAdUnitParameters.campaign = vastCampaign;
            vastAdUnit = new VastAdUnit(vastAdUnitParameters);
        });

        it('should return correct http:// url', () => {
            sandbox.stub(vastCampaign.getVast(), 'getVideoClickThroughURL').returns('http://www.example.com/wpstyle/?p=364');

            const clickThroughURL = vastAdUnit.getVideoClickThroughURL();
            assert.equal(clickThroughURL, 'http://www.example.com/wpstyle/?p=364');
        });

        it('should return correct https:// url', () => {
            sandbox.stub(vastCampaign.getVast(), 'getVideoClickThroughURL').returns('https://www.example.com/foo/?bar=baz&inga=42&quux');
            const clickThroughURL = vastAdUnit.getVideoClickThroughURL();
            assert.equal(clickThroughURL, 'https://www.example.com/foo/?bar=baz&inga=42&quux');
        });

        it('should return null for malformed url', () => {
            sandbox.stub(vastCampaign.getVast(), 'getVideoClickThroughURL').returns('www.foo.com');
            const clickThroughURL = vastAdUnit.getVideoClickThroughURL();
            assert.equal(clickThroughURL, null);
        });

        it('should return null for a deeplink to an app', () => {
            sandbox.stub(vastCampaign.getVast(), 'getVideoClickThroughURL').returns('myapp://details?id=foo');
            const clickThroughURL = vastAdUnit.getVideoClickThroughURL();
            assert.equal(clickThroughURL, null);
        });

        it('should call video click tracking url', () => {
            sandbox.stub(vastCampaign.getVast(), 'getVideoClickTrackingURLs').returns(['https://www.example.com/foo/?bar=baz&inga=42&quux', 'http://wwww.tremor.com/click']);
            sandbox.stub(thirdPartyEventManager, 'sendWithGet').returns(null);
            vastAdUnit.sendVideoClickTrackingEvent('foo');
            sinon.assert.calledTwice(<sinon.SinonSpy>thirdPartyEventManager.sendWithGet);
        });

        it('should not call thirdPartyEvent if there are no tracking urls', () => {
            sandbox.stub(vastCampaign.getVast(), 'getVideoClickTrackingURLs').returns([]);
            sandbox.stub(thirdPartyEventManager, 'sendWithGet').returns(null);
            vastAdUnit.sendVideoClickTrackingEvent('foo');
            sinon.assert.notCalled(<sinon.SinonSpy>thirdPartyEventManager.sendWithGet);
        });
    });

    describe('VastAdUnit progress event test', () => {
        it('sends video click through tracking event from VAST', () => {
            const mockEventManager = sinon.mock(thirdPartyEventManager);
            mockEventManager.expects('sendWithGet').withArgs('vast video click', '123', 'http://myTrackingURL.com/click');

            vastAdUnit.sendVideoClickTrackingEvent('123');
            mockEventManager.verify();
        });
    });

    describe('with companion ad', () => {
        let vastEndScreen: VastEndScreen;
        let vastEndScreenParameters: IVastEndscreenParameters;

        beforeEach(() => {

            vastEndScreenParameters = {
                campaign: vastAdUnitParameters.campaign,
                clientInfo: vastAdUnitParameters.clientInfo,
                seatId: vastAdUnitParameters.campaign.getSeatId()
            };

            const video = new Video('', TestFixtures.getSession());
            vastCampaign = TestFixtures.getCompanionVastCampaign();
            sinon.stub(vastCampaign, 'getVideo').returns(video);
            const privacyManager = sinon.createStubInstance(UserPrivacyManager);
            const privacy = new Privacy(platform, vastCampaign, privacyManager, false, false);
            const overlay = new Overlay(platform, ads, deviceInfo, false, 'en', clientInfo.getGameId(), privacy, false);
            vastEndScreen = new VastEndScreen(platform, vastEndScreenParameters, privacy);
            vastAdUnitParameters.overlay = overlay;
            vastAdUnitParameters.campaign = vastCampaign;
            vastAdUnitParameters.endScreen = vastEndScreen;
            vastAdUnit = new VastAdUnit(vastAdUnitParameters);
        });

        it('should return correct companion click through url', () => {
            sandbox.stub(vastCampaign.getVast(), 'getCompanionClickThroughUrl').returns('http://www.example.com/wpstyle/?p=364');

            const clickThroughURL = vastAdUnit.getCompanionClickThroughUrl();
            assert.equal(clickThroughURL, 'http://www.example.com/wpstyle/?p=364');
        });

        it('should return null when companion click through url is invalid', () => {
            sandbox.stub(vastCampaign.getVast(), 'getCompanionClickThroughUrl').returns('blah');

            const clickThroughURL = vastAdUnit.getCompanionClickThroughUrl();
            assert.equal(clickThroughURL, null);
        });

        it('should return endscreen', () => {
            const endScreen = vastAdUnit.getEndScreen();
            assert.equal(endScreen, vastEndScreen);
        });

        it('it should fire companion tracking events', () => {
            const mockEventManager = sinon.mock(thirdPartyEventManager);
            const companionTrackingUrls = vastCampaign.getVast().getCompanionCreativeViewTrackingUrls();
            const useWebViewUserAgentForTracking = vastCampaign.getUseWebViewUserAgentForTracking();
            assert.isTrue(companionTrackingUrls.length > 0); // make sure that there are tracking urls
            for (const companionTrackingUrl of companionTrackingUrls) {
                // make each tracking url expected.
                mockEventManager.expects('sendWithGet').withExactArgs('companion', '123', companionTrackingUrl, useWebViewUserAgentForTracking);
            }
            vastAdUnit.sendCompanionTrackingEvent('123');
            mockEventManager.verify();
        });

        it('should hide and then remove endscreen on hide', () => {
            sinon.stub(vastEndScreen, 'hide');
            sinon.stub(vastEndScreen, 'remove');
            vastAdUnit.hide();
            return new Promise((resolve, reject) => {
                setTimeout(resolve, 500);
            }).then(() => {
                sinon.assert.called(<sinon.SinonSpy>vastEndScreen.hide);
                sinon.assert.called(<sinon.SinonSpy>vastEndScreen.remove);
            });
        });
    });
});
