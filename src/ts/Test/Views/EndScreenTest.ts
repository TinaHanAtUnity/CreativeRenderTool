import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { EndScreen } from 'Views/EndScreen';
import { NativeBridge } from 'Native/NativeBridge';
import { Campaign } from 'Models/Campaign';

import * as TestCampaign from 'text!json/TestCampaign.json';
import * as EndScreenFixture from 'text!html/EndScreenFixture.html';

describe('EndScreen', () => {
    it('should render', () => {
        let handleInvocation = sinon.spy();
        let handleCallback = sinon.spy();
        let nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        let endScreen = new EndScreen(nativeBridge, new Campaign(JSON.parse(<string>(typeof TestCampaign === 'string' ? TestCampaign : TestCampaign.default)), '', 0), true);
        endScreen.render();
        assert.equal(endScreen.container().innerHTML, <string>(typeof EndScreenFixture === 'string' ? EndScreenFixture : EndScreenFixture.default));
    });
});
