import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Localization } from 'Core/Utilities/Localization';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { ColorBlurEndScreen } from 'MabExperimentation/Performance/Views/ColorBlurEndScreen';

describe('ColorBlurEndScreenTest', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let configuration: CoreConfiguration;
    let privacy: Privacy;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        // This hack is necessary, otherwise the 'fi' language renders in English
        // Note: this behavior is unique to testing, it renders in the proper language
        // on devices and in browser (have to use 'fin' in browser nuild)
        Localization.setLanguageMap('fi.*', 'endscreen', {
            'Install Now': 'Asenna nyt',
            Free: 'Ilmainen'
        });
        configuration = TestFixtures.getCoreConfiguration();
        sandbox.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
        sandbox.stub(SDKMetrics, 'reportMetricEventWithTags').returns(Promise.resolve());
    });

    afterEach(() => {
        sandbox.restore();
    });

    const createColorBlurEndScreen = (language: string): ColorBlurEndScreen => {
        const privacyManager = sinon.createStubInstance(UserPrivacyManager);
        const campaign = TestFixtures.getCampaign();
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

        return new ColorBlurEndScreen(params, campaign);
    };

    describe('Testing new locales for Install Now and Free', () => {
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
            validateTranslation(createColorBlurEndScreen('ko'), '다운로드', '무료');
        });
        it('renders da_DK', () => {
            validateTranslation(createColorBlurEndScreen('da_DK'), 'Installér nu', 'Gratis');
        });
        it('renders de', () => {
            validateTranslation(createColorBlurEndScreen('de'), 'Installieren', 'Gratis');
        });
        it('renders es', () => {
            validateTranslation(createColorBlurEndScreen('es'), 'Instalar Ahora', 'Gratis');
        });
        it('renders fi', () => {
            validateTranslation(createColorBlurEndScreen('fi'), 'Asenna nyt', 'Ilmainen');
        });
        it('renders fr', () => {
            validateTranslation(createColorBlurEndScreen('fr'), 'Installer', 'Gratuit');
        });
        it('renders is', () => {
            validateTranslation(createColorBlurEndScreen('is'), 'Setja upp', 'Frítt');
        });
        it('renders it', () => {
            validateTranslation(createColorBlurEndScreen('it'), 'Installa Ora', 'Gratis');
        });
        it('renders ja', () => {
            validateTranslation(createColorBlurEndScreen('ja'), 'インストール', '無料');
        });
        it('renders lt', () => {
            validateTranslation(createColorBlurEndScreen('lt'), 'Atsisiųsti', 'Nemokamai');
        });
        it('renders nb', () => {
            validateTranslation(createColorBlurEndScreen('nb'), 'Installere nå', 'Gratis');
        });
        it('renders pt', () => {
            validateTranslation(createColorBlurEndScreen('pt'), 'Instale Agora', 'Grátis');
        });
        it('renders ro', () => {
            validateTranslation(createColorBlurEndScreen('ro'), 'Descarcă', 'Gratis');
        });
        it('renders ru', () => {
            validateTranslation(createColorBlurEndScreen('ru'), 'Установить', 'бесплатно');
        });
        it('renders tr', () => {
            validateTranslation(createColorBlurEndScreen('tr'), 'Şimdi Kur', 'ücretsiz');
        });
        it('renders zh_Hans', () => {
            validateTranslation(createColorBlurEndScreen('zh_Hans'), '立即下載', '免费');
        });
        it('renders zh_Hant', () => {
            validateTranslation(createColorBlurEndScreen('zh_Hant'), '立即下载', '免费');
        });
    });

    it('should render with the same color applied to downloadButton, installText, and freeTextColor', () => {
        const validateExperimentAttributes = (endScreen: ColorBlurEndScreen) => {
            endScreen.render();
            const gameInfoContainer = <HTMLElement>endScreen.container().querySelector('.game-info-container');
            const gameInfoContainerColor = gameInfoContainer.style.backgroundColor;

            const installContainer = <HTMLElement>endScreen.container().querySelector('.install-container');
            const installContainerColor = installContainer.style.color;

            if (!gameInfoContainerColor || !installContainerColor) {
                assert.fail('Couldnt render all the colors');
            } else {
                assert.equal(gameInfoContainerColor, installContainerColor);
            }

            const container = privacy.container();
            if (container && container.parentElement) {
                container.parentElement.removeChild(container);
            }
        };

        //Color Blur should have the same color for all three elements
        validateExperimentAttributes(createColorBlurEndScreen('en'));
    });
});
