import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Privacy } from 'Ads/Views/Privacy';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { ExperimentEndScreen } from 'MabExperimentation/Performance/Views/ExperimentEndScreen';
import { EndScreenExperimentDeclaration } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { ColorUtils } from 'MabExperimentation/Utilities/ColorUtils';
import { AutomatedExperimentManager } from 'MabExperimentation/AutomatedExperimentManager';
describe('ExperimentEndScreenTest', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let configuration;
    let privacy;
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        configuration = TestFixtures.getCoreConfiguration();
        sandbox.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
        sandbox.stub(SDKMetrics, 'reportMetricEventWithTags').returns(Promise.resolve());
    });
    afterEach(() => {
        sandbox.restore();
    });
    const createExperimentEndScreen = (language, scheme, buttonColor, ctaText) => {
        const privacyManager = sinon.createStubInstance(UserPrivacyManager);
        const campaign = TestFixtures.getCampaign();
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
        // Non-default experiment description
        const experimentDescription = {
            scheme: scheme,
            color: buttonColor,
            animation: EndScreenExperimentDeclaration.animation.BOUNCING,
            cta_text: ctaText
        };
        return new ExperimentEndScreen(experimentDescription, params, campaign, new AutomatedExperimentManager());
    };
    it('should render with translations', () => {
        const validateTranslation = (endScreen) => {
            endScreen.render();
            const downloadElement = endScreen.container().querySelectorAll('.download-text')[0];
            assert.equal(downloadElement.innerHTML, 'Lataa ilmaiseksi');
            const container = privacy.container();
            if (container && container.parentElement) {
                container.parentElement.removeChild(container);
            }
            else {
                assert.fail(`${container.parentElement}`);
            }
        };
        validateTranslation(createExperimentEndScreen('fi', EndScreenExperimentDeclaration.scheme.LIGHT, EndScreenExperimentDeclaration.color.RED, EndScreenExperimentDeclaration.cta_text.DOWNLOAD_FOR_FREE));
    });
    describe('CTA color variants', () => {
        // RGBToHex transforms a string in the "rgb(1, 12, 123)" format to the "#010C7B"
        function RGBToHex(rgb) {
            const sep = rgb.indexOf(',') > -1 ? ',' : ' ';
            const splitRgb = rgb.substr(4).split(')')[0].split(sep);
            let res = '#';
            splitRgb.forEach((component) => {
                let c = (+component).toString(16);
                if (c.length === 1) {
                    c = '0' + c;
                }
                res += c;
            });
            return res;
        }
        const validateExperimentAttributes = (endScreen, buttonColor) => {
            endScreen.render();
            const downloadButton = endScreen.container().querySelectorAll('.download-container')[0];
            const color = downloadButton.style.backgroundColor;
            if (color == null) {
                assert.fail('button backgroundColor is null');
            }
            else {
                assert.equal(RGBToHex(color.toString()), `#${buttonColor}`);
            }
            const container = privacy.container();
            if (container && container.parentElement) {
                container.parentElement.removeChild(container);
            }
        };
        Object.values(EndScreenExperimentDeclaration.color).forEach((c) => {
            if (c && !ColorUtils.isDarkSchemeColor(c)) {
                it(`renders ${c}`, () => {
                    validateExperimentAttributes(createExperimentEndScreen('fi', EndScreenExperimentDeclaration.scheme.LIGHT, c, EndScreenExperimentDeclaration.cta_text.DOWNLOAD_NOW_FIRE), c);
                });
            }
            else if (c && ColorUtils.isDarkSchemeColor(c)) {
                it(`renders ${c}`, () => {
                    validateExperimentAttributes(createExperimentEndScreen('fi', EndScreenExperimentDeclaration.scheme.DARK, c, EndScreenExperimentDeclaration.cta_text.DOWNLOAD_NOW_FIRE), c);
                });
            }
            else {
                it(`When c is undefined and the scheme is light, it defaults to ${EndScreenExperimentDeclaration.color.GREEN}`, () => {
                    validateExperimentAttributes(createExperimentEndScreen('fi', EndScreenExperimentDeclaration.scheme.LIGHT, c, EndScreenExperimentDeclaration.cta_text.DOWNLOAD_NOW_FIRE), EndScreenExperimentDeclaration.color.GREEN);
                });
                it(`When c is undefined and the scheme is dark, it defaults to ${EndScreenExperimentDeclaration.color.DARK_BLUE}`, () => {
                    validateExperimentAttributes(createExperimentEndScreen('fi', EndScreenExperimentDeclaration.scheme.DARK, c, EndScreenExperimentDeclaration.cta_text.DOWNLOAD_NOW_FIRE), EndScreenExperimentDeclaration.color.DARK_BLUE);
                });
            }
        });
    });
    describe('CTA text variants', () => {
        const formatCtaText = (cta) => {
            switch (cta) {
                case EndScreenExperimentDeclaration.cta_text.DOWNLOAD:
                    return 'Download';
                case EndScreenExperimentDeclaration.cta_text.DOWNLOAD_FOR_FREE:
                    return 'Download For Free';
                case EndScreenExperimentDeclaration.cta_text.DOWNLOAD_NOW:
                    return 'Download Now!';
                case EndScreenExperimentDeclaration.cta_text.DOWNLOAD_NOW_FIRE:
                    return '🔥 Download Now 🔥';
                case EndScreenExperimentDeclaration.cta_text.GET:
                    return 'Get';
                case EndScreenExperimentDeclaration.cta_text.GET_STARTED:
                    return 'Get Started!';
                case EndScreenExperimentDeclaration.cta_text.INSTALL_NOW:
                    return 'Install Now';
                case EndScreenExperimentDeclaration.cta_text.LETS_TRY_IT:
                    return `Let's try it!`;
                case EndScreenExperimentDeclaration.cta_text.OK:
                    return 'OK!';
                default:
            }
        };
        const validateCtaText = (endScreen, ctaText) => {
            endScreen.render();
            const downloadElement = endScreen.container().querySelectorAll('.download-text')[0];
            const downloadElementText = downloadElement.innerHTML;
            assert.isNotNull(downloadElementText);
            assert.equal(downloadElementText, ctaText);
            const container = privacy.container();
            if (container && container.parentElement) {
                container.parentElement.removeChild(container);
            }
        };
        describe('For English language', () => {
            Object.values(EndScreenExperimentDeclaration.cta_text).forEach((cta) => {
                if (cta) {
                    it(`should render ${cta} `, () => {
                        validateCtaText(createExperimentEndScreen('en', EndScreenExperimentDeclaration.scheme.LIGHT, EndScreenExperimentDeclaration.color.BLUE, cta), formatCtaText(cta));
                    });
                }
                else {
                    it('should default to Download For Free when cta is undefined', () => {
                        validateCtaText(createExperimentEndScreen('en', EndScreenExperimentDeclaration.scheme.LIGHT, EndScreenExperimentDeclaration.color.BLUE, cta), formatCtaText(EndScreenExperimentDeclaration.cta_text.DOWNLOAD_FOR_FREE));
                    });
                }
            });
        });
        describe('For other languages', () => {
            it('should ignore the cta provided, default to Download For Free and localize it', () => {
                validateCtaText(createExperimentEndScreen('fi', EndScreenExperimentDeclaration.scheme.LIGHT, EndScreenExperimentDeclaration.color.BLUE, EndScreenExperimentDeclaration.cta_text.DOWNLOAD_NOW_FIRE), 'Lataa ilmaiseksi');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhwZXJpbWVudEVuZFNjcmVlblRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvUGVyZm9ybWFuY2UvRXhwZXJpbWVudEVuZFNjcmVlblRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFckUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTVDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBS25ELE9BQU8sT0FBTyxDQUFDO0FBRWYsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBQy9GLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBQ3BHLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN0RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDckUsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFFM0YsUUFBUSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtJQUNyQyxJQUFJLFFBQWtCLENBQUM7SUFDdkIsSUFBSSxPQUFnQixDQUFDO0lBQ3JCLElBQUksWUFBMEIsQ0FBQztJQUMvQixJQUFJLElBQWMsQ0FBQztJQUNuQixJQUFJLGFBQWdDLENBQUM7SUFDckMsSUFBSSxPQUFnQixDQUFDO0lBQ3JCLElBQUksT0FBMkIsQ0FBQztJQUVoQyxVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1osT0FBTyxHQUFHLEtBQUssQ0FBQyxhQUFh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