import { AdsPropertiesApi } from 'Ads/Native/AdsProperties';
import { AndroidAdUnitApi } from 'Ads/Native/Android/AndroidAdUnit';
import { AndroidVideoPlayerApi } from 'Ads/Native/Android/AndroidVideoPlayer';
import { AppSheetApi } from 'Ads/Native/iOS/AppSheet';
import { IosAdUnitApi } from 'Ads/Native/iOS/IosAdUnit';
import { IosVideoPlayerApi } from 'Ads/Native/iOS/IosVideoPlayer';
import { ListenerApi } from 'Ads/Native/Listener';
import { PlacementApi } from 'Ads/Native/Placement';
import { VideoPlayerApi } from 'Ads/Native/VideoPlayer';
import { WebPlayerApi } from 'Ads/Native/WebPlayer';
import { Platform } from 'Core/Constants/Platform';
import { Core, CoreModule } from 'Core/Core';
import { IApi, IApiModule, IModuleApi } from 'Core/Modules/ApiModule';
import { NativeBridge } from '../Core/Native/Bridge/NativeBridge';

export interface IAdsAndroidApi extends IApi {
    AdUnit: AndroidAdUnitApi;
    VideoPlayer: AndroidVideoPlayerApi;
}

export interface IAdsIosApi extends IApi {
    AppSheet: AppSheetApi;
    AdUnit: IosAdUnitApi;
    VideoPlayer: IosVideoPlayerApi;
}

export interface IAdsApi extends IModuleApi {
    AdsProperties: AdsPropertiesApi;
    Listener: ListenerApi;
    Placement: PlacementApi;
    VideoPlayer: VideoPlayerApi;
    WebPlayer: WebPlayerApi;
    Android?: IAdsAndroidApi;
    iOS?: IAdsIosApi;
}

export class Ads extends CoreModule implements IApiModule<IAdsApi> {

    public readonly Api: IAdsApi;

    public load(nativeBridge: NativeBridge) {
        const api: IAdsApi = {
            AdsProperties: new AdsPropertiesApi(nativeBridge),
            Listener: new ListenerApi(nativeBridge),
            Placement: new PlacementApi(nativeBridge),
            VideoPlayer: new VideoPlayerApi(nativeBridge),
            WebPlayer: new WebPlayerApi(nativeBridge)
        };

        const platform = nativeBridge.getPlatform();
        if(platform === Platform.ANDROID) {
            api.Android = {
                AdUnit: new AndroidAdUnitApi(nativeBridge),
                VideoPlayer: new AndroidVideoPlayerApi(nativeBridge)
            };
        } else if(platform === Platform.IOS) {
            api.iOS = {
                AppSheet: new AppSheetApi(nativeBridge),
                AdUnit: new IosAdUnitApi(nativeBridge),
                VideoPlayer: new IosVideoPlayerApi(nativeBridge)
            };
        }

        return api;
    }

}
