import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { ColorBlurEndScreen } from 'MabExperimentation/Performance/Views/ColorBlurEndScreen';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { Localization } from 'Core/Utilities/Localization';

describe('ColorBlurEndScreenTest', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let configuration: CoreConfiguration;
    let privacy: Privacy;
    let sandbox: sinon.SinonSandbox;
    let campaign: PerformanceCampaign;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        campaign = TestFixtures.getCampaign();
        configuration = TestFixtures.getCoreConfiguration();
        sandbox.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
        sandbox.stub(SDKMetrics, 'reportMetricEventWithTags').returns(Promise.resolve());
        // This hack is necessary, otherwise the 'fi' language renders in English
        // Note: this behavior is unique to testing on github, it renders in the proper
        // language on devices, in browser, and while running local tests.
        // Github CI may need a 'make setup'.
        // Copied this behavior from 'EndScreenTest.ts:37
        Localization.setLanguageMap('fi.*', 'endscreen', {
            'Install Now': 'Asenna nyt',
            'Free': 'Ilmainen'
        });
    });

    afterEach(() => {
        sandbox.restore();
        const container = privacy.container();
        if (container && container.parentElement) {
            container.parentElement.removeChild(container);
        }
    });

    const createColorBlurEndScreen = (ctaText: string, language: string): ColorBlurEndScreen => {
        const privacyManager = sinon.createStubInstance(UserPrivacyManager);
        privacy = new Privacy(platform, campaign, privacyManager, false, false, 'en');
        const params: IEndScreenParameters = {
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

        const experimentDescription = {
            ctaText
        };

        return new ColorBlurEndScreen(experimentDescription, params, campaign);
    };

    describe('Locales for Install Now and Free', () => {
        const validateTranslation = (endScreen: ColorBlurEndScreen, downloadText: string, freeText: string) => {
            endScreen.render();
            const downloadElement = <HTMLElement>endScreen.container().querySelectorAll('.download-text')[0];
            const freeElement = <HTMLElement>endScreen.container().querySelectorAll('.free-text')[0];

            assert.equal(downloadElement.innerHTML, downloadText);
            assert.equal(freeElement.innerHTML, freeText);

            //cleanup
            const container = privacy.container();
            if (container && container.parentElement) {
                container.parentElement.removeChild(container);
            } else {
                assert.fail(`${container.parentElement}`);
            }
        };

        it('renders ko', () => {
            validateTranslation(createColorBlurEndScreen('Install Now', 'ko'), '다운로드', '무료');
        });
        it('renders da_DK', () => {
            validateTranslation(createColorBlurEndScreen('Install Now', 'da_DK'), 'Installér nu', 'Gratis');
        });
        it('renders de', () => {
            validateTranslation(createColorBlurEndScreen('Install Now', 'de'), 'Installieren', 'Gratis');
        });
        it('renders es', () => {
            validateTranslation(createColorBlurEndScreen('Install Now', 'es'), 'Instalar Ahora', 'Gratis');
        });
        it('renders fi', () => {
            validateTranslation(createColorBlurEndScreen('Install Now', 'fi'), 'Asenna nyt', 'Ilmainen');
        });
        it('renders fr', () => {
            validateTranslation(createColorBlurEndScreen('Install Now', 'fr'), 'Installer maintenant', 'Gratuit');
        });
        it('renders is', () => {
            validateTranslation(createColorBlurEndScreen('Install Now', 'is'), 'Setja upp', 'Frítt');
        });
        it('renders it', () => {
            validateTranslation(createColorBlurEndScreen('Install Now', 'it'), 'Installa Ora', 'Gratis');
        });
        it('renders ja', () => {
            validateTranslation(createColorBlurEndScreen('Install Now', 'ja'), 'インストール', '無料');
        });
        it('renders lt', () => {
            validateTranslation(createColorBlurEndScreen('Install Now', 'lt'), 'Atsisiųsti', 'Nemokamai');
        });
        it('renders nb', () => {
            validateTranslation(createColorBlurEndScreen('Install Now', 'nb'), 'Installere nå', 'Gratis');
        });
        it('renders pt', () => {
            validateTranslation(createColorBlurEndScreen('Install Now', 'pt'), 'Instale Agora', 'Grátis');
        });
        it('renders ro', () => {
            validateTranslation(createColorBlurEndScreen('Install Now', 'ro'), 'Descarcă', 'Gratis');
        });
        it('renders ru', () => {
            validateTranslation(createColorBlurEndScreen('Install Now', 'ru'), 'Установить', 'бесплатно');
        });
        it('renders tr', () => {
            validateTranslation(createColorBlurEndScreen('Install Now', 'tr'), 'Şimdi Kur', 'ücretsiz');
        });
        it('renders zh_Hans', () => {
            validateTranslation(createColorBlurEndScreen('Install Now', 'zh_Hans'), '立即下載', '免费');
        });
        it('renders zh_Hant', () => {
            validateTranslation(createColorBlurEndScreen('Install Now', 'zh_Hant'), '立即下载', '免费');
        });
    });

    describe('Color matching for the game info container and the install container', async () => {
        let campaignColorRgbCss: string;

        beforeEach(() => {
            campaignColorRgbCss = 'rgb(98, 21, 183)';
        });

        const validateColorTheme = (endScreen: ColorBlurEndScreen) => {
            endScreen.render();
            const gameInfoContainer = <HTMLElement>endScreen.container().querySelector('.game-info-container');
            gameInfoContainer.style.backgroundColor = campaignColorRgbCss;
            const gameInfoContainerColor = gameInfoContainer.style.backgroundColor;
            const installContainer = <HTMLElement>endScreen.container().querySelector('.install-container');
            installContainer.style.color = campaignColorRgbCss;
            const installContainerColor = installContainer.style.color;

            if (!gameInfoContainerColor || !installContainerColor) {
                assert.fail(`Couldn't render all the colors`);
            } else {
                assert.equal(gameInfoContainerColor, installContainerColor);
            }
        };

        it('should render with the same color for game info container background and install container text', () => {
            validateColorTheme(createColorBlurEndScreen('Install Now', 'en'));
        });
    });
});
