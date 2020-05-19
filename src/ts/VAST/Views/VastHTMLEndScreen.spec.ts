import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { VastCampaign } from 'VAST/Models/__mocks__/VastCampaign';
import { VastCampaign as VastCampaignBase } from 'VAST/Models/VastCampaign';
import { AdUnitContainer } from 'Ads/AdUnits/Containers/__mocks__/AdUnitContainer';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { Ads } from 'Ads/__mocks__/Ads';
import { FocusManager } from 'Core/Managers/__mocks__/FocusManager';
import { RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { ThirdPartyEventManager } from 'Ads/Managers/__mocks__/ThirdPartyEventManager';
import { OperativeEventManager } from 'Ads/Managers/__mocks__/OperativeEventManager';
import { Placement } from 'Ads/Models/__mocks__/Placement';
import { Platform } from 'Core/Constants/Platform';
import { AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { UserPrivacyManager } from 'Ads/Managers/__mocks__/UserPrivacyManager';
import { AbstractPrivacy } from 'Ads/Views/__mocks__/AbstractPrivacy';
import { PrivacySDK } from 'Privacy/__mocks__/PrivacySDK';
import { Store } from 'Store/__mocks__/Store';
import { Core } from 'Core/__mocks__/Core';
import { VastHTMLEndScreen } from 'VAST/Views/VastHTMLEndScreen';
import { InterstitialWebPlayerContainer } from 'Ads/Utilities/__mocks__/InterstitialWebPlayerContainer';

jest.mock('html/VastEndcardHTMLContent.html', () => {
    return {
        'default': 'HTML content test'
    };
});

jest.mock('html/VastHTMLEndScreen.html', () => {
    return {
        'default': 'HTML render test'
    };
});

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('VastHTMLEndScreen', () => {
        const adUnitContainer = new AdUnitContainer();
        const privacy = new AbstractPrivacy();
        const baseParams: IAdUnitParameters<VastCampaignBase> = {
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: new FocusManager(),
            container: adUnitContainer,
            deviceInfo: new DeviceInfo(),
            clientInfo: new ClientInfo(),
            thirdPartyEventManager: new ThirdPartyEventManager(),
            operativeEventManager: new OperativeEventManager(),
            placement: new Placement(),
            campaign: new VastCampaign(),
            platform: platform,
            core: new Core().Api,
            ads: new Ads().Api,
            store: new Store().Api,
            coreConfig: new CoreConfiguration(),
            adsConfig: new AdsConfiguration(),
            request: new RequestManager(),
            options: undefined,
            privacyManager: new UserPrivacyManager(),
            gameSessionId: 0,
            privacy: privacy,
            privacySDK: new PrivacySDK()
        };
        let htmlEndScreen: VastHTMLEndScreen;
        const webPlayer = new InterstitialWebPlayerContainer();

        beforeEach(() => {
            htmlEndScreen = new VastHTMLEndScreen(baseParams, webPlayer);
        });

        describe('when endcard is rendered', () => {
            it('the inner HTML should not be null', () => {
                htmlEndScreen.render();
                expect(htmlEndScreen.container().innerHTML).toEqual('HTML render test');
            });
        });

        describe('when endcard is showing', () => {
            it('it should show endcard overlay and reconfigure webplayer', () => {
                htmlEndScreen.show();
                expect(adUnitContainer.reconfigure).toHaveBeenCalled();
            });
        });

        describe('when privacy is closed', () => {
            it('the privacy should hide', () => {
                htmlEndScreen.onPrivacyClose();
                expect(privacy.hide).toHaveBeenCalled();
            });
        });

        describe('when privacy is closed', () => {
            it('the webview frames should change back', () => {
                htmlEndScreen.onPrivacyClose();
                expect(adUnitContainer.setViewFrame).toHaveBeenCalled();
            });
        });

        describe('when end card is closed', () => {
            it('the privacy hide should be called', () => {
                htmlEndScreen.remove();
                expect(privacy.hide).toHaveBeenCalled();
            });
        });
    });
});
