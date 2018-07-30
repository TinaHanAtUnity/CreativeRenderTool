import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { Overlay } from 'Views/Overlay';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Request } from 'Utilities/Request';
import { Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'AdUnits/Containers/ViewController';
import { Video } from 'Models/Assets/Video';
import { FocusManager } from 'Managers/FocusManager';
import { ClientInfo } from 'Models/ClientInfo';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { PerformanceEndScreen } from 'Views/PerformanceEndScreen';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { GDPRPrivacy } from 'Views/GDPRPrivacy';
import { Placement } from 'Models/Placement';
import { GdprManager, GDPREventAction } from 'Managers/GdprManager';
import { OverlayEventHandler } from 'EventHandlers/OverlayEventHandler';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { ProgrammaticTrackingService } from 'ProgrammaticTrackingService/ProgrammaticTrackingService';

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
