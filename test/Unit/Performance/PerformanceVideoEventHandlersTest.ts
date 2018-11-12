import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { VideoState } from 'Ads/AdUnits/VideoAdUnit';
import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { IAdsApi } from 'Ads/IAds';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Video } from 'Ads/Models/Assets/Video';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { Overlay } from 'Ads/Views/Overlay';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { NewVideoOverlay, IVideoOverlayParameters } from 'Ads/Views/NewVideoOverlay';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceVideoEventHandler } from 'Performance/EventHandlers/PerformanceVideoEventHandler';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IARApi } from 'AR/AR';
import { IPurchasingApi } from 'Purchasing/IPurchasing';

describe('PerformanceVideoEventHandlersTest', () => {

    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let ar: IARApi;
    let purchasing: IPurchasingApi;
    let overlay: NewVideoOverlay;
    let endScreen: PerformanceEndScreen;
    let storageBridge: StorageBridge;
    let container: AdUnitContainer;
    let performanceAdUnit: PerformanceAdUnit;
    let video: Video;
    let performanceAdUnitParameters: IPerformanceAdUnitParameters;
    let performanceVideoEventHandler: PerformanceVideoEventHandler;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        ar = TestFixtures.getARApi(nativeBridge);
        purchasing = TestFixtures.getPurchasingApi(nativeBridge);

        storageBridge = new StorageBridge(core);
        container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
        video = new Video('', TestFixtures.getSession());

        const focusManager = new FocusManager(platform, core);
        const wakeUpManager = new WakeUpManager(core);
        const request = new RequestManager(platform, core, wakeUpManager);
        const metaDataManager = new MetaDataManager(core);
        const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        const thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        const sessionManager = new SessionManager(core, request, storageBridge);
        const campaign = TestFixtures.getCampaign();
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
        const privacy = new Privacy(platform, campaign, gdprManager, adsConfig.isGDPREnabled(), coreConfig.isCoppaCompliant());
        const endScreenParams : IEndScreenParameters = {
            platform,
            core,
            language : deviceInfo.getLanguage(),
            gameId: clientInfo.getGameId(),
            privacy: privacy,
            showGDPRBanner: false,
            abGroup: coreConfig.getAbGroup(),
            targetGameName: campaign.getGameName()
        };
        endScreen = new PerformanceEndScreen(endScreenParams, campaign);

        const overlayParams: IVideoOverlayParameters<PerformanceCampaign> = {
            platform,
            ads,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            campaign: campaign,
            coreConfig: coreConfig,
            placement: TestFixtures.getPlacement()
        };
        overlay = new NewVideoOverlay(overlayParams, privacy, false);
        const programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

        performanceAdUnitParameters = {
            platform,
            core,
            ads,
            ar,
            purchasing,
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
            endScreen: endScreen,
            overlay: overlay,
            video: video,
            privacy: privacy,
            gdprManager: gdprManager,
            programmaticTrackingService: programmaticTrackingService
        };

        performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);

        const videoEventHandlerParams: IVideoEventHandlerParams = {
            platform,
            core,
            ads,
            adUnit: performanceAdUnit,
            campaign: campaign,
            operativeEventManager: operativeEventManager,
            thirdPartyEventManager: thirdPartyEventManager,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            placement: TestFixtures.getPlacement(),
            video: video,
            adUnitStyle: undefined,
            clientInfo: clientInfo
        };

        performanceVideoEventHandler = new PerformanceVideoEventHandler(<IVideoEventHandlerParams<PerformanceAdUnit, PerformanceCampaign>>videoEventHandlerParams);
    });

    describe('with onVideoCompleted', () => {
        it('should show end screen', () => {
            sinon.spy(endScreen, 'show');
            performanceVideoEventHandler.onCompleted(video.getUrl());
            sinon.assert.called(<sinon.SinonSpy>endScreen.show);
        });
    });

    describe('with onVideoError', () => {
        it('should show end screen', () => {
            sinon.spy(endScreen, 'show');
            // Set prepare called so that error will trigger
            performanceAdUnit.setVideoState(VideoState.PREPARING);
            // Cause an error by giving too large duration
            performanceVideoEventHandler.onPrepared(video.getUrl(), 50000, 1024, 768);
            sinon.assert.called(<sinon.SinonSpy>endScreen.show);
        });
    });

    describe('with onPrepared', () => {
        it('should show set overlay call button visible ', () => {
            sinon.spy(overlay, 'setCallButtonVisible');
            performanceVideoEventHandler.onPrepared(video.getUrl(), 5, 1024, 768);
            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setCallButtonVisible, true);
        });
    });
});
