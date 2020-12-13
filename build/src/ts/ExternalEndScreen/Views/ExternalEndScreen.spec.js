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
import { ExternalEndScreen, ExternalEndScreenEventType } from 'ExternalEndScreen/Views/ExternalEndScreen';
import { EndScreenExperimentDeclaration } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { PerformanceCampaign } from 'Performance/Models/__mocks__/PerformanceCampaign';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('ExternalEndScreen', () => {
        const sendEvent = (type, options) => {
            return new Promise((res) => {
                window.postMessage(Object.assign({ type }, options), '*');
                setTimeout(res);
            });
        };
        const sendOpenEvent = (url) => sendEvent(ExternalEndScreenEventType.Open, { url });
        const sendMetricEvent = (metric) => sendEvent(ExternalEndScreenEventType.Metric, { metric });
        const sendGetParameterEvent = () => sendEvent(ExternalEndScreenEventType.GetParameters, {});
        const sendCloseEvent = () => sendEvent(ExternalEndScreenEventType.Close, {});
        const endScreenUrl = '/iframe-end-screen.html';
        const experimentDescription = {
            color: '',
            animation: EndScreenExperimentDeclaration.animation.BOUNCING
        };
        let externalEndScreen;
        let eventHandler;
        let endScreenParameters;
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
                return {
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
            return sendCloseEvent()
                .then(() => {
                expect(eventHandler.onEndScreenClose).toHaveBeenCalledTimes(1);
            });
        });
        it('should listen for download event from iframe', () => {
            return sendOpenEvent('sdk://download')
                .then(() => {
                expect(eventHandler.onEndScreenDownload).toHaveBeenCalledTimes(1);
            });
        });
        it('should listen for metric event from iframe', () => {
            const metric = 'external_end_screen_event';
            return sendMetricEvent(metric)
                .then(() => {
                expect(SDKMetrics.reportMetricEventWithTags).toHaveBeenCalledWith(metric, {});
            });
        });
        describe('Privacy handling', () => {
            it('should open privacy\'s pop-up', () => {
                return sendOpenEvent('sdk://privacy')
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXh0ZXJuYWxFbmRTY3JlZW4uc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9FeHRlcm5hbEVuZFNjcmVlbi9WaWV3cy9FeHRlcm5hbEVuZFNjcmVlbi5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxFQUFFO0lBQzFDLE9BQU87UUFDSCxTQUFTLEVBQUUsMENBQTBDO0tBQ3hELENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUM5RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDOUQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUN0RSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFM0MsT0FBTyxFQUFFLGlCQUFpQixFQUFFLDBCQUEwQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDMUcsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDcEcsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFDdkYsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRXRELENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0lBQ2hELFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7UUFD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