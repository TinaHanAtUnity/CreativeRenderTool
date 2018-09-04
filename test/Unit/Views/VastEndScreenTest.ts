import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VastEndScreen } from 'Views/VastEndScreen';
import { NativeBridge } from 'Native/NativeBridge';

import VastEndScreenFixture from 'html/fixtures/VastEndScreenFixture.html';
import { Privacy } from 'Views/Privacy';

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
        const endScreen = new VastEndScreen(nativeBridge, vastCampaign, 'testGameId', new Privacy(nativeBridge, false));
        endScreen.render();
        assert.equal(endScreen.container().innerHTML, VastEndScreenFixture);
    });
});
