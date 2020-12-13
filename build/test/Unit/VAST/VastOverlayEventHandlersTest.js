import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager, TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { MoatViewabilityService } from 'Ads/Utilities/MoatViewabilityService';
import { MOAT } from 'Ads/Views/MOAT';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { Privacy } from 'Ads/Views/Privacy';
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
import { VastOverlayEventHandler } from 'VAST/EventHandlers/VastOverlayEventHandler';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { ObstructionReasons } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { VastStaticEndScreen } from 'VAST/Views/VastStaticEndScreen';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('VastOverlayEventHandlersTest', () => {
        let campaign;
        let overlay;
        let metaDataManager;
        let focusManager;
        let backend;
        let nativeBridge;
        let core;
        let ads;
        let store;
        let storageBridge;
        let vastAdUnit;
        let container;
        let sessionManager;
        let deviceInfo;
        let clientInfo;
        let thirdPartyEventManager;
        let request;
        let vastAdUnitParameters;
        let vastOverlayEventHandler;
        let moat;
        let sandbox;
        let privacy;
        let om;
        before(() => {
            sandbox = sinon.createSandbox();
        });
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            store = TestFixtures.getStoreApi(nativeBridge);
            storageBridge = new StorageBridge(core);
            focusManager = new FocusManager(platform, core);
            metaDataManager = new MetaDataManager(core);
            campaign = TestFixtures.getEventVastCampaign();
            clientInfo = TestFixtures.getClientInfo();
            const privacyManager = sinon.createStubInstance(UserPrivacyManager);
            privacy = new Privacy(platform, campaign, privacyManager, false, false, 'en');
            clientInfo = TestFixtures.getClientInfo(platform);
            if (platform === Platform.ANDROID) {
                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
                container = new Activity(core, ads, deviceInfo);
            }
            else if (platform === Platform.IOS) {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
                container = new ViewController(core, ads, deviceInfo, focusManager, clientInfo);
            }
            const placement = TestFixtures.getPlacement();
            const coreConfig = TestFixtures.getCoreConfiguration();
            const videoOverlayParameters = {
                deviceInfo: deviceInfo,
                campaign: campaign,
                coreConfig: coreConfig,
                placement: placement,
                clientInfo: clientInfo,
                platform: platform,
                ads: ads
            };
            overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
            const wakeUpManager = new WakeUpManager(core);
            request = new RequestManager(platform, core, wakeUpManager);
            thirdPartyEventManager = new ThirdPartyEventManager(core, request);
            sessionManager = new SessionManager(core, request, storageBridge);
            request = new RequestManager(platform, core, wakeUpManager);
            sinon.stub(request, 'followRedirectChain').callsFake((url) => {
                return Promise.resolve(url);
            });
            const privacySDK = sinon.createStubInstance(PrivacySDK);
            const adsConfig = TestFixtures.getAdsConfiguration();
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
                campaign: campaign,
                playerMetadataServerId: 'test-gamerSid',
                privacySDK: privacySDK,
                userPrivacyManager: privacyManager
            });
            const omInstance = sinon.createStubInstance(OpenMeasurement);
            const omViewBuilder = new OpenMeasurementAdViewBuilder(campaign);
            const omController = new VastOpenMeasurementController(platform, placement, [omInstance], omViewBuilder, clientInfo, deviceInfo);
            sandbox.stub(omController, 'skipped');
            sandbox.stub(omController, 'setDeviceVolume');
            sandbox.stub(omController, 'geometryChange');
            sandbox.stub(omController, 'sessionFinish');
            sandbox.stub(omController, 'volumeChange');
            vastAdUnitParameters = {
                platform,
                core,
                ads,
                store,
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: placement,
                campaign: campaign,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                request: request,
                options: {},
                endScreen: undefined,
                overlay: overlay,
                video: campaign.getVideo(),
                privacyManager: privacyManager,
                privacy,
                om: omController,
                privacySDK: privacySDK
            };
            vastAdUnit = new VastAdUnit(vastAdUnitParameters);
            vastOverlayEventHandler = new VastOverlayEventHandler(vastAdUnit, vastAdUnitParameters);
            moat = sinon.createStubInstance(MOAT);
            sandbox.stub(MoatViewabilityService, 'getMoat').returns(moat);
            sandbox.stub(vastAdUnit, 'getOpenMeasurementController').returns(vastAdUnitParameters.om);
            om = vastAdUnitParameters.om;
            sandbox.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
        });
        afterEach(() => {
            sandbox.restore();
            vastAdUnit.setShowing(true);
            return vastAdUnit.hide();
        });
        describe('When calling onSkip', () => {
            beforeEach(() => {
                sinon.spy(vastAdUnit, 'hide');
            });
            it('should hide ad unit', () => {
                vastOverlayEventHandler.onOverlaySkip(1);
                sinon.assert.called(vastAdUnit.hide);
            });
            it('should fire viewability skip event along with session finish', () => {
                vastAdUnit.setShowing(true);
                return vastAdUnit.hide().then(() => {
                    vastAdUnit = new VastAdUnit(vastAdUnitParameters);
                    vastOverlayEventHandler = new VastOverlayEventHandler(vastAdUnit, vastAdUnitParameters);
                    vastOverlayEventHandler.onOverlaySkip(1);
                    sinon.assert.called(om.skipped);
                    sinon.assert.called(om.sessionFinish);
                });
            });
            it('should show endcard', () => {
                vastAdUnit.setShowing(true);
                return vastAdUnit.hide().then(() => {
                    const vastEndScreen = new VastStaticEndScreen(vastAdUnitParameters);
                    sinon.spy(vastEndScreen, 'show');
                    vastAdUnitParameters.endScreen = vastEndScreen;
                    vastAdUnit = new VastAdUnit(vastAdUnitParameters);
                    vastAdUnit.setImpressionOccurred();
                    sinon.spy(vastAdUnit, 'hide');
                    vastOverlayEventHandler = new VastOverlayEventHandler(vastAdUnit, vastAdUnitParameters);
                    vastOverlayEventHandler.onOverlaySkip(1);
                    sinon.assert.called(vastEndScreen.show);
                });
            });
            it('should not show endcard if the impression has not occurred', () => {
                vastAdUnit.setShowing(true);
                return vastAdUnit.hide().then(() => {
                    const vastEndScreen = new VastStaticEndScreen(vastAdUnitParameters);
                    sinon.spy(vastEndScreen, 'show');
                    vastAdUnitParameters.endScreen = vastEndScreen;
                    vastAdUnit = new VastAdUnit(vastAdUnitParameters);
                    sinon.spy(vastAdUnit, 'hide');
                    vastOverlayEventHandler = new VastOverlayEventHandler(vastAdUnit, vastAdUnitParameters);
                    vastOverlayEventHandler.onOverlaySkip(1);
                    sinon.assert.notCalled(vastEndScreen.show);
                });
            });
        });
        describe('When calling onMute', () => {
            beforeEach(() => {
                vastAdUnit.setShowing(true);
                return vastAdUnit.hide().then(() => {
                    vastAdUnit = new VastAdUnit(vastAdUnitParameters);
                    vastAdUnit.setVolume(1);
                    vastOverlayEventHandler = new VastOverlayEventHandler(vastAdUnit, vastAdUnitParameters);
                });
            });
            const testMuteEvent = (muted) => {
                const eventName = muted ? TrackingEvent.MUTE : TrackingEvent.UNMUTE;
                const mockEventManager = sinon.mock(thirdPartyEventManager);
                mockEventManager.expects('sendTrackingEvents').withArgs(campaign, eventName, 'vast');
                vastOverlayEventHandler.onOverlayMute(muted);
                mockEventManager.verify();
            };
            it('sends mute events from VAST', () => {
                // given a VAST placement
                // when the session manager is told that the video has been muted
                // then the VAST mute callback URL should be requested by the event manager
                testMuteEvent(true);
            });
            it('sends unmute events from VAST', () => {
                // given a VAST placement
                // when the session manager is told that the video has been unmuted
                // then the VAST unmute callback URL should be requested by the event manager
                testMuteEvent(false);
            });
            it('should call viewability volumeChange when mute is true', () => {
                vastOverlayEventHandler.onOverlayMute(true);
                sinon.assert.calledWith(moat.setPlayerVolume, 0);
                sinon.assert.calledWith(moat.volumeChange, 1);
                sinon.assert.callOrder(moat.setPlayerVolume, moat.volumeChange);
                sinon.assert.calledWith(om.setDeviceVolume, 1);
                sinon.assert.calledWith(om.volumeChange, 0);
            });
            it('should call viewability volumeChange when mute is false', () => {
                vastOverlayEventHandler.onOverlayMute(false);
                sinon.assert.calledWith(moat.setPlayerVolume, 1);
                sinon.assert.calledWith(moat.volumeChange, 1);
                sinon.assert.callOrder(moat.setPlayerVolume, moat.volumeChange);
                sinon.assert.calledWith(om.setDeviceVolume, 1);
                sinon.assert.calledWith(om.volumeChange, 1);
            });
        });
        describe('When calling onCallButton', () => {
            beforeEach(() => {
                sinon.spy(ads.VideoPlayer, 'pause');
                sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
                sinon.stub(vastAdUnit, 'sendVideoClickTrackingEvent').returns(sinon.spy());
            });
            it('should track clicks for viewability', () => {
                vastOverlayEventHandler.onOverlayCallButton().then(() => {
                    sinon.assert.called(om.adUserInteraction);
                });
            });
            if (platform === Platform.IOS) {
                it('should call video click through tracking url', () => {
                    sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
                    sinon.stub(core.iOS.UrlScheme, 'open').resolves();
                    vastOverlayEventHandler.onOverlayCallButton().then(() => {
                        sinon.assert.calledOnce(vastAdUnit.sendVideoClickTrackingEvent);
                    });
                });
                it('should open click trough link in iOS web browser when call button is clicked', () => {
                    sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
                    sinon.stub(core.iOS.UrlScheme, 'open').resolves();
                    vastOverlayEventHandler.onOverlayCallButton().then(() => {
                        sinon.assert.calledWith(core.iOS.UrlScheme.open, 'http://foo.com');
                    });
                });
            }
            if (platform === Platform.ANDROID) {
                it('should open click trough link in Android web browser when call button is clicked', () => {
                    sinon.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
                    sinon.stub(core.Android.Intent, 'launch').resolves();
                    vastOverlayEventHandler.onOverlayCallButton().then(() => {
                        sinon.assert.calledWith(core.Android.Intent.launch, {
                            'action': 'android.intent.action.VIEW',
                            'uri': 'http://foo.com'
                        });
                    });
                });
            }
        });
        describe('When calling onShowPrivacyPopUp', () => {
            beforeEach(() => {
                sinon.stub(om.getOMAdViewBuilder(), 'buildVastAdView');
                return vastOverlayEventHandler.onShowPrivacyPopUp(20, 20, 517, 367);
            });
            it('should fire geometry change as a percentage of the adview', () => {
                const obstructionReason = [ObstructionReasons.OBSTRUCTED];
                const rect = OpenMeasurementUtilities.createRectangle(20, 20, 517, 367);
                sinon.assert.calledWith(om.getOMAdViewBuilder().buildVastAdView, obstructionReason, rect);
                sinon.assert.called(om.geometryChange);
            });
        });
        describe('When calling onClosePrivacyPopUp', () => {
            beforeEach(() => {
                sinon.stub(om.getOMAdViewBuilder(), 'buildVastAdView').returns(Promise.resolve([]));
                return vastOverlayEventHandler.onClosePrivacyPopUp();
            });
            it('should fire geometry change as a percentage of the adview', () => {
                sinon.assert.calledWith(om.getOMAdViewBuilder().buildVastAdView, []);
                sinon.assert.called(om.geometryChange);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdE92ZXJsYXlFdmVudEhhbmRsZXJzVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9WQVNUL1Zhc3RPdmVybGF5RXZlbnRIYW5kbGVyc1Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQzNELE9BQU8sRUFBbUIsV0FBVyxFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDdEYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRXZFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQ3pGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsYUFBYSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDNUYsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDOUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3RDLE9BQU8sRUFBRSxZQUFZLEVBQTJCLE1BQU0sd0JBQXdCLENBQUM7QUFDL0UsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTVDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFRNUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxN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