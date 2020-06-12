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
    });

    const createExperimentEndScreen = (language: string, scheme: string | undefined, buttonColor: string | undefined): ExperimentEndScreen => {
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
            animation: EndScreenExperimentDeclaration.animation.BOUNCING
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

        validateTranslation(createExperimentEndScreen('fi', EndScreenExperimentDeclaration.scheme.LIGHT, EndScreenExperimentDeclaration.color.RED));
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
            if (c) {
                it(`renders ${c}`, () => {
                    validateExperimentAttributes(createExperimentEndScreen('fi', EndScreenExperimentDeclaration.scheme.LIGHT, c), c);
                });
            } else {
                it(`When c is undefined, it defaults to ${EndScreenExperimentDeclaration.color.BLUE}`, () => {
                    validateExperimentAttributes(createExperimentEndScreen('fi', EndScreenExperimentDeclaration.scheme.LIGHT, c), EndScreenExperimentDeclaration.color.BLUE);
                });
            }
        });

        //Dark mode should ignore the color of the button, and set it to '#2ba3ff'
        // validateExperimentAttributes(createExperimentEndScreen('fi', EndScreenExperimentDeclaration.scheme.DARK, EndScreenExperimentDeclaration.color.RED), '2ba3ff');
    });
});
