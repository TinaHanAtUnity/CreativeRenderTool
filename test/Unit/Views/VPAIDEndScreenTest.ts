import { assert } from 'chai';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

import VPAIDEndScreenFixture from 'html/fixtures/VPAIDEndScreenFixture.html';
import 'mocha';
import * as sinon from 'sinon';

import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VPAIDEndScreen } from 'VPAID/Views/VPAIDEndScreen';

describe('VPAIDEndScreen', () => {
    let handleInvocation: sinon.SinonSpy;
    let handleCallback: sinon.SinonSpy;
    let nativeBridge: NativeBridge;

    beforeEach(() => {
        document.body.innerHTML = '';
        handleInvocation = sinon.spy();
        handleCallback = sinon.spy();
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
    });

    it('should render', () => {
        const vpaidCampaign = TestFixtures.getCompanionVPAIDCampaign();
        const endScreen = new VPAIDEndScreen(nativeBridge, vpaidCampaign, 'testGameId');
        endScreen.render();

        assert.equal(endScreen.container().innerHTML, VPAIDEndScreenFixture);
    });

    it('should be added to the dom on show', () => {
        const vpaidCampaign = TestFixtures.getCompanionVPAIDCampaign();
        const endScreen = new VPAIDEndScreen(nativeBridge, vpaidCampaign, 'testGameId');
        endScreen.render();
        endScreen.show();

        assert.isNotNull(document.body.querySelector('#end-screen'));
        assert.equal(document.body.querySelector('#end-screen'), endScreen.container());
    });

    it('should remove the endscreen from the dom', () => {
        const vpaidCampaign = TestFixtures.getCompanionVPAIDCampaign();
        const endScreen = new VPAIDEndScreen(nativeBridge, vpaidCampaign, 'testGameId');
        endScreen.render();
        endScreen.show();

        assert.isNotNull(document.body.querySelector('#end-screen'));
        endScreen.remove();
        assert.isNull(document.body.querySelector('#end-screen'));
    });

    it('should not error when attempting to remove the endscreen from the dom if it was never added/shown', () => {
        const vpaidCampaign = TestFixtures.getCompanionVPAIDCampaign();
        const endScreen = new VPAIDEndScreen(nativeBridge, vpaidCampaign, 'testGameId');
        endScreen.render();

        assert.isNull(document.body.querySelector('#end-screen'));
        endScreen.remove();
        assert.isNull(document.body.querySelector('#end-screen'));
    });
});
