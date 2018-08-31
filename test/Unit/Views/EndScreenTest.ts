import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Common/Native/NativeBridge';
import { Localization } from 'Core/Utilities/Localization';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { PerformanceEndScreen } from 'Ads/Views/PerformanceEndScreen';
import { Privacy } from 'Ads/Views/Privacy';

import EndScreenFixture from 'html/fixtures/EndScreenFixture.html';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { Configuration } from 'Core/Models/Configuration';

describe('EndScreen', () => {
    let handleInvocation: sinon.SinonSpy;
    let handleCallback: sinon.SinonSpy;
    let nativeBridge: NativeBridge;
    let configuration: Configuration;

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
        configuration = TestFixtures.getConfiguration();
    });

    const createEndScreen = (language : string) : PerformanceEndScreen => {
        const privacy = new Privacy(nativeBridge, false);
        const params : IEndScreenParameters = {
            nativeBridge,
            language,
            gameId: 'testGameId',
            targetGameName: TestFixtures.getCampaign().getGameName(),
            abGroup: configuration.getAbGroup(),
            privacy,
            showGDPRBanner: false,
            campaignId: TestFixtures.getCampaign().getId()
        };
        return new PerformanceEndScreen(params, TestFixtures.getCampaign());
    };

    xit('should render', () => {
        const endScreen = createEndScreen('en');
        endScreen.render();
        assert.equal(endScreen.container().innerHTML, EndScreenFixture);
    });

    it('should render with translations', () => {
        const endScreen = createEndScreen('fi');
        endScreen.render();
        const downloadElement = endScreen.container().querySelectorAll('.download-text')[0];
        assert.equal(downloadElement.innerHTML, 'Lataa ilmaiseksi');
    });
});
