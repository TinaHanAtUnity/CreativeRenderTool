import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { IAdsApi } from 'Ads/IAds';
import { GDPREventAction, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Video } from 'Ads/Models/Assets/Video';
import { Placement } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { FocusManager } from 'Core/Managers/FocusManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { RequestManager } from 'Core/Managers/RequestManager';
import { IStoreApi } from 'Store/IStore';
import { PrivacySDK } from 'Privacy/PrivacySDK';

describe('GDPREventHandlerTest', () => {

    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let store: IStoreApi;
    let adUnit: PerformanceAdUnit;
    let adUnitParameters: IPerformanceAdUnitParameters;
    let privacySDK: PrivacySDK;

    let gdprEventHandler: OverlayEventHandler<PerformanceCampaign>;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        store = TestFixtures.getStoreApi(nativeBridge);
        privacySDK = sinon.createStubInstance(PrivacySDK);
        adUnitParameters = {
            platform,
            core,
            ads,
            store,
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: sinon.createStubInstance(FocusManager),
            container: sinon.createStubInstance(ViewController),
            deviceInfo: sinon.createStubInstance(DeviceInfo),
            clientInfo: sinon.createStubInstance(ClientInfo),
            thirdPartyEventManager: sinon.createStubInstance(ThirdPartyEventManager),
            operativeEventManager: sinon.createStubInstance(OperativeEventManager),
            placement: sinon.createStubInstance(Placement),
            campaign: sinon.createStubInstance(PerformanceCampaign),
            coreConfig: TestFixtures.getCoreConfiguration(),
            adsConfig: TestFixtures.getAdsConfiguration(),
            request: sinon.createStubInstance(RequestManager),
            options: {},
            endScreen: sinon.createStubInstance(PerformanceEndScreen),
            overlay: sinon.createStubInstance(VideoOverlay),
            video: sinon.createStubInstance(Video),
            privacy: sinon.createStubInstance(Privacy),
            privacyManager: sinon.createStubInstance(UserPrivacyManager),
            programmaticTrackingService: sinon.createStubInstance(ProgrammaticTrackingService),
            privacySDK: privacySDK
        };

        adUnit = sinon.createStubInstance(PerformanceAdUnit);
        gdprEventHandler = new OverlayEventHandler(adUnit, adUnitParameters);
    });

    describe('When calling onGDPRPopupSkipped', () => {
        beforeEach(() => {
            // tslint:disable-next-line
            adUnitParameters.privacySDK['_optOutRecorded'] = false;
        });

        it('should send GDPR skip event', () => {
            gdprEventHandler.onGDPRPopupSkipped();

            sinon.assert.calledWith(<sinon.SinonSpy>adUnitParameters.privacySDK.setOptOutRecorded, true);
            sinon.assert.calledWith(<sinon.SinonSpy>adUnitParameters.privacyManager.sendGDPREvent, GDPREventAction.SKIP);
        });

        it('GDPR skip event should not be sent', () => {
            // tslint:disable-next-line
            adUnitParameters.privacySDK['_optOutRecorded'] = true;
            gdprEventHandler.onGDPRPopupSkipped();

            sinon.assert.notCalled(<sinon.SinonSpy>adUnitParameters.privacyManager.sendGDPREvent);
        });
    });
});
