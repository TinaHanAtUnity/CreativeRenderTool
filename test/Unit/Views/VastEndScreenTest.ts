import { assert } from 'chai';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

import VastEndScreenFixture from 'html/fixtures/VastEndScreenFixture.html';
import 'mocha';
import * as sinon from 'sinon';

import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VastEndScreen } from 'VAST/Views/VastEndScreen';
import { IVastAdUnitParameters } from 'VAST/AdUnits/VastAdUnit';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { Placement } from 'Ads/Models/Placement';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { Video } from 'Ads/Models/Assets/Video';
import { GDPRPrivacy } from 'Ads/Views/GDPRPrivacy';

describe('VastEndScreen', () => {
    let handleInvocation: sinon.SinonSpy;
    let handleCallback: sinon.SinonSpy;
    let nativeBridge: NativeBridge;
    let vastAdUnitParameters: IVastAdUnitParameters;

    beforeEach(() => {
        handleInvocation = sinon.spy();
        handleCallback = sinon.spy();
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        vastAdUnitParameters = {
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: sinon.createStubInstance(FocusManager),
            container: new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo()),
            deviceInfo: sinon.createStubInstance(DeviceInfo),
            clientInfo: sinon.createStubInstance(ClientInfo),
            thirdPartyEventManager: sinon.createStubInstance(ThirdPartyEventManager),
            operativeEventManager: sinon.createStubInstance(OperativeEventManager),
            placement: sinon.createStubInstance(Placement),
            campaign: TestFixtures.getCompanionVastCampaign(),
            configuration: TestFixtures.getConfiguration(),
            request: sinon.createStubInstance(Request),
            options: {},
            endScreen: undefined,
            overlay: sinon.createStubInstance(AbstractVideoOverlay),
            video: sinon.createStubInstance(Video),
            gdprManager: sinon.createStubInstance(GdprManager),
            programmaticTrackingService: sinon.createStubInstance(ProgrammaticTrackingService)
        };
    });

    it('should render', () => {
        const privacy = new GDPRPrivacy(nativeBridge, vastAdUnitParameters.campaign, vastAdUnitParameters.gdprManager, true, false);
        const endScreen = new VastEndScreen(nativeBridge, vastAdUnitParameters, privacy);
        endScreen.render();
        assert.equal(endScreen.container().innerHTML, VastEndScreenFixture);
    });
});
