import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { EndScreen } from 'Views/EndScreen';
import { NativeBridge } from 'Native/NativeBridge';
import { Localization } from 'Utilities/Localization';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';

import TestCampaign from 'json/TestCampaign.json';
import EndScreenFixture from 'html/fixtures/EndScreenFixture.html';

describe('EndScreen', () => {
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
        Localization.setLanguageMap('fi.*', 'endscreen', {
            'Download For Free': 'Lataa ilmaiseksi'
        });
    });

    xit('should render', () => {
        const endScreen = new EndScreen(nativeBridge, new PerformanceCampaign(JSON.parse(TestCampaign), '', 0), true, 'en');
        endScreen.render();
        assert.equal(endScreen.container().innerHTML, EndScreenFixture);
    });

    it('should render with translations', () => {
        const endScreen = new EndScreen(nativeBridge, new PerformanceCampaign(JSON.parse(TestCampaign), '', 0), true, 'fi');
        endScreen.render();
        const downloadElement = endScreen.container().querySelectorAll('.download-text')[0];
        assert.equal(downloadElement.innerHTML, 'Lataa ilmaiseksi');
    });
});
