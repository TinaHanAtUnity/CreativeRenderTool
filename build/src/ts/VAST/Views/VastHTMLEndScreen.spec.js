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
        const baseParams = {
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
        let htmlEndScreen;
        const webPlayer = new InterstitialWebPlayerContainer();
        beforeEach(() => {
            htmlEndScreen = new VastHTMLEndScreen(baseParams, webPlayer);
        });
        describe('when endcard is rendered', () => {
            beforeEach(() => {
                htmlEndScreen.render();
            });
            it('the inner HTML should not be null', () => {
                expect(htmlEndScreen.container().innerHTML).toEqual('HTML render test');
            });
        });
        describe('when endcard is showing', () => {
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield htmlEndScreen.show();
            }));
            it('it should show endcard overlay and reconfigure webplayer', () => {
                expect(adUnitContainer.reconfigure).toHaveBeenCalled();
            });
            it('when showing html endcard, the screen orientation should be locked', () => {
                expect(adUnitContainer.reorient).toHaveBeenCalledWith(false, jasmine.anything());
            });
            it('webplayer should set settings before show endcard', () => {
                expect(webPlayer.setSettings).toHaveBeenCalled();
            });
            it('ad unit container should set view frames for webplayer and webview', () => {
                expect(adUnitContainer.setViewFrame).toHaveBeenCalledTimes(2);
            });
            it('webplayer should set up event settings before show the endcard', () => {
                expect(webPlayer.setEventSettings).toHaveBeenCalled();
            });
            it('webplayer container should set data', () => {
                expect(webPlayer.setData).toHaveBeenCalledWith('HTML content test', 'text/html', 'UTF-8');
            });
        });
        describe('when privacy is closed', () => {
            beforeEach(() => {
                htmlEndScreen.onPrivacyClose();
            });
            it('the privacy should hide', () => {
                expect(privacy.hide).toHaveBeenCalled();
            });
        });
        describe('when privacy is closed', () => {
            beforeEach(() => {
                htmlEndScreen.onPrivacyClose();
            });
            it('the webview frames should change back', () => {
                expect(adUnitContainer.setViewFrame).toHaveBeenCalled();
            });
        });
        describe('when end card is closed', () => {
            beforeEach(() => {
                htmlEndScreen.remove();
            });
            it('the privacy hide should be called', () => {
                expect(privacy.hide).toHaveBeenCalled();
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdEhUTUxFbmRTY3JlZW4uc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9WQVNUL1ZpZXdzL1Zhc3RIVE1MRW5kU2NyZWVuLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUVsRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFDbkYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUN4QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDcEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUM5RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDOUQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFDdkYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDckYsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQzNELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUN6RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUMvRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDdEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzFELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUM5QyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDM0MsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDakUsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sd0RBQXdELENBQUM7QUFFeEcsSUFBSSxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsRUFBRSxHQUFHLEVBQUU7SUFDL0MsT0FBTztRQUNILFNBQVMsRUFBRSxtQkFBbUI7S0FDakMsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUU7SUFDMUMsT0FBTztRQUNILFNBQVMsRUFBRSxrQkFBa0I7S0FDaEMsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FBRUgsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7SUFDaEQsUUFBUSxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtRQUMvQixNQUFNLGVBQWUsR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO1FBQzlDLE1BQU0sT0FBTyxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7UUFDdEMsTUFBTSxVQUFVLEdBQXdDO1lBQ3BELGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxTQUFTO1lBQ3ZDLFlBQVksRUFBRSxJQUFJLFlBQVksRUFBRTtZQUNoQyxTQUFTLEVBQUUsZUFBZTtZQUMxQixVQUFVLEVBQUUsSUFBSSxVQUFVLEVBQUU7WUFDNUIsVUFBVSxFQUFFLElBQUksVUFBVSxFQUFFO1lBQzVCLHNCQUFzQixFQUFFLElBQUksc0JBQXNCLEVBQUU7WUFDcEQscUJBQXFCLEVBQUUsSUFBSSxxQkFBcUIsRUFBRTtZQUNsRCxTQUFTLEVBQUUsSUFBSSxTQUFTLEVBQUU7WUFDMUIsUUFBUSxFQUFFLElBQUksWUFBWSxFQUFFO1lBQzVCLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLElBQUksRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLEdBQUc7WUFDcEIsR0FBRyxFQUFFLElBQUksR0FBRyxFQUFFLENBQUMsR0FBRztZQUNsQixLQUFLLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxHQUFHO1lBQ3RCLFVBQVUsRUFBRSxJQUFJLGlCQUFpQixFQUFFO1lBQ25DLFNBQVMsRUFBRSxJQUFJLGdCQUFnQixFQUFFO1lBQ2pDLE9BQU8sRUFBRSxJQUFJLGNBQWMsRUFBRTtZQUM3QixPQUFPLEVBQUUsU0FBUztZQUNsQixjQUFjLEVBQUUsSUFBSSxrQkFBa0IsRUFBRTtZQUN4QyxhQUFhLEVBQUUsQ0FBQztZQUNoQixPQUFPLEVBQUUsT0FBTztZQUNoQixVQUFVLEVBQUUsSUFBSSxVQUFVLEVBQUU7U0FDL0IsQ0FBQztRQUNGLElBQUksYUFBZ0MsQ0FBQztRQUNyQyxNQUFNLFNBQVMsR0FBRyxJQUFJLDhCQUE4QixFQUFFLENBQUM7UUFFdkQsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNaLGFBQWEsR0FBRyxJQUFJLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNqRSxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQywwQkFBMEIsRUFBRSxHQUFHLEVBQUU7WUFDdEMsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDWixhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDM0IsQ0FBQyxDQUFDLENBQUM7WUFDSCxFQUFFLENBQUMsbUNBQW1DLEVBQUUsR0FBRyxFQUFFO2dCQUN6QyxNQUFNLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzVFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO1lBQ3JDLFVBQVUsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2xCLE1BQU0sYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQy9CLENBQUMsQ0FBQSxDQUFDLENBQUM7WUFDSCxFQUFFLENBQUMsMERBQTBELEVBQUUsR0FBRyxFQUFFO2dCQUNoRSxNQUFNLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDM0QsQ0FBQyxDQUFDLENBQUM7WUFDSCxFQUFFLENBQUMsb0VBQW9FLEVBQUUsR0FBRyxFQUFFO2dCQUMxRSxNQUFNLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNyRixDQUFDLENBQUMsQ0FBQztZQUNILEVBQUUsQ0FBQyxtREFBbUQsRUFBRSxHQUFHLEVBQUU7Z0JBQ3pELE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUNyRCxDQUFDLENBQUMsQ0FBQztZQUNILEVBQUUsQ0FBQyxvRUFBb0UsRUFBRSxHQUFHLEVBQUU7Z0JBQzFFLE1BQU0sQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEUsQ0FBQyxDQUFDLENBQUM7WUFDSCxFQUFFLENBQUMsZ0VBQWdFLEVBQUUsR0FBRyxFQUFFO2dCQUN0RSxNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUMxRCxDQUFDLENBQUMsQ0FBQztZQUNILEVBQUUsQ0FBQyxxQ0FBcUMsRUFBRSxHQUFHLEVBQUU7Z0JBQzNDLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsb0JBQW9CLENBQUMsbUJBQW1CLEVBQUUsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzlGLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO1lBQ3BDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ1osYUFBYSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ25DLENBQUMsQ0FBQyxDQUFDO1lBQ0gsRUFBRSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtnQkFDL0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzVDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO1lBQ3BDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ1osYUFBYSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ25DLENBQUMsQ0FBQyxDQUFDO1lBQ0gsRUFBRSxDQUFDLHVDQUF1QyxFQUFFLEdBQUcsRUFBRTtnQkFDN0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzVELENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO1lBQ3JDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ1osYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzNCLENBQUMsQ0FBQyxDQUFDO1lBQ0gsRUFBRSxDQUFDLG1DQUFtQyxFQUFFLEdBQUcsRUFBRTtnQkFDekMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzVDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=