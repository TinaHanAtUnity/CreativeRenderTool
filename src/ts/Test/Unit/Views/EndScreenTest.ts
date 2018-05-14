import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { Localization } from 'Utilities/Localization';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { PerformanceEndScreen } from 'Views/PerformanceEndScreen';
import { Privacy } from 'Views/Privacy';

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
        const privacy = new Privacy(nativeBridge, false);

        const endScreen = new PerformanceEndScreen(nativeBridge, TestFixtures.getCampaign(), 'en', 'testGameId', privacy, false);
        endScreen.render();
        assert.equal(endScreen.container().innerHTML, EndScreenFixture);
    });

    it('should render with translations', () => {
        const privacy = new Privacy(nativeBridge, false);

        const endScreen = new PerformanceEndScreen(nativeBridge, TestFixtures.getCampaign(), 'fi', 'testGameId', privacy, false);
        endScreen.render();
        const downloadElement = endScreen.container().querySelectorAll('.download-text')[0];
        assert.equal(downloadElement.innerHTML, 'Lataa ilmaiseksi');
    });
});
