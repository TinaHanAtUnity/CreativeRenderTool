import { assert } from 'chai';
import { NativeBridge } from 'Common/Native/NativeBridge';

import VastEndScreenFixture from 'html/fixtures/VastEndScreenFixture.html';
import 'mocha';
import * as sinon from 'sinon';

import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VastEndScreen } from 'VAST/Views/VastEndScreen';

describe('VastEndScreen', () => {
    let handleInvocation: sinon.SinonSpy;
    let handleCallback: sinon.SinonSpy;
    let nativeBridge: NativeBridge;

    beforeEach(() => {
        handleInvocation = sinon.spy();
        handleCallback = sinon.spy();
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
    });

    it('should render', () => {
        const vastCampaign = TestFixtures.getCompanionVastCampaign();
        const endScreen = new VastEndScreen(nativeBridge, false, vastCampaign, 'testGameId');
        endScreen.render();
        assert.equal(endScreen.container().innerHTML, VastEndScreenFixture);
    });
});
