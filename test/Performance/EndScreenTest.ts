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
import { Privacy } from 'Ads/Views/Privacy';
import { Platform } from '../../src/ts/Core/Constants/Platform';
import { Backend } from '../../src/ts/Backend/Backend';
import { ICoreApi } from '../../src/ts/Core/ICore';

describe('EndScreenTest', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let configuration: CoreConfiguration;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        Localization.setLanguageMap('fi.*', 'endscreen', {
            'Download For Free': 'Lataa ilmaiseksi'
        });
        configuration = TestFixtures.getCoreConfiguration();
    });

    const createEndScreen = (language : string) : PerformanceEndScreen => {
        const gdprManager = sinon.createStubInstance(GdprManager);
        const campaign = TestFixtures.getCampaign();
        const privacy = new Privacy(platform, campaign, gdprManager, false, false);
        const params : IEndScreenParameters = {
            platform,
            core,
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
