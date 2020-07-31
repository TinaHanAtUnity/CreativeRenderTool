jest.mock('html/ExternalEndScreen.html', () => {
    return {
        'default': '<iframe id="iframe-end-screen"></iframe>'
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
import { EndScreenExperimentDeclaration } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { PerformanceCampaign } from 'Performance/Models/__mocks__/PerformanceCampaign';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('ExternalEndScreen', () => {
        const sendEvent = (type: string, url?: string) => {
            return new Promise((res) => {
                window.postMessage({
                    type,
                    url
                }, '*');
                setTimeout(res);
            });
        };

        const endScreenUrl = '/iframe-end-screen.html';
        const experimentDescription = {
            color: '',
            animation: EndScreenExperimentDeclaration.animation.BOUNCING
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

        it('should close the end screen when iframe is ready', () => {
            externalEndScreen.render();
            externalEndScreen.show();
            expect(eventHandler.onEndScreenClose).toBeCalledTimes(1);
        });

        it('should listen for close event from iframe', () => {
            return sendEvent('close')
                .then(() => {
                    expect(eventHandler.onEndScreenClose).toHaveBeenCalledTimes(1);
                });
        });

        it('should listen for download event from iframe', () => {
            return sendEvent('open', 'sdk://download')
                .then(() => {
                    expect(eventHandler.onEndScreenDownload).toHaveBeenCalledTimes(1);
                });
        });

        describe('Privacy handling', () => {
            it('should open privacy\'s pop-up', () => {
                return sendEvent('open', 'sdk://privacy')
                    .then(() => {
                        expect(endScreenParameters.privacy.show).toHaveBeenCalledTimes(1);
                    });
            });

            it('should hide privacy\'s pop-up', () => {
                externalEndScreen.onPrivacyClose();

                // 1st time in the ExternalEndScreen's constructor
                // 2nd time when onPrivacyClose is called.
                expect(endScreenParameters.privacy.hide).toHaveBeenCalledTimes(2);
            });

            it('should send GDPR events when ad is skipped and GDPR banner has not been clicked on', () => {
                externalEndScreen.render();
                externalEndScreen.hide();

                expect(eventHandler.onGDPRPopupSkipped).toHaveBeenCalled();
            });
        });
    });
});
