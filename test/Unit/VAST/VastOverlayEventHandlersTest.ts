import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { IAdsApi } from 'Ads/IAds';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { MoatViewabilityService } from 'Ads/Utilities/MoatViewabilityService';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { MOAT } from 'Ads/Views/MOAT';
import { VideoOverlay, IVideoOverlayParameters } from 'Ads/Views/VideoOverlay';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { Campaign } from 'Ads/Models/Campaign';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IVastAdUnitParameters, VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { VastOverlayEventHandler } from 'VAST/EventHandlers/VastOverlayEventHandler';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { IVastEndscreenParameters, VastEndScreen } from 'VAST/Views/VastEndScreen';
import { IStoreApi } from 'Store/IStore';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('VastOverlayEventHandlersTest', () => {
        let campaign: VastCampaign;
        let overlay: VideoOverlay;
        let metaDataManager: MetaDataManager;
        let focusManager: FocusManager;

        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let ads: IAdsApi;
        let store: IStoreApi;
        let storageBridge: StorageBridge;
        let vastAdUnit: VastAdUnit;
        let container: AdUnitContainer;
        let sessionManager: SessionManager;
        let deviceInfo: DeviceInfo;
        let clientInfo: ClientInfo;
        let thirdPartyEventManager: ThirdPartyEventManager;
        let request: RequestManager;
        let vastAdUnitParameters: IVastAdUnitParameters;
        let vastOverlayEventHandler: VastOverlayEventHandler;
        let moat: MOAT;
        let sandbox: sinon.SinonSandbox;
        let privacy: Privacy;
        let programmaticTrackingService: ProgrammaticTrackingService;

        before(() => {
            sandbox = sinon.sandbox.create();
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
            privacy = new Privacy(platform, campaign, privacyManager, false, false);

            clientInfo = TestFixtures.getClientInfo(platform);

            if(platform === Platform.ANDROID) {
                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
                container = new Activity(core, ads, <AndroidDeviceInfo>deviceInfo);
            } else if(platform === Platform.IOS) {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
                container = new ViewController(core, ads, <IosDeviceInfo>deviceInfo, focusManager, clientInfo);
            }
            const placement = TestFixtures.getPlacement();
            const coreConfig = TestFixtures.getCoreConfiguration();

            const videoOverlayParameters: IVideoOverlayParameters<Campaign> = {
                deviceInfo: deviceInfo,
                campaign: campaign,
                coreConfig: coreConfig,
                placement: placement,
                clientInfo: clientInfo,
                platform: platform,
                ads: ads
            };
            overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);

            programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

            const wakeUpManager = new WakeUpManager(core);
            request = new RequestManager(platform, core, wakeUpManager);

            thirdPartyEventManager = new ThirdPartyEventManager(core, request);
            sessionManager = new SessionManager(core, request, storageBridge);
            request = new RequestManager(platform, core, wakeUpManager);
            sinon.stub(request, 'followRedirectChain').callsFake((url) => {
                return Promise.resolve(url);
            });

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
                playerMetadataServerId: 'test-gamerSid'
            });

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
                programmaticTrackingService: programmaticTrackingService,
                privacy
            };

            vastAdUnit = new VastAdUnit(vastAdUnitParameters);
            vastOverlayEventHandler = new VastOverlayEventHandler(vastAdUnit, vastAdUnitParameters);

            moat = sinon.createStubInstance(MOAT);
            sandbox.stub(MoatViewabilityService, 'getMoat').returns(moat);
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
                sinon.assert.called(<sinon.SinonSpy>vastAdUnit.hide);
            });

            describe('When ad unit has an endscreen', () => {
                it('should hide endcard', () => {
                    vastAdUnit.setShowing(true);
                    return vastAdUnit.hide().then(() => {
                        const vastEndScreenParameters: IVastEndscreenParameters = {
                            campaign: vastAdUnitParameters.campaign,
                            clientInfo: vastAdUnitParameters.clientInfo,
                            country: vastAdUnitParameters.coreConfig.getCountry()
                        };
                        const vastEndScreen = new VastEndScreen(platform, vastEndScreenParameters, privacy);
                        sinon.spy(vastEndScreen, 'show');
                        vastAdUnitParameters.endScreen = vastEndScreen;
                        vastAdUnit = new VastAdUnit(vastAdUnitParameters);
                        sinon.spy(vastAdUnit, 'hide');
                        vastOverlayEventHandler = new VastOverlayEventHandler(vastAdUnit, vastAdUnitParameters);
                        vastOverlayEventHandler.onOverlaySkip(1);
                        sinon.assert.called(<sinon.SinonSpy>vastEndScreen.show);
                    });
                });
            });
        });

        describe('When calling onMute', () => {

            beforeEach(() => {
                vastAdUnit.setShowing(true);
                return vastAdUnit.hide().then(() => {
                    vastAdUnit = new VastAdUnit(vastAdUnitParameters);
                    vastOverlayEventHandler = new VastOverlayEventHandler(vastAdUnit, vastAdUnitParameters);
                });
            });

            const testMuteEvent = (muted: boolean) => {
                const eventName = muted ? 'mute' : 'unmute';
                const mockEventManager = sinon.mock(thirdPartyEventManager);
                mockEventManager.expects('sendWithGet').withArgs(`vast ${eventName}`, '12345', `http://localhost:3500/brands/14851/${eventName}?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%`);

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

            it('should call volumeChange when mute is true', () => {
                vastOverlayEventHandler.onOverlayMute(true);
                sinon.assert.called(<sinon.SinonStub>moat.volumeChange);
            });

            it('should call play when mute is false', () => {
                vastOverlayEventHandler.onOverlayMute(false);
                sinon.assert.called(<sinon.SinonStub>moat.volumeChange);
            });
        });

        describe('When calling onCallButton', () => {
            beforeEach(() => {
                sinon.spy(ads.VideoPlayer, 'pause');
                sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
                sinon.stub(vastAdUnit, 'sendVideoClickTrackingEvent').returns(sinon.spy());
            });

            if(platform === Platform.IOS) {
                it('should call video click through tracking url', () => {
                    sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
                    sinon.stub(core.iOS!.UrlScheme, 'open').resolves();
                    vastOverlayEventHandler.onOverlayCallButton().then(() => {
                        sinon.assert.calledOnce(<sinon.SinonSpy>vastAdUnit.sendVideoClickTrackingEvent);
                    });
                });

                it('should open click trough link in iOS web browser when call button is clicked', () => {
                    sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
                    sinon.stub(core.iOS!.UrlScheme, 'open').resolves();
                    vastOverlayEventHandler.onOverlayCallButton().then(() => {
                        sinon.assert.calledWith(<sinon.SinonSpy>core.iOS!.UrlScheme.open, 'http://foo.com');
                    });
                });
            }

            if(platform === Platform.ANDROID) {
                it('should open click trough link in Android web browser when call button is clicked', () => {
                    sinon.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
                    sinon.stub(core.Android!.Intent, 'launch').resolves();
                    vastOverlayEventHandler.onOverlayCallButton().then(() => {
                        sinon.assert.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, {
                            'action': 'android.intent.action.VIEW',
                            'uri': 'http://foo.com'
                        });
                    });
                });
            }
        });
    });
});
