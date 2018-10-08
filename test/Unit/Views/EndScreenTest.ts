import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { assert } from 'chai';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Localization } from 'Core/Utilities/Localization';

import EndScreenFixture from 'html/fixtures/EndScreenFixture.html';
import 'mocha';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { ReportingPrivacy } from 'Ads/Views/ReportingPrivacy';

describe('EndScreenTest', () => {
    let handleInvocation: sinon.SinonSpy;
    let handleCallback: sinon.SinonSpy;
    let nativeBridge: NativeBridge;
    let configuration: CoreConfiguration;

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
        configuration = TestFixtures.getCoreConfiguration();
    });

    const createEndScreen = (language : string) : PerformanceEndScreen => {
        const gdprManager = sinon.createStubInstance(GdprManager);
        const campaign = TestFixtures.getCampaign();
        const privacy = new ReportingPrivacy(nativeBridge, campaign, gdprManager, false, false);
        const params : IEndScreenParameters = {
            nativeBridge,
            language,
            gameId: 'testGameId',
            targetGameName: TestFixtures.getCampaign().getGameName(),
            abGroup: configuration.getAbGroup(),
            privacy,
            showGDPRBanner: false,
            campaignId: campaign.getId()
        };
        return new PerformanceEndScreen(params, campaign);
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
