import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Ads/AdUnits/PerformanceAdUnit';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { GDPREventAction, GdprManager } from 'Ads/Managers/GdprManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Video } from 'Ads/Models/Assets/Video';
import { PerformanceCampaign } from 'Ads/Models/Campaigns/PerformanceCampaign';
import { Placement } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { GDPRPrivacy } from 'Ads/Views/GDPRPrivacy';
import { Overlay } from 'Ads/Views/Overlay';
import { PerformanceEndScreen } from 'Ads/Views/PerformanceEndScreen';

import { NativeBridge } from 'Common/Native/NativeBridge';
import { FocusManager } from 'Core/Managers/FocusManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Request } from 'Core/Utilities/Request';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('GDPREventHandlerTest', () => {

    let nativeBridge: NativeBridge;
    let adUnit: PerformanceAdUnit;
    let adUnitParameters: IPerformanceAdUnitParameters;

    let gdprEventHandler: OverlayEventHandler<PerformanceCampaign>;

    beforeEach(() => {
        adUnitParameters = {
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: sinon.createStubInstance(FocusManager),
            container: sinon.createStubInstance(ViewController),
            deviceInfo: sinon.createStubInstance(DeviceInfo),
            clientInfo: sinon.createStubInstance(ClientInfo),
            thirdPartyEventManager: sinon.createStubInstance(ThirdPartyEventManager),
            operativeEventManager: sinon.createStubInstance(OperativeEventManager),
            placement: sinon.createStubInstance(Placement),
            campaign: sinon.createStubInstance(PerformanceCampaign),
            configuration: TestFixtures.getConfiguration(),
            request: sinon.createStubInstance(Request),
            options: {},
            endScreen: sinon.createStubInstance(PerformanceEndScreen),
            overlay: sinon.createStubInstance(Overlay),
            video: sinon.createStubInstance(Video),
            privacy: sinon.createStubInstance(GDPRPrivacy),
            gdprManager: sinon.createStubInstance(GdprManager),
            programmaticTrackingService: sinon.createStubInstance(ProgrammaticTrackingService)
        };

        adUnit = sinon.createStubInstance(PerformanceAdUnit);
        nativeBridge = sinon.createStubInstance(NativeBridge);
        gdprEventHandler = new OverlayEventHandler(nativeBridge, adUnit, adUnitParameters);
    });

    describe('When calling onGDPRPopupSkipped', () => {
        beforeEach(() => {
            adUnitParameters.configuration.set('optOutRecorded', false);
            sinon.spy(adUnitParameters.configuration, 'setOptOutRecorded');
        });

        it('should send GDPR skip event', () => {
            gdprEventHandler.onGDPRPopupSkipped();

            sinon.assert.calledWith(<sinon.SinonSpy>adUnitParameters.configuration.setOptOutRecorded, true);
            sinon.assert.calledWith(<sinon.SinonSpy>adUnitParameters.gdprManager.sendGDPREvent, GDPREventAction.SKIP);
        });

        it('GDPR skip event should not be sent', () => {
            adUnitParameters.configuration.set('optOutRecorded', true);
            gdprEventHandler.onGDPRPopupSkipped();

            sinon.assert.notCalled(<sinon.SinonSpy>adUnitParameters.gdprManager.sendGDPREvent);
        });
    });
});
