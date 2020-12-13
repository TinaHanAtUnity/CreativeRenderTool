import { XHRequest } from 'Core/Utilities/XHRequest';
import { Platform } from 'Core/Constants/Platform';
import { ExternalMRAIDEndScreen } from 'ExternalEndScreen/Views/ExternalMRAIDEndScreen';
import { Core } from 'Core/__mocks__/Core';
import { AbstractPrivacy } from 'Ads/Views/__mocks__/AbstractPrivacy';
import { DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { PerformanceCampaign } from 'Performance/Models/__mocks__/PerformanceCampaign';
import { CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
// Required due to the ExternalEndScreen base class importing it inside the constructor
jest.mock('html/ExternalEndScreen.html', () => {
    return {
        'default': '<iframe id="iframe-end-screen"></iframe>'
    };
});
jest.mock('html/mraidEndScreen/MraidEndScreenContainer.html', () => {
    return {
        'default': ''
    };
});
jest.mock('html/mraidEndScreen/ExternalMRAIDEndScreen.html', () => {
    return {
        'default': `
<div class="close-region">
    <div class="close">
        <span class="icon-close"></span>
        <div class="circle-base"></div>
        <div class="progress-wrapper">
            <div class="circle-left"></div>
            <div class="circle-right"></div>
        </div>
    </div>
</div>
<iframe id="iframe-end-screen" scrolling="no" sandbox="allow-scripts"></iframe>
<div class="gdpr-pop-up">
    <div class="icon-gdpr"></div>
    <div class="gdpr-text">
        <%= data.t("privacy-legitimate-interest-pop-up-1") %>
        <span class="gdpr-link"><%= data.t("privacy-legitimate-interest-pop-up-2") %></span>
        <%= data.t("privacy-legitimate-interest-pop-up-3") %>
    </div>
</div>
`
    };
});
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('ExternalMRAIDEndScreen on ' + (platform === Platform.ANDROID ? 'android' : 'ios'), () => {
        let externalMRAIDEndScreen;
        let endScreenParameters;
        const sendEvent = (type) => {
            return new Promise((res) => {
                window.postMessage({
                    type
                }, '*');
                setTimeout(res);
            });
        };
        const sendCloseEvent = () => sendEvent('close');
        const sendLoadedEvent = () => sendEvent('loaded');
        const sendOpenEvent = () => sendEvent('open');
        const originalXHRequestGet = XHRequest.get;
        beforeEach(() => {
            const privacy = new AbstractPrivacy();
            const deviceInfo = new DeviceInfo();
            const clientInfo = new ClientInfo();
            const campaign = new PerformanceCampaign();
            const coreConfig = new CoreConfiguration();
            const adsConfig = new AdsConfiguration();
            const core = new Core().Api;
            campaign.getEndScreen = jest.fn().mockImplementation(() => {
                return {
                    getUrl: jest.fn(() => undefined),
                    getFileId: jest.fn(() => undefined),
                    getOriginalUrl: jest.fn(() => undefined)
                };
            });
            campaign.getEndScreenSettings = jest.fn().mockImplementation(() => {
                return undefined;
            });
            endScreenParameters = jest.fn(() => {
                return {
                    platform: platform,
                    core: core,
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
            externalMRAIDEndScreen = new ExternalMRAIDEndScreen(endScreenParameters, campaign, 'US');
            externalMRAIDEndScreen.onCloseEvent = jest.fn();
            externalMRAIDEndScreen.onOpen = jest.fn();
            XHRequest.get = jest.fn().mockReturnValue(new Promise(() => ''));
        });
        afterEach(() => {
            XHRequest.get = originalXHRequestGet;
        });
        it('should contain iframe-end-screen when rendered', () => {
            externalMRAIDEndScreen.render();
            expect(externalMRAIDEndScreen.container().innerHTML).toContain('iframe-end-screen');
        });
        describe('when playable is loaded and show is called', () => {
            beforeEach(() => {
                externalMRAIDEndScreen.render();
                return sendLoadedEvent().then(() => {
                    externalMRAIDEndScreen.show();
                });
            });
            it('should not have been closed', () => {
                expect(externalMRAIDEndScreen.onCloseEvent).toHaveBeenCalledTimes(0);
            });
            it('should listen for close event from iframe', () => {
                return sendCloseEvent().then(() => {
                    expect(externalMRAIDEndScreen.onCloseEvent).toHaveBeenCalledTimes(1);
                });
            });
            it('should listen for mraid.open event', () => {
                return sendOpenEvent().then(() => {
                    expect(externalMRAIDEndScreen.onOpen).toHaveBeenCalledTimes(1);
                });
            });
        });
        describe('when playable is not ready', () => {
            beforeEach(() => {
                externalMRAIDEndScreen.render();
                externalMRAIDEndScreen.show();
            });
            it('should have been closed', () => {
                expect(externalMRAIDEndScreen.onCloseEvent).toHaveBeenCalledTimes(1);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXh0ZXJuYWxNUkFJREVuZFNjcmVlbi5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0V4dGVybmFsRW5kU2NyZWVuL1ZpZXdzL0V4dGVybmFsTVJBSURFbmRTY3JlZW4uc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDckQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBRXhGLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDdEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQzlELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUM5RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUN2RixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUV6RSx1RkFBdUY7QUFDdkYsSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUU7SUFDMUMsT0FBTztRQUNILFNBQVMsRUFBRSwwQ0FBMEM7S0FDeEQsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLElBQUksQ0FBQyxrREFBa0QsRUFBRSxHQUFHLEVBQUU7SUFDL0QsT0FBTztRQUNILFNBQVMsRUFBRSxFQUFFO0tBQ2hCLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxJQUFJLENBQUMsaURBQWlELEVBQUUsR0FBRyxFQUFF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