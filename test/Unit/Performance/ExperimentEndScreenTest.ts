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
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { ExperimentEndScreen } from 'MabExperimentation/Performance/Views/ExperimentEndScreen';
import { EndScreenExperimentDeclaration } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { ColorUtils } from 'Core/Utilities/ColorUtils';

describe('ExperimentEndScreenTest', () => {
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
        Localization.setLanguageMap('fi.*', 'endscreen', {
            'Download For Free': 'Lataa ilmaiseksi'
        });
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

    const createExperimentEndScreen = (
        language: string,
        scheme: string | undefined,
        buttonColor: string | undefined,
        ctaText: string | undefined
    ): ExperimentEndScreen => {
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
        // Non-default experiment description
        const experimentDescription = {
            scheme: scheme,
            color: buttonColor,
            animation: EndScreenExperimentDeclaration.animation.BOUNCING,
            cta_text: ctaText
        };
        return new ExperimentEndScreen(experimentDescription, params, campaign);
    };

    it('should render with translations', () => {
        const validateTranslation = (endScreen: PerformanceEndScreen) => {
            endScreen.render();
            const downloadElement = endScreen.container().querySelectorAll('.download-text')[0];
            assert.equal(downloadElement.innerHTML, 'Lataa ilmaiseksi');
            const container = privacy.container();
            if (container && container.parentElement) {
                container.parentElement.removeChild(container);
            } else {
                assert.fail(`${container.parentElement}`);
            }
        };

        validateTranslation(
            createExperimentEndScreen(
                'fi',
                EndScreenExperimentDeclaration.scheme.LIGHT,
                EndScreenExperimentDeclaration.color.RED,
                EndScreenExperimentDeclaration.cta_text.DOWNLOAD_FOR_FREE
            )
        );
    });

    describe('should render correct experiment attributes', () => {
        // RGBToHex transforms a string in the "rgb(1, 12, 123)" format to the "#010C7B"
        function RGBToHex(rgb: string): string {
            const sep = rgb.indexOf(',') > -1 ? ',' : ' ';
            const splitRgb = rgb.substr(4).split(')')[0].split(sep);
            let res = '#';
            splitRgb.forEach((component: string) => {
                let c = (+component).toString(16);
                if (c.length === 1) {
                    c = '0' + c;
                }
                res += c;
            });
            return res;
        }

        const validateExperimentAttributes = (endScreen: PerformanceEndScreen, buttonColor: string | undefined) => {
            endScreen.render();
            const downloadButton = <HTMLElement>endScreen.container().querySelectorAll('.download-container')[0];
            const color = downloadButton.style.backgroundColor;
            if (color == null) {
                assert.fail('button backgroundColor is null');
            } else {
                assert.equal(RGBToHex(color.toString()), `#${buttonColor}`);
            }

            const container = privacy.container();
            if (container && container.parentElement) {
                container.parentElement.removeChild(container);
            }
        };

        Object.values(EndScreenExperimentDeclaration.color).forEach((c: string | undefined) => {
            if (c && !ColorUtils.isDarkSchemeColor(c)) {
                it(`renders ${c}`, () => {
                    validateExperimentAttributes(
                        createExperimentEndScreen(
                            'fi',
                            EndScreenExperimentDeclaration.scheme.LIGHT,
                            c,
                            EndScreenExperimentDeclaration.cta_text.DOWNLOAD_NOW_FIRE
                        ),
                        c
                    );
                });
            } else if (c && ColorUtils.isDarkSchemeColor(c)) {
                it(`renders ${c}`, () => {
                    validateExperimentAttributes(
                        createExperimentEndScreen(
                            'fi',
                            EndScreenExperimentDeclaration.scheme.DARK,
                            c,
                            EndScreenExperimentDeclaration.cta_text.DOWNLOAD_NOW_FIRE
                        ),
                        c
                    );
                });
            } else {
                it(`When c is undefined and the scheme is light, it defaults to ${EndScreenExperimentDeclaration.color.BLUE}`, () => {
                    validateExperimentAttributes(
                        createExperimentEndScreen(
                            'fi',
                            EndScreenExperimentDeclaration.scheme.LIGHT,
                            c,
                            EndScreenExperimentDeclaration.cta_text.DOWNLOAD_NOW_FIRE
                        ),
                        EndScreenExperimentDeclaration.color.BLUE
                    );
                });

                it(`When c is undefined and the scheme is dark, it defaults to ${EndScreenExperimentDeclaration.color.DARK_BLUE}`, () => {
                    validateExperimentAttributes(
                        createExperimentEndScreen(
                            'fi',
                            EndScreenExperimentDeclaration.scheme.DARK,
                            c,
                            EndScreenExperimentDeclaration.cta_text.DOWNLOAD_NOW_FIRE
                        ),
                        EndScreenExperimentDeclaration.color.DARK_BLUE
                    );
                });
            }
        });

        describe('CTA text variants', () => {
            const formatCtaText = (cta: string | undefined) => {
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

            const validateCtaText = (endScreen: ExperimentEndScreen, ctaText: string | undefined) => {
                endScreen.render();

                const downloadElement = <HTMLElement>endScreen.container().querySelectorAll('.download-text')[0];
                const downloadElementText = downloadElement.innerHTML;

                assert.isNotNull(downloadElementText);
                assert.equal(downloadElementText, ctaText);

                const container = privacy.container();
                if (container && container.parentElement) {
                    container.parentElement.removeChild(container);
                }
            };

            describe('For English language', () => {
                Object.values(EndScreenExperimentDeclaration.cta_text).forEach((cta: string | undefined) => {
                    if (cta) {
                        it(`should render ${cta} `, () => {
                            validateCtaText(
                                createExperimentEndScreen('en', EndScreenExperimentDeclaration.scheme.LIGHT, EndScreenExperimentDeclaration.color.BLUE, cta),
                                formatCtaText(cta)
                            );
                        });
                    } else {
                        it('should default to Download For Free when cta is undefined', () => {
                            validateCtaText(
                                createExperimentEndScreen('en', EndScreenExperimentDeclaration.scheme.LIGHT, EndScreenExperimentDeclaration.color.BLUE, cta),
                                formatCtaText(EndScreenExperimentDeclaration.cta_text.DOWNLOAD_FOR_FREE)
                            );
                        });
                    }
                });
            });

            describe('For other languages', () => {
                it('should ignore the cta provided, default to Download For Free and localize it', () => {
                    validateCtaText(
                        createExperimentEndScreen(
                            'fi',
                            EndScreenExperimentDeclaration.scheme.LIGHT,
                            EndScreenExperimentDeclaration.color.BLUE,
                            EndScreenExperimentDeclaration.cta_text.DOWNLOAD_NOW_FIRE
                        ),
                        'Lataa ilmaiseksi'
                    );
                });
            });
        });
    });
});
