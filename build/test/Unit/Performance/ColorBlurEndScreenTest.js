import * as tslib_1 from "tslib";
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Privacy } from 'Ads/Views/Privacy';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { ColorBlurEndScreen } from 'MabExperimentation/Performance/Views/ColorBlurEndScreen';
import { EndScreenExperimentDeclaration } from 'MabExperimentation/Models/AutomatedExperimentsList';
describe('ColorBlurEndScreenTest', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let configuration;
    let privacy;
    let sandbox;
    let campaign;
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
    });
    afterEach(() => {
        sandbox.restore();
        const container = privacy.container();
        if (container && container.parentElement) {
            container.parentElement.removeChild(container);
        }
    });
    const createColorBlurEndScreen = (ctaText, language) => {
        const privacyManager = sinon.createStubInstance(UserPrivacyManager);
        privacy = new Privacy(platform, campaign, privacyManager, false, false, 'en');
        const params = {
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
            cta_text: ctaText
        };
        return new ColorBlurEndScreen(experimentDescription, params, campaign);
    };
    describe('Locales for Install Now and Free', () => {
        const validateTranslation = (endScreen, downloadText, freeText) => {
            endScreen.render();
            const downloadElement = endScreen.container().querySelectorAll('.download-text')[0];
            const freeElement = endScreen.container().querySelectorAll('.free-text')[0];
            assert.equal(downloadElement.innerHTML, downloadText);
            assert.equal(freeElement.innerHTML, freeText);
            //cleanup
            const container = privacy.container();
            if (container && container.parentElement) {
                container.parentElement.removeChild(container);
            }
            else {
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
    describe('Color matching for the game info container and the install container', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        let campaignColorRgbCss;
        beforeEach(() => {
            campaignColorRgbCss = 'rgb(98, 21, 183)';
        });
        const validateColorTheme = (endScreen) => {
            endScreen.render();
            const gameInfoContainer = endScreen.container().querySelector('.game-info-container');
            gameInfoContainer.style.backgroundColor = campaignColorRgbCss;
            const gameInfoContainerColor = gameInfoContainer.style.backgroundColor;
            const installContainer = endScreen.container().querySelector('.install-container');
            installContainer.style.color = campaignColorRgbCss;
            const installContainerColor = installContainer.style.color;
            if (!gameInfoContainerColor || !installContainerColor) {
                assert.fail(`Couldn't render all the colors`);
            }
            else {
                assert.equal(gameInfoContainerColor, installContainerColor);
            }
        };
        it('should render with the same color for game info container background and install container text', () => {
            validateColorTheme(createColorBlurEndScreen('Install Now', 'en'));
        });
    }));
    describe('Alternate CTA text', () => {
        const validateCtaText = (endScreen, ctaText) => {
            endScreen.render();
            const downloadElement = endScreen.container().querySelectorAll('.download-text')[0];
            const downloadElementText = downloadElement.innerHTML;
            assert.isNotNull(downloadElementText);
            assert.equal(downloadElementText, ctaText);
            if (ctaText === EndScreenExperimentDeclaration.cta_text.DOWNLOAD_FOR_FREE) {
                const installBtnClasses = endScreen.container().querySelectorAll('.install-container')[0].className;
                assert.include(installBtnClasses, 'cta-alt-text');
            }
        };
        it(`should render Install Now`, () => {
            validateCtaText(createColorBlurEndScreen(EndScreenExperimentDeclaration.cta_text.INSTALL_NOW, 'en'), 'Install Now');
        });
        it(`should render Download For Free`, () => {
            validateCtaText(createColorBlurEndScreen(EndScreenExperimentDeclaration.cta_text.DOWNLOAD_FOR_FREE, 'en'), 'Download For Free');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sb3JCbHVyRW5kU2NyZWVuVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9QZXJmb3JtYW5jZS9Db2xvckJsdXJFbmRTY3JlZW5UZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUVyRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFNUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFJbkQsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHlEQUF5RCxDQUFDO0FBRzdGLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBRXBHLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUU7SUFDcEMsSUFBSSxRQUFrQixDQUFDO0lBQ3ZCLElBQUksT0FBZ0IsQ0FBQztJQUNyQixJQUFJLFlBQTBCLENBQUM7SUFDL0IsSUFBSSxJQUFjLENBQUM7SUFDbkIsSUFBSSxhQUFnQyxDQUFDO0lBQ3JDLElBQUksT0FBZ0IsQ0FBQztJQUNyQixJQUFJLE9BQTJCLENBQUM7SUFDaEMsSUFBSSxRQUE2QixDQUFDO0lBRWxDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDWixPQUFPLEdBQUcsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ2hDLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQzVCLE9BQU8sR0FBRyxZQUFZ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