jest.mock('html/ExternalEndScreen.html', () => {
    return {
        default: '<iframe id="iframe-end-screen"></iframe>'
    };
});

import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { Platform } from 'Core/Constants/Platform';
import { AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { AbstractPrivacy } from 'Ads/Views/__mocks__/AbstractPrivacy';
import { Core } from 'Core/__mocks__/Core';
import { IEndScreenHandler, IEndScreenParameters } from 'Ads/Views/EndScreen';
import { ExternalEndScreen } from 'ExternalEndScreen/Views/ExternalEndScreen';
import { ButtonExperimentDeclaration } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { PerformanceCampaign } from 'Performance/Models/__mocks__/PerformanceCampaign';
import { ColorTheme } from 'Core/Utilities/ColorTheme.ts';

[Platform.ANDROID, Platform.IOS].forEach((platform) => {
    describe('ExternalEndScreen', () => {
        // const privacy = new AbstractPrivacy();
        // const deviceInfo = new DeviceInfo();
        // const clientInfo = new ClientInfo();
        const campaign = new PerformanceCampaign();
        // const coreConfig = new CoreConfiguration();
        // const adsConfig = new AdsConfiguration();
        const core = new Core().Api;

        const endScreenUrl = '/iframe-end-screen.html';
        const experimentDescription = {
            color: '',
            animation: ButtonExperimentDeclaration.animation.BOUNCING
        };

        let externalEndScreen: ExternalEndScreen;
        let eventHandler: IEndScreenHandler;
        let endScreenParameters: IEndScreenParameters;

        beforeEach(() => {
            const privacy = new AbstractPrivacy();
            const deviceInfo = new DeviceInfo();
            const clientInfo = new ClientInfo();
            const campaign = new PerformanceCampaign();
            const coreConfig = new CoreConfiguration();
            const adsConfig = new AdsConfiguration();
            // const 

            campaign.getEndScreen = jest.fn().mockImplementation(() => {
                return {
                    getUrl: jest.fn(() => endScreenUrl)
                };
            });

            privacy.container = jest.fn(() => document.createElement('div'));

            endScreenParameters = jest.fn(() => {
                return <IEndScreenParameters>{
                    platform: platform,
                    core: new Core().Api,
                    language: deviceInfo.getLanguage(),
                    gameId: clientInfo.getGameId(),
                    targetGameName: campaign.getGameName(),
                    abGroup: coreConfig.getAbGroup(),
                    privacy: privacy,
                    showGDPRBanner: true,
                    adUnitStyle: undefined,
                    campaignId: campaign.getId(),
                    osVersion: undefined,
                    hidePrivacy: adsConfig.getHidePrivacy()
                };
            })();

            externalEndScreen = new ExternalEndScreen(experimentDescription, endScreenParameters, campaign, 'US');

            eventHandler = jest.fn().mockImplementation(() => {
                return {
                    onEndScreenDownload: jest.fn(),
                    onEndScreenClose: jest.fn(),
                    onGDPRPopupSkipped: jest.fn()
                };
            })();

            externalEndScreen.addEventHandler(eventHandler);
        });

        afterEach(() => {
            externalEndScreen.onCloseEvent();
            const privacyContainer = endScreenParameters.privacy.container();
            if (privacyContainer && privacyContainer.parentElement) {
                privacyContainer.parentElement.removeChild(privacyContainer);
            }
        });

        it('should not have empty HTML when rendered', () => {
            externalEndScreen.render();
            expect(externalEndScreen.container().innerHTML).toContain('iframe-end-screen');
        });

        it('should successfully converts the 6 variants to their RGB values', async () => {
            const getColorTheme = async () => {
                return ColorTheme.renderColorTheme(campaign, core);
            };

            await getColorTheme().then((theme) => {
                // assert.equal(theme.baseColorTheme.light.toCssRgb(), 'rgb(215, 186, 247)');
                // assert.equal(theme.baseColorTheme.medium.toCssRgb(), 'rgb(98, 21, 183)');
                // assert.equal(theme.baseColorTheme.dark.toCssRgb(), 'rgb(61, 13, 114)');
                // assert.equal(theme.secondaryColorTheme.light.toCssRgb(), 'rgb(206, 192, 242)');
                // assert.equal(theme.secondaryColorTheme.medium.toCssRgb(), 'rgb(73, 36, 168)');
                // assert.equal(theme.secondaryColorTheme.dark.toCssRgb(), 'rgb(45, 22, 105)');
                expect(theme.secondaryColorTheme.dark.toCssRgb()).toEqual('rgb(45, 22, 105)');
            });
        });
    });
});
