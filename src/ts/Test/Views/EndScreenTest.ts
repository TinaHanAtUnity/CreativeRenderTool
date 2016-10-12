import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { EndScreen } from 'Views/EndScreen';
import { NativeBridge } from 'Native/NativeBridge';
import { Campaign } from 'Models/Campaign';

import TestCampaign from 'json/TestCampaign.json';
import EndScreenFixture from 'html/fixtures/EndScreenFixture.html';

describe('EndScreen', () => {
    let handleInvocation: Sinon.SinonSpy;
    let handleCallback: Sinon.SinonSpy;
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
        let endScreen = new EndScreen(nativeBridge, new Campaign(JSON.parse(TestCampaign), '', 0), true, 'en');
        endScreen.render();
        assert.equal(endScreen.container().innerHTML, EndScreenFixture);
    });

    it('should render with translations', () => {
        let endScreen = new EndScreen(nativeBridge, new Campaign(JSON.parse(TestCampaign), '', 0), true, 'fi');
        endScreen.render();
        let downloadElement = endScreen.container().querySelectorAll('.download-text')[0];
        assert.equal(downloadElement.innerHTML, 'Lataa ilmaiseksi');
    });
});
