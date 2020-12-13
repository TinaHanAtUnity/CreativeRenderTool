import * as tslib_1 from "tslib";
import { VastStaticEndScreen } from 'VAST/Views/VastStaticEndScreen';
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
jest.mock('html/VastStaticEndScreen.html', () => {
    return {
        'default': 'HTMLRenderTest'
    };
});
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('VastStaticEndScreen', () => {
        const privacy = new AbstractPrivacy();
        const adUnitContainer = new AdUnitContainer();
        const baseParams = jest.fn(() => {
            return {
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: new FocusManager(),
                container: adUnitContainer,
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
        let staticEndScreen;
        beforeEach(() => {
            staticEndScreen = new VastStaticEndScreen(baseParams());
        });
        describe('when endcard is showing', () => {
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield staticEndScreen.show();
            }));
            it('it should reconfigure the view configuration to ENDSCREEN', () => {
                expect(adUnitContainer.reconfigure).toHaveBeenCalledWith(0 /* ENDSCREEN */);
            });
            it('the screen orientation should be locked', () => {
                expect(adUnitContainer.reorient).toHaveBeenCalledWith(false, expect.anything());
            });
        });
        describe('when endcard is rendered', () => {
            beforeEach(() => {
                staticEndScreen.render();
            });
            it('the inner HTML should not be null', () => {
                expect(staticEndScreen.container().innerHTML).toEqual('HTMLRenderTest');
            });
        });
        describe('when endcard is removed', () => {
            beforeEach(() => {
                staticEndScreen.remove();
            });
            it('the privacy should hide', () => {
                expect(privacy.hide).toHaveBeenCalled();
            });
        });
        describe('on privacy closed', () => {
            beforeEach(() => {
                staticEndScreen.onPrivacyClose();
            });
            it('the privacy should hide', () => {
                expect(privacy.hide).toHaveBeenCalled();
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdFN0YXRpY0VuZFNjcmVlbi5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZBU1QvVmlld3MvVmFzdFN0YXRpY0VuZFNjcmVlbi5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUVyRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFFbEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ25GLE9BQU8sRUFBRSxXQUFXLEVBQXFCLE1BQU0sd0NBQXdDLENBQUM7QUFDeEYsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3hDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNwRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDeEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQzlELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzVFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUM5RCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUN2RixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUNyRixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDM0QsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQy9FLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxxQ0FB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