import { AndroidVideoEventHandler } from 'Ads/EventHandlers/AndroidVideoEventHandler';
import { IosVideoEventHandler } from 'Ads/EventHandlers/IosVideoEventHandler';
import { Platform } from 'Core/Constants/Platform';
export class AbstractAdUnitFactory {
    constructor(parametersFactory) {
        this._adUnitParametersFactory = parametersFactory;
    }
    create(campaign, placement, orientation, gamerServerId, options, loadV5Support) {
        const params = this._adUnitParametersFactory.create(campaign, placement, orientation, gamerServerId, options, loadV5Support);
        const adUnit = this.createAdUnit(params);
        params.privacy.setupReportListener(adUnit);
        return adUnit;
    }
    prepareVideoPlayer(VideoEventHandlerConstructor, params) {
        const adUnit = params.adUnit;
        const videoEventHandler = new VideoEventHandlerConstructor(params);
        params.ads.VideoPlayer.addEventHandler(videoEventHandler);
        adUnit.onClose.subscribe(() => {
            params.ads.VideoPlayer.removeEventHandler(videoEventHandler);
        });
        if (params.platform === Platform.ANDROID) {
            this.prepareAndroidVideoPlayer(params);
        }
        else if (params.platform === Platform.IOS) {
            this.prepareIosVideoPlayer(params);
        }
        return videoEventHandler;
    }
    prepareAndroidVideoPlayer(params) {
        const adUnit = params.adUnit;
        const androidVideoEventHandler = new AndroidVideoEventHandler(params);
        params.ads.VideoPlayer.Android.addEventHandler(androidVideoEventHandler);
        adUnit.onClose.subscribe(() => {
            params.ads.VideoPlayer.Android.removeEventHandler(androidVideoEventHandler);
        });
    }
    prepareIosVideoPlayer(params) {
        const adUnit = params.adUnit;
        const iosVideoEventHandler = new IosVideoEventHandler(params);
        params.ads.VideoPlayer.iOS.addEventHandler(iosVideoEventHandler);
        adUnit.onClose.subscribe(() => {
            params.ads.VideoPlayer.iOS.removeEventHandler(iosVideoEventHandler);
        });
    }
    getVideoEventHandlerParams(adUnit, video, adUnitStyle, params) {
        return {
            platform: params.platform,
            adUnit: adUnit,
            campaign: params.campaign,
            operativeEventManager: params.operativeEventManager,
            thirdPartyEventManager: params.thirdPartyEventManager,
            coreConfig: params.coreConfig,
            adsConfig: params.adsConfig,
            placement: params.placement,
            video: video,
            adUnitStyle: adUnitStyle,
            clientInfo: params.clientInfo,
            core: params.core,
            ads: params.ads
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWJzdHJhY3RBZFVuaXRGYWN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9BZFVuaXRzL0Fic3RyYWN0QWRVbml0RmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQztBQUV0RixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQVE5RSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFLbkQsTUFBTSxPQUFnQixxQkFBcUI7SUFHdkMsWUFBWSxpQkFBOEQ7UUFDdEUsSUFBSSxDQUFDLHdCQUF3QixHQUFHLGlCQUFpQixDQUFDO0lBQ3RELENBQUM7SUFFTSxNQUFNLENBQUMsUUFBVyxFQUFFLFNBQW9CLEVBQUUsV0FBd0IsRUFBRSxhQUFxQixFQUFFLE9BQWdCLEVBQUUsYUFBc0I7UUFDdEksTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzdILE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQyxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBSVMsa0JBQWtCLENBQXVLLDRCQUFzRCxFQUFFLE1BQWtCO1FBQ3pRLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDN0IsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLDRCQUE0QixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRW5FLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxpQkFB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