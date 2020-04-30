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
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { Core } from 'Core/__mocks__/Core';
import { VastAdUnit } from 'VAST/AdUnits/__mocks__/VastAdUnit';
import { TencentVastOverlayEventHandler } from 'VAST/EventHandlers/TencentVastOverlayEventHandler';

describe('TencentVastOverlayEventHandler', () => {
    let vastTencentOverlayHandler: TencentVastOverlayEventHandler;
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
            platform: Platform.TEST,
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

    describe('when call button get clicked and there is no click through url', () => {
        it('the error message should be returned to indicate the url is null',  async () => {
            const vastAdUnit = new VastAdUnit();
            vastAdUnit.getVideoClickThroughURL.mockReturnValue(null);
            vastTencentOverlayHandler = new TencentVastOverlayEventHandler(vastAdUnit, baseParams);
            await expect(vastTencentOverlayHandler.onOverlayCallButton()).rejects.toEqual(new Error('No clickThroughURL was defined'));
        });
    });

    describe('when call button get clicked and there is valid click through url', () => {
        describe('the url should be replaced', () => {
            const replacedUrl = 'https://c2.gdt.qq.com/gdt_click.fcg?viewid=mlsITUl9ffgwhhyanfhFC6PSKRWegO22lApBWRQXHAV39lzK_kqg8TYfD8aX53xMdP7MVrwCKH4Feu4!3oa_BBhWt4YBqeKe1CQG54t8WpQkNtl9VuTpec1s21Mb21TlcDl4w8Bslj9pyTeoEYdHJIhHkPDr0DGYUOOtUf1gtgaJ7oQKIOfEjVP8S8o9DdM7WTg450XRS0g72SnvSznljQsVbq9Q_TH!SjpIgcBMdqh0vD5u2_dh5VT5BuedXIn3Qkmk3PlWoRQ&jtype=0&i=1&os=1&lpp=click_ext=eyJnZHRfcHJvZHVjdF9pZCI6IjE0ODM4ODQ4NTgiLCJpc2Zyb213diI6MX0%3D&clklpp=__CLICK_LPP__&cdnxj=1&xp=3&acttype=35&s={"req_width":"0","req_height":"0","width":"0","height":"0","down_x":"10","down_y":"20","up_x":"10","up_y":"20"}';
            beforeEach(async () => {
                const vastAdUnit = new VastAdUnit();
                vastAdUnit.getVideoClickThroughURL.mockReturnValue('https://c2.gdt.qq.com/gdt_click.fcg?viewid=mlsITUl9ffgwhhyanfhFC6PSKRWegO22lApBWRQXHAV39lzK_kqg8TYfD8aX53xMdP7MVrwCKH4Feu4!3oa_BBhWt4YBqeKe1CQG54t8WpQkNtl9VuTpec1s21Mb21TlcDl4w8Bslj9pyTeoEYdHJIhHkPDr0DGYUOOtUf1gtgaJ7oQKIOfEjVP8S8o9DdM7WTg450XRS0g72SnvSznljQsVbq9Q_TH!SjpIgcBMdqh0vD5u2_dh5VT5BuedXIn3Qkmk3PlWoRQ&jtype=0&i=1&os=1&lpp=click_ext=eyJnZHRfcHJvZHVjdF9pZCI6IjE0ODM4ODQ4NTgiLCJpc2Zyb213diI6MX0%3D&clklpp=__CLICK_LPP__&cdnxj=1&xp=3&acttype=35&s={"req_width":"__REQ_WIDTH__","req_height":"__REQ_HEIGHT__","width":"__WIDTH__","height":"__HEIGHT__","down_x":"__DOWN_X__","down_y":"__DOWN_Y__","up_x":"__UP_X__","up_y":"__UP_Y__"}');
                vastTencentOverlayHandler = new TencentVastOverlayEventHandler(vastAdUnit, baseParams);
                await vastTencentOverlayHandler.onOverlayCallButton();
            });
            it('replaced clickThroughURL should be passed to followRedirectChain', () => {
                expect(baseParams.request.followRedirectChain).toHaveBeenCalledWith(replacedUrl, undefined, expect.anything());
            });
        });
        describe('for iOS platform', () => {
            beforeEach(async () => {
                baseParams.platform = Platform.IOS;
                const vastAdUnit = new VastAdUnit();
                vastAdUnit.getVideoClickThroughURL.mockReturnValue('url');
                vastTencentOverlayHandler = new TencentVastOverlayEventHandler(vastAdUnit, baseParams);
                await vastTencentOverlayHandler.onOverlayCallButton();
            });
            it('the iOS open url method should be called', () => {
                expect(baseParams.core.iOS!.UrlScheme.open).toHaveReturnedWith(Promise.resolve());
            });
        });
        describe('for android platform', () => {
            beforeEach(async () => {
                baseParams.platform = Platform.ANDROID;
                const vastAdUnit = new VastAdUnit();
                vastAdUnit.getVideoClickThroughURL.mockReturnValue('url');
                vastTencentOverlayHandler = new TencentVastOverlayEventHandler(vastAdUnit, baseParams);
                await vastTencentOverlayHandler.onOverlayCallButton();
            });
            it('the android open url method should be called', () => {
                expect(baseParams.core.Android!.Intent.launch).toHaveReturnedWith(Promise.resolve());
            });
        });
    });
});
