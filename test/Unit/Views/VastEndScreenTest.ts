import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VastEndScreen } from 'Ads/Views/VastEndScreen';
import { NativeBridge } from 'Common/Native/NativeBridge';

import VastEndScreenFixture from 'html/fixtures/VastEndScreenFixture.html';

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
