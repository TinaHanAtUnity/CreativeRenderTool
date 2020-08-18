import { XHRequest } from 'Core/Utilities/XHRequest';
import { Platform } from 'Core/Constants/Platform';
import { ExternalMRAIDEndScreen } from 'ExternalEndScreen/Views/ExternalMRAIDEndScreen';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
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
        let externalMRAIDEndScreen: ExternalMRAIDEndScreen;
        let endScreenParameters: IEndScreenParameters;

        const sendEvent = (type: string) => {
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
                return <IEndScreenParameters>{
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
