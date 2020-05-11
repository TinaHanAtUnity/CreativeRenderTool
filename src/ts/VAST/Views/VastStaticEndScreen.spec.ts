import { VastStaticEndScreen } from 'VAST/Views/VastStaticEndScreen';
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

jest.mock('html/VastStaticEndScreen.html', () => {
    return {
        'default': 'HTMLRenderTest'
    };
});

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('VastStaticEndScreen', () => {
        const privacy = new AbstractPrivacy();
        const baseParams = jest.fn(() => {
            return <IAdUnitParameters<VastCampaignBase>>{
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: new FocusManager(),
                container: new AdUnitContainer(),
                deviceInfo: new DeviceInfo(),
                clientInfo: new ClientInfo(),
                thirdPartyEventManager: new ThirdPartyEventManager(),
                operativeEventManager: new OperativeEventManager(),
                placement: new Placement(),
                campaign: new VastCampaign(),
                platform: Platform.IOS,
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
        });
        let staticEndScreen: VastStaticEndScreen;

        beforeEach(() => {
            staticEndScreen = new VastStaticEndScreen(baseParams());
        });

        describe('when endcard is rendered', () => {
            it('the inner HTML should not be null', () => {
                staticEndScreen.render();
                expect(staticEndScreen.container().innerHTML).toEqual('HTMLRenderTest');
            });
        });

        describe('when endcard is removed', () => {
            it('the privacy should hide', () => {
                staticEndScreen.remove();
                expect(privacy.hide).toHaveBeenCalled();
            });

        });

        describe('on privacy closed', () => {
            it('the privacy should hide', () => {
                staticEndScreen.onPrivacyClose();
                expect(privacy.hide).toHaveBeenCalled();
            });
        });
    });
});
