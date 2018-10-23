import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { GDPREventAction, GdprManager } from 'Ads/Managers/GdprManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Video } from 'Ads/Models/Assets/Video';
import { Placement } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Overlay } from 'Ads/Views/Overlay';
import { FocusManager } from 'Core/Managers/FocusManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { RequestManager } from 'Core/Managers/RequestManager';
import 'mocha';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Privacy } from 'Ads/Views/Privacy';
import { Platform } from 'Core/Constants/Platform';
import { Backend } from 'Backend/Backend';
import { ICoreApi } from 'Core/ICore';
import { IAdsApi } from 'Ads/IAds';

describe('GDPREventHandlerTest', () => {

    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let adUnit: PerformanceAdUnit;
    let adUnitParameters: IPerformanceAdUnitParameters;

    let gdprEventHandler: OverlayEventHandler<PerformanceCampaign>;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        adUnitParameters = {
            platform,
            core,
            ads,
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
            request: sinon.createStubInstance(Request),
            options: {},
            endScreen: sinon.createStubInstance(PerformanceEndScreen),
            overlay: sinon.createStubInstance(Overlay),
            video: sinon.createStubInstance(Video),
            privacy: sinon.createStubInstance(Privacy),
            gdprManager: sinon.createStubInstance(GdprManager),
            programmaticTrackingService: sinon.createStubInstance(ProgrammaticTrackingService)
        };

        adUnit = sinon.createStubInstance(PerformanceAdUnit);
        gdprEventHandler = new OverlayEventHandler(adUnit, adUnitParameters);
    });

    describe('When calling onGDPRPopupSkipped', () => {
        beforeEach(() => {
            adUnitParameters.adsConfig.set('optOutRecorded', false);
            sinon.spy(adUnitParameters.adsConfig, 'setOptOutRecorded');
        });

        it('should send GDPR skip event', () => {
            gdprEventHandler.onGDPRPopupSkipped();

            sinon.assert.calledWith(<sinon.SinonSpy>adUnitParameters.adsConfig.setOptOutRecorded, true);
            sinon.assert.calledWith(<sinon.SinonSpy>adUnitParameters.gdprManager.sendGDPREvent, GDPREventAction.SKIP);
        });

        it('GDPR skip event should not be sent', () => {
            adUnitParameters.adsConfig.set('optOutRecorded', true);
            gdprEventHandler.onGDPRPopupSkipped();

            sinon.assert.notCalled(<sinon.SinonSpy>adUnitParameters.gdprManager.sendGDPREvent);
        });
    });
});
