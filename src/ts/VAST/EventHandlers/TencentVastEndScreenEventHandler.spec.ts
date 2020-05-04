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
import { VastAdUnit } from 'VAST/AdUnits/__mocks__/VastAdUnit';

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

    describe('when onVastEndScreenClick happens and there is no click through url', () => {
        it('the error message should be returned to indicate the url is null', async () => {
            const vastAdUnit = new VastAdUnit();
            vastAdUnit.getCompanionClickThroughUrl.mockReturnValue(null);
            vastAdUnit.getVideoClickThroughURL.mockReturnValue(null);
            vastTencentEndScreenHandler = new TencentVastEndScreenEventHandler(vastAdUnit, baseParams);
            await expect(vastTencentEndScreenHandler.onVastEndScreenClick()).rejects.toEqual(new Error('There is no clickthrough URL for video or companion'));
        });
    });

    describe('when onVastEndScreenClick happens and there is valid click through url', () => {
        describe('the url should be replaced', () => {
            const expectedUrl = 'https://c2.gdt.qq.com/gdt_click.fcg?s={"req_width":"0","req_height":"0","width":"0","height":"0","down_x":"10","down_y":"20","up_x":"10","up_y":"20"}';
            beforeEach(async () => {
                const vastAdUnit = new VastAdUnit();
                vastTencentEndScreenHandler = new TencentVastEndScreenEventHandler(vastAdUnit, baseParams);
                vastAdUnit.getVideoClickThroughURL.mockReturnValue('https://c2.gdt.qq.com/gdt_click.fcg?s={"req_width":"__REQ_WIDTH__","req_height":"__REQ_HEIGHT__","width":"__WIDTH__","height":"__HEIGHT__","down_x":"__DOWN_X__","down_y":"__DOWN_Y__","up_x":"__UP_X__","up_y":"__UP_Y__"}');
                await vastTencentEndScreenHandler.onVastEndScreenClick();
            });
            it('replaced clickThroughURL should be passed to followRedirectChain', () => {
                expect(baseParams.request.followRedirectChain).toHaveBeenCalledWith(expectedUrl, undefined, expect.anything());
            });
        });
        describe('for iOS platform', () => {
            beforeEach(async () => {
                baseParams.platform = Platform.IOS;
                const vastAdUnit = new VastAdUnit();
                vastAdUnit.getVideoClickThroughURL.mockReturnValue('url');
                vastTencentEndScreenHandler = new TencentVastEndScreenEventHandler(vastAdUnit, baseParams);
                await vastTencentEndScreenHandler.onVastEndScreenClick();
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
                vastTencentEndScreenHandler = new TencentVastEndScreenEventHandler(vastAdUnit, baseParams);
                await vastTencentEndScreenHandler.onVastEndScreenClick();
            });
            it('the android open url method should be called', () => {
                expect(baseParams.core.Android!.Intent.launch).toHaveReturnedWith(Promise.resolve());
            });
        });
    });
});
