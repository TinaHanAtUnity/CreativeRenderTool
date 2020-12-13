import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Video } from 'Ads/Models/Assets/Video';
import { Placement } from 'Ads/Models/Placement';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { Privacy } from 'Ads/Views/Privacy';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import EventTestVast from 'xml/EventTestVast.xml';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { VastStaticEndScreen } from 'VAST/Views/VastStaticEndScreen';
describe('VastAdUnitTest', () => {
    let sandbox;
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let store;
    let thirdPartyEventManager;
    let vastAdUnit;
    let focusManager;
    let vastAdUnitParameters;
    let deviceInfo;
    let clientInfo;
    let placement;
    let vastCampaign;
    let videoOverlayParameters;
    let coreConfig;
    let omController;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(() => {
        const vastParser = TestFixtures.getVastParserStrict();
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
            skipEndCardOnClose: false,
            disableVideoControlsFade: false,
            useCloseIconInsteadOfSkipIcon: false,
            adTypes: [],
            refreshDelay: 1000,
            muteVideo: false
        });
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        store = TestFixtures.getStoreApi(nativeBridge);
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
        coreConfig = TestFixtures.getCoreConfiguration();
        const adsConfig = TestFixtures.getAdsConfiguration();
        const privacySDK = sinon.createStubInstance(PrivacySDK);
        const privacyManager = sinon.createStubInstance(UserPrivacyManager);
        let duration = vastCampaign.getVast().getDuration();
        if (duration) {
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
            campaign: vastCampaign,
            playerMetadataServerId: 'test-gamerSid',
            privacySDK: privacySDK,
            userPrivacyManager: privacyManager
        });
        const privacy = new Privacy(platform, vastCampaign, privacyManager, privacySDK.isGDPREnabled(), coreConfig.isCoppaCompliant(), 'en');
        const campaign = TestFixtures.getCampaign();
        videoOverlayParameters = {
            deviceInfo: deviceInfo,
            campaign: campaign,
            coreConfig: coreConfig,
            placement: placement,
            clientInfo: clientInfo,
            platform: platform,
            ads: ads
        };
        const overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
        const omInstance = sinon.createStubInstance(OpenMeasurement);
        const omViewBuilder = new OpenMeasurementAdViewBuilder(vastCampaign);
        const vastOMController = new VastOpenMeasurementController(platform, placement, [omInstance], omViewBuilder, clientInfo, deviceInfo);
        sandbox.stub(vastOMController, 'geometryChange');
        sandbox.stub(vastOMController, 'resume');
        sandbox.stub(vastOMController, 'pause');
        sandbox.stub(vastOMController, 'removeFromViewHieararchy');
        vastAdUnitParameters = {
            platform,
            core,
            ads,
            store,
            privacy,
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
            om: vastOMController,
            privacySDK: privacySDK
        };
        vastAdUnit = new VastAdUnit(vastAdUnitParameters);
        omController = vastAdUnitParameters.om;
    });
    afterEach(() => {
        sandbox.restore();
        vastAdUnit.setShowing(true);
        return vastAdUnit.hide();
    });
    describe('with click through url', () => {
        beforeEach(() => {
            vastAdUnit.setShowing(true);
            return vastAdUnit.hide().then(() => {
                const video = new Video('', TestFixtures.getSession());
                vastCampaign = TestFixtures.getEventVastCampaign();
                sinon.stub(vastCampaign, 'getVideo').returns(video);
                const privacyManager = sinon.createStubInstance(UserPrivacyManager);
                const privacy = new Privacy(platform, vastCampaign, privacyManager, false, false, 'en');
                videoOverlayParameters = {
                    deviceInfo: deviceInfo,
                    campaign: vastCampaign,
                    coreConfig: coreConfig,
                    placement: placement,
                    clientInfo: clientInfo,
                    platform: platform,
                    ads: ads
                };
                vastAdUnitParameters.overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
                vastAdUnitParameters.campaign = vastCampaign;
                vastAdUnit = new VastAdUnit(vastAdUnitParameters);
            });
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
            sinon.assert.calledTwice(thirdPartyEventManager.sendWithGet);
        });
        it('should not call thirdPartyEvent if there are no tracking urls', () => {
            sandbox.stub(vastCampaign.getVast(), 'getVideoClickTrackingURLs').returns([]);
            sandbox.stub(thirdPartyEventManager, 'sendWithGet').returns(null);
            vastAdUnit.sendVideoClickTrackingEvent('foo');
            sinon.assert.notCalled(thirdPartyEventManager.sendWithGet);
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
        let vastEndScreen;
        beforeEach(() => {
            vastAdUnit.setShowing(true);
            return vastAdUnit.hide().then(() => {
                const video = new Video('', TestFixtures.getSession());
                vastCampaign = TestFixtures.getCompanionStaticVastCampaign();
                sinon.stub(vastCampaign, 'getVideo').returns(video);
                const privacyManager = sinon.createStubInstance(UserPrivacyManager);
                const privacy = new Privacy(platform, vastCampaign, privacyManager, false, false, 'en');
                videoOverlayParameters = {
                    deviceInfo: deviceInfo,
                    campaign: vastCampaign,
                    coreConfig: coreConfig,
                    placement: placement,
                    clientInfo: clientInfo,
                    platform: platform,
                    ads: ads
                };
                vastAdUnitParameters.overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
                vastEndScreen = new VastStaticEndScreen(vastAdUnitParameters);
                vastAdUnitParameters.campaign = vastCampaign;
                vastAdUnitParameters.endScreen = vastEndScreen;
                vastAdUnit = new VastAdUnit(vastAdUnitParameters);
            });
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
            sinon.spy(vastEndScreen, 'hide');
            sinon.spy(vastEndScreen, 'remove');
            vastAdUnit.hide();
            return new Promise((resolve, reject) => {
                setTimeout(resolve, 500);
            }).then(() => {
                sinon.assert.called(vastEndScreen.hide);
                sinon.assert.called(vastEndScreen.remove);
            });
        });
    });
    it('should hide and then remove om on hide', () => {
        return vastAdUnit.hide().then(() => {
            return new Promise((resolve, reject) => {
                setTimeout(resolve, 500);
            }).then(() => {
                sinon.assert.called(omController.removeFromViewHieararchy);
            });
        });
    });
    describe('viewability', () => {
        describe('onContainerBackground', () => {
            it('should fire open measurement pause', () => {
                vastAdUnit.setShowing(true);
                sinon.stub(vastAdUnit, 'canShowVideo').returns(true);
                vastAdUnit.onContainerBackground();
                sinon.assert.called(omController.pause);
            });
        });
        describe('onContainerForeground', () => {
            it('should fire open measurement resume', () => {
                vastAdUnit.setShowing(true);
                sinon.stub(vastAdUnit, 'canShowVideo').returns(true);
                vastAdUnit.onContainerForeground();
                sinon.assert.called(omController.resume);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdEFkVW5pdFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvVkFTVC9WYXN0QWRVbml0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDM0QsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBRXJFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQ3pGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM3RSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDaEQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxZQUFZLEVBQTJCLE1BQU0sd0JBQXdCLENBQUM7QUFDL0UsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTVDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDaEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUk1RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxPQUFPLENBQUM7QUFDZixP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