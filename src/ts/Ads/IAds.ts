import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { MissedImpressionManager } from 'Ads/Managers/MissedImpressionManager';
import { CampaignRefreshManager } from 'Ads/Managers/CampaignRefreshManager';
import { PlacementManager } from 'Ads/Managers/PlacementManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AdsPropertiesApi } from 'Ads/Native/AdsProperties';
import { AndroidAdUnitApi } from 'Ads/Native/Android/AdUnit';
import { AndroidVideoPlayerApi } from 'Ads/Native/Android/VideoPlayer';
import { IosAdUnitApi } from 'Ads/Native/iOS/AdUnit';
import { IosVideoPlayerApi } from 'Ads/Native/iOS/VideoPlayer';
import { ListenerApi } from 'Ads/Native/Listener';
import { PlacementApi } from 'Ads/Native/Placement';
import { VideoPlayerApi } from 'Ads/Native/VideoPlayer';
import { WebPlayerApi } from 'Ads/Native/WebPlayer';
import { InterstitialWebPlayerContainer } from 'Ads/Utilities/WebPlayer/InterstitialWebPlayerContainer';
import { IApiModule, IModuleApi } from 'Core/Modules/IApiModule';
import { IThirdPartyEventManagerFactory } from 'Ads/Managers/ThirdPartyEventManager';
import { RefreshManager } from 'Ads/Managers/RefreshManager';
import { Analytics } from 'Analytics/Analytics';

export interface IAdsApi extends IModuleApi {
    AdsProperties: AdsPropertiesApi;
    Listener: ListenerApi;
    Placement: PlacementApi;
    VideoPlayer: VideoPlayerApi;
    WebPlayer: WebPlayerApi;
    Android?: {
        AdUnit: AndroidAdUnitApi;
        VideoPlayer: AndroidVideoPlayerApi;
    };
    iOS?: {
        AdUnit: IosAdUnitApi;
        VideoPlayer: IosVideoPlayerApi;
    };
}

export interface IAds extends IApiModule {
    Api: Readonly<IAdsApi>;
    AdMobSignalFactory: AdMobSignalFactory;
    InterstitialWebPlayerContainer: InterstitialWebPlayerContainer;
    SessionManager: SessionManager;
    MissedImpressionManager: MissedImpressionManager;
    ContentTypeHandlerManager: ContentTypeHandlerManager;
    Config: AdsConfiguration;
    Container: Activity | ViewController;
    PrivacyManager: UserPrivacyManager;
    PlacementManager: PlacementManager;
    AssetManager: AssetManager;
    CampaignManager: CampaignManager;
    RefreshManager: RefreshManager;
    ThirdPartyEventManagerFactory: IThirdPartyEventManagerFactory;
    Analytics: Analytics;
}
