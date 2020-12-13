import { VideoAdUnitPopupEventHandler } from 'Ads/EventHandlers/VideoAdUnitPopupEventHandler';
import { AbstractPrivacy } from 'Ads/Views/__mocks__/AbstractPrivacy';
import { VideoState } from 'Ads/AdUnits/VideoAdUnit';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { FocusManager } from 'Core/Managers/__mocks__/FocusManager';
import { AdUnitContainer } from 'Ads/AdUnits/Containers/__mocks__/AdUnitContainer';
import { DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { ThirdPartyEventManager } from 'Ads/Managers/__mocks__/ThirdPartyEventManager';
import { OperativeEventManager } from 'Ads/Managers/__mocks__/OperativeEventManager';
import { Placement } from 'Ads/Models/__mocks__/Placement';
import { Platform } from 'Core/Constants/Platform';
import { Core } from 'Core/__mocks__/Core';
import { Ads } from 'Ads/__mocks__/Ads';
import { Store } from 'Store/__mocks__/Store';
import { CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { UserPrivacyManager } from 'Ads/Managers/__mocks__/UserPrivacyManager';
import { PrivacySDK } from 'Privacy/__mocks__/PrivacySDK';
import { Video } from 'Ads/Models/Assets/__mocks__/Video';
import { AbstractVideoOverlay } from 'Ads/Views/__mocks__/AbstractVideoOverlay';
import { VastAdUnit } from 'VAST/AdUnits/__mocks__/VastAdUnit';
import { VastCampaign } from 'VAST/Models/__mocks__/VastCampaign';
describe('VideoAdUnitPopupEventHandler', () => {
    let videoAdUnitPopupEventHandler;
    let baseParams;
    let adUnit;
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
        adUnit = new VastAdUnit();
        videoAdUnitPopupEventHandler = new VideoAdUnitPopupEventHandler(adUnit, baseParams);
    });
    describe('when the video can be shown', () => {
        beforeEach(() => {
            adUnit.isShowing.mockReturnValue(true);
            adUnit.canPlayVideo.mockReturnValue(true);
            adUnit.canShowVideo.mockReturnValue(true);
        });
        describe('when calling onPopupClosed', () => {
            beforeEach(() => {
                videoAdUnitPopupEventHandler.onPopupClosed();
            });
            it('the video play method should be called', () => {
                expect(baseParams.ads.VideoPlayer.play).toHaveBeenCalledTimes(1);
            });
            it('the video state should be set to playing', () => {
                expect(adUnit.setVideoState).toHaveBeenCalledWith(VideoState.PLAYING);
            });
        });
        describe('when calling onPopupShow', () => {
            beforeEach(() => {
                videoAdUnitPopupEventHandler.onPopupShow();
            });
            it('the video pause method should be called', () => {
                expect(baseParams.ads.VideoPlayer.pause).toHaveBeenCalledTimes(1);
            });
            it('the video state should be set to paused', () => {
                expect(adUnit.setVideoState).toHaveBeenCalledWith(VideoState.PAUSED);
            });
        });
    });
    describe('when the video cannot be shown', () => {
        beforeEach(() => {
            adUnit.isShowing.mockReturnValue(true);
            adUnit.canPlayVideo.mockReturnValue(true);
            adUnit.canShowVideo.mockReturnValue(false);
        });
        describe('when calling onPopupClosed', () => {
            beforeEach(() => {
                videoAdUnitPopupEventHandler.onPopupClosed();
            });
            it('the video play method should be called', () => {
                expect(baseParams.ads.VideoPlayer.play).not.toHaveBeenCalled();
            });
        });
        describe('when calling onPopupShow', () => {
            beforeEach(() => {
                videoAdUnitPopupEventHandler.onPopupShow();
            });
            it('the video play method should be called', () => {
                expect(baseParams.ads.VideoPlayer.pause).not.toHaveBeenCalled();
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlkZW9BZFVuaXRQb3B1cEV2ZW50SGFuZGxlci5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9FdmVudEhhbmRsZXJzL1ZpZGVvQWRVbml0UG9wdXBFdmVudEhhbmRsZXIuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQztBQUM5RixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDdEUsT0FBTyxFQUEwQixVQUFVLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUM3RSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDckUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUNuRixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDOUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQzlELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBQ3ZGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBQ3JGLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMzRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUN4QyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDOUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDNUUsT0FBTyxFQUFF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