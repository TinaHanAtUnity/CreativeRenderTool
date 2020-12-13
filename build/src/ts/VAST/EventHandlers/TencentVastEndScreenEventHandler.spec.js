import * as tslib_1 from "tslib";
import { VastCampaign } from 'VAST/Models/__mocks__/VastCampaign';
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
import { Core } from 'Core/__mocks__/Core';
import { VastAdUnit } from 'VAST/AdUnits/__mocks__/VastAdUnit';
describe('TencentVastEndScreenEventHandler', () => {
    let vastTencentEndScreenHandler;
    let baseParams;
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
        it('the error message should be returned to indicate the url is null', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const vastAdUnit = new VastAdUnit();
            vastAdUnit.getCompanionClickThroughUrl.mockReturnValue(null);
            vastAdUnit.getVideoClickThroughURL.mockReturnValue(null);
            vastTencentEndScreenHandler = new TencentVastEndScreenEventHandler(vastAdUnit, baseParams);
            yield expect(vastTencentEndScreenHandler.onVastEndScreenClick()).rejects.toEqual(new Error('There is no clickthrough URL for video or companion'));
        }));
    });
    describe('when onVastEndScreenClick happens and there is valid click through url', () => {
        describe('the url should be replaced', () => {
            const expectedUrl = 'https://c2.gdt.qq.com/gdt_click.fcg?s={"req_width":"0","req_height":"0","width":"0","height":"0","down_x":"10","down_y":"20","up_x":"10","up_y":"20"}';
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const vastAdUnit = new VastAdUnit();
                vastTencentEndScreenHandler = new TencentVastEndScreenEventHandler(vastAdUnit, baseParams);
                vastAdUnit.getVideoClickThroughURL.mockReturnValue('https://c2.gdt.qq.com/gdt_click.fcg?s={"req_width":"__REQ_WIDTH__","req_height":"__REQ_HEIGHT__","width":"__WIDTH__","height":"__HEIGHT__","down_x":"__DOWN_X__","down_y":"__DOWN_Y__","up_x":"__UP_X__","up_y":"__UP_Y__"}');
                yield vastTencentEndScreenHandler.onVastEndScreenClick();
            }));
            it('replaced clickThroughURL should be passed to followRedirectChain', () => {
                expect(baseParams.request.followRedirectChain).toHaveBeenCalledWith(expectedUrl, undefined, expect.anything());
            });
        });
        describe('for iOS platform', () => {
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                baseParams.platform = Platform.IOS;
                const vastAdUnit = new VastAdUnit();
                vastAdUnit.getVideoClickThroughURL.mockReturnValue('url');
                vastTencentEndScreenHandler = new TencentVastEndScreenEventHandler(vastAdUnit, baseParams);
                yield vastTencentEndScreenHandler.onVastEndScreenClick();
            }));
            it('the iOS open url method should be called', () => {
                expect(baseParams.core.iOS.UrlScheme.open).toHaveReturnedWith(Promise.resolve());
            });
        });
        describe('for android platform', () => {
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                baseParams.platform = Platform.ANDROID;
                const vastAdUnit = new VastAdUnit();
                vastAdUnit.getVideoClickThroughURL.mockReturnValue('url');
                vastTencentEndScreenHandler = new TencentVastEndScreenEventHandler(vastAdUnit, baseParams);
                yield vastTencentEndScreenHandler.onVastEndScreenClick();
            }));
            it('the android open url method should be called', () => {
                expect(baseParams.core.Android.Intent.launch).toHaveReturnedWith(Promise.resolve());
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuY2VudFZhc3RFbmRTY3JlZW5FdmVudEhhbmRsZXIuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9WQVNUL0V2ZW50SGFuZGxlcnMvVGVuY2VudFZhc3RFbmRTY3JlZW5FdmVudEhhbmRsZXIuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFlBQVksRUFBb0IsTUFBTSxvQ0FBb0MsQ0FBQztBQUNwRixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFDbkYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUN4QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDcEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUM5RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDOUQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFDdkYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDckYsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQzNELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUN6RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUMvRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFD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