import { VideoAdUnitPopupEventHandler } from 'Ads/EventHandlers/VideoAdUnitPopupEventHandler';
import { AbstractPrivacy } from 'Ads/Views/__mocks__/AbstractPrivacy';
import { IVideoAdUnitParameters, VideoState } from 'Ads/AdUnits/VideoAdUnit';
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
import { VastAdUnit, VastAdUnitMock } from 'VAST/AdUnits/__mocks__/VastAdUnit';
import { VastCampaign } from 'VAST/Models/__mocks__/VastCampaign';
import { Campaign } from 'Ads/Models/Campaign';

describe('VideoAdUnitPopupEventHandler', () => {

    let videoAdUnitPopupEventHandler: VideoAdUnitPopupEventHandler<Campaign>;
    let baseParams: IVideoAdUnitParameters<Campaign>;
    let adUnit: VastAdUnitMock;
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
            adUnit.isShowing .mockReturnValue(true);
            adUnit.canPlayVideo.mockReturnValue(true);
            adUnit.canShowVideo.mockReturnValue(true);
        });

        describe('when calling onPopupClosed', () => {
            beforeEach(() => {
                videoAdUnitPopupEventHandler.onPopupClosed();
            });

            it('the video play method should be called', () => {
                expect(adUnit.setVideoState).toHaveBeenCalledWith(VideoState.PLAYING);
                expect(baseParams.ads.VideoPlayer.play).toHaveBeenCalledTimes(1);

            });
        });

        describe('when calling onShowPopup', () => {
            beforeEach(() => {
                videoAdUnitPopupEventHandler.onShowPopup();
            });

            it('the video play method should be called', () => {
                expect(adUnit.setVideoState).toHaveBeenCalledWith(VideoState.PAUSED);
                expect(baseParams.ads.VideoPlayer.pause).toHaveBeenCalledTimes(1);

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

        describe('when calling onShowPopup', () => {
            beforeEach(() => {
                videoAdUnitPopupEventHandler.onShowPopup();
            });

            it('the video play method should be called', () => {
                expect(baseParams.ads.VideoPlayer.pause).not.toHaveBeenCalled();
            });
        });
    });
});
