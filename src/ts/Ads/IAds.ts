import { IApiModule, IModuleApi } from '../Core/Modules/IApiModule';
import { AdsPropertiesApi } from './Native/AdsProperties';
import { ListenerApi } from './Native/Listener';
import { PlacementApi } from './Native/Placement';
import { VideoPlayerApi } from './Native/VideoPlayer';
import { WebPlayerApi } from './Native/WebPlayer';
import { AndroidAdUnitApi } from './Native/Android/AdUnit';
import { AndroidVideoPlayerApi } from './Native/Android/VideoPlayer';
import { AppSheetApi } from './Native/iOS/AppSheet';
import { IosAdUnitApi } from './Native/iOS/AdUnit';
import { IosVideoPlayerApi } from './Native/iOS/VideoPlayer';
import { AdMobSignalFactory } from '../AdMob/Utilities/AdMobSignalFactory';
import { InterstitialWebPlayerContainer } from './Utilities/WebPlayer/InterstitialWebPlayerContainer';
import { SessionManager } from './Managers/SessionManager';
import { MissedImpressionManager } from './Managers/MissedImpressionManager';
import { BackupCampaignManager } from './Managers/BackupCampaignManager';
import { ProgrammaticTrackingService } from './Utilities/ProgrammaticTrackingService';
import { CampaignParserManager } from './Managers/CampaignParserManager';
import { AdsConfiguration } from './Models/AdsConfiguration';
import { Activity } from './AdUnits/Containers/Activity';
import { ViewController } from './AdUnits/Containers/ViewController';
import { GdprManager } from './Managers/GdprManager';
import { PlacementManager } from './Managers/PlacementManager';
import { AssetManager } from './Managers/AssetManager';
import { CampaignManager } from './Managers/CampaignManager';
import { OldCampaignRefreshManager } from './Managers/OldCampaignRefreshManager';

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
