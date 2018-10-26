import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { IAdsApi } from 'Ads/IAds';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Video } from 'Ads/Models/Assets/Video';
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
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IVastAdUnitParameters, VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { VastEndScreenEventHandler } from 'VAST/EventHandlers/VastEndScreenEventHandler';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { IVastEndscreenParameters, VastEndScreen } from 'VAST/Views/VastEndScreen';

import EventTestVast from 'xml/EventTestVast.xml';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('VastEndScreenEventHandlerTest', () => {

        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let ads: IAdsApi;
        let deviceInfo: DeviceInfo;
        let storageBridge: StorageBridge;
        let container: AdUnitContainer;
        let request: RequestManager;
        let vastAdUnitParameters: IVastAdUnitParameters;
        let vastEndScreenParameters: IVastEndscreenParameters;

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);

            storageBridge = new StorageBridge(core);
            const focusManager = new FocusManager(platform, core);
            const metaDataManager = new MetaDataManager(core);

            const clientInfo = TestFixtures.getClientInfo(platform);

            if(platform === Platform.ANDROID) {
                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
                container = new Activity(core, ads, <AndroidDeviceInfo>deviceInfo);
            } else if(platform === Platform.IOS) {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
                container = new ViewController(core, ads, <IosDeviceInfo>deviceInfo, focusManager, clientInfo);
            }

            request = new RequestManager(platform, core, new WakeUpManager(core));
            sinon.stub(request, 'followRedirectChain').callsFake((url) => {
                return Promise.resolve(url);
            });

            const campaign = TestFixtures.getCompanionVastCampaign();
            const thirdPartyEventManager = new ThirdPartyEventManager(core, request);
            const sessionManager = new SessionManager(core.Storage, request, storageBridge);
            const coreConfig = TestFixtures.getCoreConfiguration();
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
                campaign: campaign
            });
            const gdprManager = sinon.createStubInstance(GdprManager);
            const privacy = new Privacy(platform, campaign, gdprManager, false, false);
            const video = new Video('', TestFixtures.getSession());
            const overlay = new Overlay(platform, ads, deviceInfo, true, 'en', 'testGameId', privacy, false);
            const programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

            vastAdUnitParameters = {
                platform,
                core,
                ads,
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: TestFixtures.getPlacement(),
                campaign: campaign,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                request: request,
                options: {},
                endScreen: undefined,
                overlay: overlay,
                video: video,
                gdprManager: gdprManager,
                programmaticTrackingService: programmaticTrackingService
            };

            vastEndScreenParameters = {
                campaign: vastAdUnitParameters.campaign,
                clientInfo: vastAdUnitParameters.clientInfo,
                seatId: vastAdUnitParameters.campaign.getSeatId(),
                showPrivacyDuringEndscreen: false
            };
        });

        describe('when calling onClose', () => {
            it('should hide endcard', () => {
                const vastEndScreen = new VastEndScreen(platform, vastEndScreenParameters, sinon.createStubInstance(Privacy));
                vastAdUnitParameters.endScreen = vastEndScreen;
                const vastAdUnit = new VastAdUnit(vastAdUnitParameters);
                sinon.stub(vastAdUnit, 'hide').returns(sinon.spy());
                const vastEndScreenEventHandler = new VastEndScreenEventHandler(vastAdUnit, vastAdUnitParameters);

                vastEndScreenEventHandler.onVastEndScreenClose();
                sinon.assert.called(<sinon.SinonSpy>vastAdUnit.hide);
            });
        });

        describe('when calling onClick', () => {
            let vastAdUnit: VastAdUnit;
            let video: Video;
            let campaign: VastCampaign;
            let vastEndScreen: VastEndScreen;
            let vastEndScreenEventHandler: VastEndScreenEventHandler;
            const vastXml = EventTestVast;
            const vastParser = TestFixtures.getVastParser();

            beforeEach(() => {

                video = new Video('', TestFixtures.getSession());
                campaign = TestFixtures.getEventVastCampaign();

                vastAdUnitParameters.video = video;
                vastAdUnitParameters.campaign = campaign;
                vastAdUnitParameters.placement = TestFixtures.getPlacement();
                const privacy = sinon.createStubInstance(Privacy);
                vastEndScreen = new VastEndScreen(platform, vastEndScreenParameters, privacy);
                vastAdUnitParameters.endScreen = vastEndScreen;
                vastAdUnit = new VastAdUnit(vastAdUnitParameters);
                vastEndScreenEventHandler = new VastEndScreenEventHandler(vastAdUnit, vastAdUnitParameters);
                sinon.stub(vastAdUnit, 'sendTrackingEvent').returns(sinon.spy());
            });

            if(platform === Platform.IOS) {

                it('should send a tracking event for vast video end card click', () => {
                    sinon.stub(core.iOS!.UrlScheme, 'open').resolves();
                    return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                        sinon.assert.calledOnce(<sinon.SinonSpy>vastAdUnit.sendTrackingEvent);
                    });
                });

                it('should send second tracking event for vast video end card click after processing the first', () => {
                    sinon.stub(core.iOS!.UrlScheme, 'open').resolves();
                    return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                        return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                            sinon.assert.calledTwice(<sinon.SinonSpy>vastAdUnit.sendTrackingEvent);
                        });
                    });
                });

                it('should ignore user clicks while processing the first click event', () => {
                    const mockEndScreen = sinon.mock(vastEndScreen);
                    const expectationEndScreen = sinon.mock(vastEndScreen).expects('setCallButtonEnabled').twice();
                    sinon.stub(core.iOS!.UrlScheme, 'open').resolves();
                    vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                        mockEndScreen.verify();
                        assert.equal(expectationEndScreen.getCall(0).args[0], false, 'Should disable end screen CTA while processing click event');
                        assert.equal(expectationEndScreen.getCall(1).args[0], true, 'Should enable end screen CTA after processing click event');
                    });
                });

                it('should use video click through url when companion click url is not present', () => {
                    sinon.stub(core.iOS!.UrlScheme, 'open').resolves();
                    sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns(null);
                    sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('https://bar.com');
                    return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                        sinon.assert.calledWith(<sinon.SinonSpy>core.iOS!.UrlScheme.open, 'https://bar.com');
                    });
                });

                it('should open click through link on iOS', () => {
                    sinon.stub(core.iOS!.UrlScheme, 'open').resolves();
                    sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns('https://foo.com');
                    return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                        sinon.assert.calledWith(<sinon.SinonSpy>core.iOS!.UrlScheme.open, 'https://foo.com');
                    });
                });
            }

            if(platform === Platform.ANDROID) {
                it('should open click through link on Android', () => {
                    sinon.stub(core.Android!.Intent, 'launch').resolves();
                    sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns('https://foo.com');

                    return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                        sinon.assert.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, {
                            'action': 'android.intent.action.VIEW',
                            'uri': 'https://foo.com'
                        });
                    });
                });
            }
        });
    });
});
