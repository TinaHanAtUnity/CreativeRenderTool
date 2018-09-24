import { GdprManager } from 'Ads/Managers/GdprManager';
import { GDPRPrivacy } from 'Ads/Views/GDPRPrivacy';
import { assert } from 'chai';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import VastEndScreenFixture from 'html/fixtures/VastEndScreenFixture.html';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IVastEndscreenParameters, VastEndScreen } from 'VAST/Views/VastEndScreen';

describe('VastEndScreen', () => {
    let handleInvocation: sinon.SinonSpy;
    let handleCallback: sinon.SinonSpy;
    let nativeBridge: NativeBridge;
    let vastEndscreenParameters: IVastEndscreenParameters;
    let gdprManager: GdprManager;

    beforeEach(() => {
        handleInvocation = sinon.spy();
        handleCallback = sinon.spy();
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        vastEndscreenParameters = {
            clientInfo: sinon.createStubInstance(ClientInfo),
            campaign: TestFixtures.getCompanionVastCampaign(),
            seatId: 0,
            showPrivacyDuringEndscreen: true
        };

        gdprManager = sinon.createStubInstance(GdprManager);
    });

    it('should render', () => {
        const privacy = new GDPRPrivacy(nativeBridge, gdprManager, false);
        const endScreen = new VastEndScreen(nativeBridge, vastEndscreenParameters, privacy);
        endScreen.render();
        assert.equal(endScreen.container().innerHTML, VastEndScreenFixture);
    });
});
