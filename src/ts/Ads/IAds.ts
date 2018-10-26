import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { BackupCampaignManager } from 'Ads/Managers/BackupCampaignManager';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { CampaignParserManager } from 'Ads/Managers/CampaignParserManager';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { MissedImpressionManager } from 'Ads/Managers/MissedImpressionManager';
import { OldCampaignRefreshManager } from 'Ads/Managers/OldCampaignRefreshManager';
import { PlacementManager } from 'Ads/Managers/PlacementManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AdsPropertiesApi } from 'Ads/Native/AdsProperties';
import { AndroidAdUnitApi } from 'Ads/Native/Android/AdUnit';
import { AndroidVideoPlayerApi } from 'Ads/Native/Android/VideoPlayer';
import { IosAdUnitApi } from 'Ads/Native/iOS/AdUnit';
import { AppSheetApi } from 'Ads/Native/iOS/AppSheet';
import { IosVideoPlayerApi } from 'Ads/Native/iOS/VideoPlayer';
import { ListenerApi } from 'Ads/Native/Listener';
import { PlacementApi } from 'Ads/Native/Placement';
import { VideoPlayerApi } from 'Ads/Native/VideoPlayer';
import { WebPlayerApi } from 'Ads/Native/WebPlayer';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { InterstitialWebPlayerContainer } from 'Ads/Utilities/WebPlayer/InterstitialWebPlayerContainer';
import { IApiModule, IModuleApi } from 'Core/Modules/IApiModule';

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
        AppSheet: AppSheetApi;
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
    BackupCampaignManager: BackupCampaignManager;
    ProgrammaticTrackingService: ProgrammaticTrackingService;
    CampaignParserManager: CampaignParserManager;
    Config: AdsConfiguration;
    Container: Activity | ViewController;
    GdprManager: GdprManager;
    PlacementManager: PlacementManager;
    AssetManager: AssetManager;
    CampaignManager: CampaignManager;
    RefreshManager: OldCampaignRefreshManager;
}
