import { VastCampaign, VastCampaignMock } from 'VAST/Models/__mocks__/VastCampaign';
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
import { TencentVastEndScreenEventHandler } from 'VAST/EventHandlers/TencentVastEndScreenEventHandler';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { Core } from 'Core/__mocks__/Core';
import { VastAdUnitWithClickThroughURL, VastAdUnitWithoutClickThroughURL } from 'VAST/AdUnits/__mocks__/VastAdUnit';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('TencentVastEndScreenEventHandler', () => {
        let vastTencentEndScreenHandler: TencentVastEndScreenEventHandler;
        let baseParams: IAdUnitParameters<VastCampaignMock>;
        beforeEach(() => {
            baseParams = {
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: new FocusManager(),
                container: new AdUnitContainer(),
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
                privacy: new AbstractPrivacy(),
                privacySDK: new PrivacySDK()
            };
        });

        describe('when onVastEndScreenClick happens and there is no click through url', () => {
            it('the error message should be returned to indicate the url is null',  () => {
                vastTencentEndScreenHandler = new TencentVastEndScreenEventHandler(new VastAdUnitWithoutClickThroughURL(), baseParams);
                vastTencentEndScreenHandler.onVastEndScreenClick().catch((error) => {
                    expect(error).toEqual(new Error('There is no clickthrough URL for video or companion'));
                }).then(() => {
                    expect.hasAssertions();
                });
            });
        });

        describe('when onVastEndScreenClick happens and there is valid click through url', () => {
            let replacedUrl: string;
            beforeEach(async () => {
                replacedUrl = 'https://c2.gdt.qq.com/gdt_click.fcg?viewid=mlsITUl9ffgwhhyanfhFC6PSKRWegO22lApBWRQXHAV39lzK_kqg8TYfD8aX53xMdP7MVrwCKH4Feu4!3oa_BBhWt4YBqeKe1CQG54t8WpQkNtl9VuTpec1s21Mb21TlcDl4w8Bslj9pyTeoEYdHJIhHkPDr0DGYUOOtUf1gtgaJ7oQKIOfEjVP8S8o9DdM7WTg450XRS0g72SnvSznljQsVbq9Q_TH!SjpIgcBMdqh0vD5u2_dh5VT5BuedXIn3Qkmk3PlWoRQ&jtype=0&i=1&os=1&lpp=click_ext=eyJnZHRfcHJvZHVjdF9pZCI6IjE0ODM4ODQ4NTgiLCJpc2Zyb213diI6MX0%3D&clklpp=__CLICK_LPP__&cdnxj=1&xp=3&acttype=35&s={"req_width":"0","req_height":"0","width":"0","height":"0","down_x":"10","down_y":"20","up_x":"10","up_y":"20"}';
                vastTencentEndScreenHandler = new TencentVastEndScreenEventHandler(new VastAdUnitWithClickThroughURL(), baseParams);
                await vastTencentEndScreenHandler.onVastEndScreenClick();
            });
            it('the url should be replaced', () => {
                expect(baseParams.request.followRedirectChain).toHaveBeenCalledWith(replacedUrl, undefined, expect.anything());
            });
            it('for iOS platform, the iOS open url method should be called', () => {
                if (platform === Platform.IOS && baseParams.core.iOS) {
                    expect(baseParams.core.iOS.UrlScheme.open).toHaveReturnedWith(Promise.resolve());
                }
            });
            it('for android platform, the android open url method should be called', () => {
                if (platform === Platform.ANDROID && baseParams.core.Android) {
                    expect(baseParams.core.Android.Intent.launch).toHaveReturnedWith(Promise.resolve());
                }
            });
        });
    });
});
