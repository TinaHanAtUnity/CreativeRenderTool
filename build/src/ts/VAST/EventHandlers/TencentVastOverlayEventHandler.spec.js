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
import { Core } from 'Core/__mocks__/Core';
import { VastAdUnit } from 'VAST/AdUnits/__mocks__/VastAdUnit';
import { TencentVastOverlayEventHandler } from 'VAST/EventHandlers/TencentVastOverlayEventHandler';
import { Video } from 'Ads/Models/Assets/__mocks__/Video';
import { AbstractVideoOverlay } from 'Ads/Views/__mocks__/AbstractVideoOverlay';
describe('TencentVastOverlayEventHandler', () => {
    let vastTencentOverlayHandler;
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
            privacySDK: new PrivacySDK(),
            video: new Video(),
            overlay: new AbstractVideoOverlay()
        };
    });
    describe('when call button get clicked and there is no click through url', () => {
        it('the error message should be returned to indicate the url is null', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const vastAdUnit = new VastAdUnit();
            vastAdUnit.getVideoClickThroughURL.mockReturnValue(null);
            vastTencentOverlayHandler = new TencentVastOverlayEventHandler(vastAdUnit, baseParams);
            yield expect(vastTencentOverlayHandler.onOverlayCallButton()).rejects.toEqual(new Error('No clickThroughURL was defined'));
        }));
    });
    describe('when call button get clicked and there is valid click through url', () => {
        describe('the url should be replaced', () => {
            const expectedUrl = 'https://c2.gdt.qq.com/gdt_click.fcg?s={"req_width":"0","req_height":"0","width":"0","height":"0","down_x":"10","down_y":"20","up_x":"10","up_y":"20"}';
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const vastAdUnit = new VastAdUnit();
                vastAdUnit.getVideoClickThroughURL.mockReturnValue('https://c2.gdt.qq.com/gdt_click.fcg?s={"req_width":"__REQ_WIDTH__","req_height":"__REQ_HEIGHT__","width":"__WIDTH__","height":"__HEIGHT__","down_x":"__DOWN_X__","down_y":"__DOWN_Y__","up_x":"__UP_X__","up_y":"__UP_Y__"}');
                vastTencentOverlayHandler = new TencentVastOverlayEventHandler(vastAdUnit, baseParams);
                yield vastTencentOverlayHandler.onOverlayCallButton();
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
                vastTencentOverlayHandler = new TencentVastOverlayEventHandler(vastAdUnit, baseParams);
                yield vastTencentOverlayHandler.onOverlayCallButton();
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
                vastTencentOverlayHandler = new TencentVastOverlayEventHandler(vastAdUnit, baseParams);
                yield vastTencentOverlayHandler.onOverlayCallButton();
            }));
            it('the android open url method should be called', () => {
                expect(baseParams.core.Android.Intent.launch).toHaveReturnedWith(Promise.resolve());
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuY2VudFZhc3RPdmVybGF5RXZlbnRIYW5kbGVyLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVkFTVC9FdmVudEhhbmRsZXJzL1RlbmNlbnRWYXN0T3ZlcmxheUV2ZW50SGFuZGxlci5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFvQixNQUFNLG9DQUFvQyxDQUFDO0FBQ3BGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUNuRixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDckUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3hDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNwRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDeEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQzlELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzVFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUM5RCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUN2RixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUNyRixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDM0QsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQy9FLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUN0RSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDMUQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRTlDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDL0QsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sbURBQW1ELENBQUM7QUFDbkcsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQzFELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBRWhGLFFBQVEsQ0FBQyxnQ0FBZ0MsRUFBRSxHQUFHLEVBQUU7SUFDNUMsSUFBSSx5QkFBeUQsQ0FBQztJQUM5RCxJQUFJLFVBQW9ELENBQUM7SUFDekQsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLFVBQVUsR0FBRztZQUNULGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxTQUFTO1lBQ3ZDLFlBQVksRUFBRSxJQUFJLFlBQVksRUFBRTtZQUNoQyxTQUFTLEVBQUUsSUFBSSxlQUFlLEVBQUU7WUFDaEMsVUFBVSxFQUFFLElBQUksVUFBVSxFQUFFO1lBQzVCLFVBQVUsRUFBRSxJQUFJLFVBQVUsRUFBRTtZQUM1QixzQkFBc0IsRUFBRSxJQUFJLHNCQUFzQixFQUFFO1lBQ3BELHFCQUFxQixFQUFFLElBQUkscUJBQXFCLEVBQUU7WUFDbEQsU0FBUyxFQUFFLElBQUksU0FBUyxFQUFFO1lBQzFCLFFBQVEsRUFBRSxJQUFJLFlBQVksRUFBRTtZQUM1QixRQUFRLEVBQUUsUUFBUSxDQUFDLElBQUk7WUFDdkIsSUFBSSxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsR0FBRztZQUNwQixHQUFHLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxHQUFHO1lBQ2xCLEtBQUssRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLEdBQUc7WUFDdEIsVUFBVSxFQUFFLElBQUksaUJBQWlCLEVBQUU7WUFDbkMsU0FBUyxFQUFFLElBQUksZ0JBQWdCLEVBQUU7WUFDakMsT0FBTyxFQUFFLElBQUksY0FBYyxFQUFFO1lBQzdCLE9BQU8sRUFBRSxTQUFTO1lBQ2xCLGNBQWMsRUFBRSxJQUFJLGtCQUFrQixFQUFFO1lBQ3hDLGFBQWEsRUFBRSxDQUFDO1lBQ2hCLE9BQU8sRUFBRSxJQUFJLGVBQWUsRUFBRTtZQUM5QixVQUFVLEVBQUUsSUFBSSxVQUFVLEVBQUU7WUFDNUIsS0FBSyxFQUFFLElBQUksS0FBSyxFQUFFO1lBQ2xCLE9BQU8sRUFBRSxJQUFJLG9CQUFvQixFQUFFO1NBQ3RDLENBQUM7SUFDTixDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxnRUFBZ0UsRUFBRSxHQUFHLEVBQUU7UUFDNUUsRUFBRSxDQUFDLGtFQUFrRSxFQUFFLEdBQVMsRUFBRTtZQUM5RSxNQUFNLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ3BDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekQseUJBQXlCLEdBQUcsSUFBSSw4QkFBOEIsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDdkYsTUFBTSxNQUFNLENBQUMseUJBQXlCLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDO1FBQy9ILENBQUMsQ0FBQSxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxtRUFBbUUsRUFBRSxHQUFHLEVBQUU7UUFDL0UsUUFBUSxDQUFDLDRCQUE0QixFQUFFLEdBQUcsRUFBRTtZQUN4QyxNQUFNLFdBQVcsR0FBRyx1SkFBdUosQ0FBQztZQUM1SyxVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixNQUFNLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNwQyxVQUFVLENBQUMsdUJBQXVCLENBQUMsZUFBZSxDQUFDLDZOQUE2TixDQUFDLENBQUM7Z0JBQ2xSLHlCQUF5QixHQUFHLElBQUksOEJBQThCLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUN2RixNQUFNLHlCQUF5QixDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDMUQsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUNILEVBQUUsQ0FBQyxrRUFBa0UsRUFBRSxHQUFHLEVBQUU7Z0JBQ3hFLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsb0JBQW9CLENBQUMsV0FBVyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNuSCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ0gsUUFBUSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtZQUM5QixVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixVQUFVLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUM7Z0JBQ25DLE1BQU0sVUFBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ3BDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFELHlCQUF5QixHQUFHLElBQUksOEJBQThCLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUN2RixNQUFNLHlCQUF5QixDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDMUQsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUNILEVBQUUsQ0FBQywwQ0FBMEMsRUFBRSxHQUFHLEVBQUU7Z0JBQ2hELE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDdEYsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUNILFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLEVBQUU7WUFDbEMsVUFBVSxDQUFDLEdBQVMsRUFBRTtnQkFDbEIsVUFBVSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDO2dCQUN2QyxNQUFNLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNwQyxVQUFVLENBQUMsdUJBQXVCLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMxRCx5QkFBeUIsR0FBRyxJQUFJLDhCQUE4QixDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDdkYsTUFBTSx5QkFBeUIsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQzFELENBQUMsQ0FBQSxDQUFDLENBQUM7WUFDSCxFQUFFLENBQUMsOENBQThDLEVBQUUsR0FBRyxFQUFFO2dCQUNwRCxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3pGLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=