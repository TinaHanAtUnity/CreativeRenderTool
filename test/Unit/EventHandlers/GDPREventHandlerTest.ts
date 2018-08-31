import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Common/Native/NativeBridge';
import { Overlay } from 'Ads/Views/Overlay';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Request } from 'Core/Utilities/Request';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { Video } from 'Ads/Models/Assets/Video';
import { FocusManager } from 'Core/Managers/FocusManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Ads/AdUnits/PerformanceAdUnit';
import { PerformanceEndScreen } from 'Ads/Views/PerformanceEndScreen';
import { PerformanceCampaign } from 'Ads/Models/Campaigns/PerformanceCampaign';
import { GDPRPrivacy } from 'Ads/Views/GDPRPrivacy';
import { Placement } from 'Ads/Models/Placement';
import { GDPREventAction, GdprManager } from 'Ads/Managers/GdprManager';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';

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
