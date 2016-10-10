import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { EndScreen } from 'Views/EndScreen';
import { NativeBridge } from 'Native/NativeBridge';
import { Campaign } from 'Models/Campaign';

import TestCampaign from 'json/TestCampaign.json';
import EndScreenFixture from 'html/fixtures/EndScreenFixture.html';

describe('EndScreen', () => {
    it('should render', () => {
        let handleInvocation = sinon.spy();
        let handleCallback = sinon.spy();
        let nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        let endScreen = new EndScreen(nativeBridge, new Campaign(JSON.parse(TestCampaign), '', 0), true);
        endScreen.render();
        assert.equal(endScreen.container().innerHTML, EndScreenFixture);
    });
});
