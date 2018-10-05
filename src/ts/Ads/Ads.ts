import { AdsPropertiesApi } from 'Ads/Native/AdsProperties';
import { AndroidAdUnitApi } from 'Ads/Native/Android/AdUnit';
import { AndroidVideoPlayerApi } from 'Ads/Native/Android/VideoPlayer';
import { AppSheetApi } from 'Ads/Native/iOS/AppSheet';
import { IosAdUnitApi } from 'Ads/Native/iOS/AdUnit';
import { IosVideoPlayerApi } from 'Ads/Native/iOS/VideoPlayer';
import { ListenerApi } from 'Ads/Native/Listener';
import { PlacementApi } from 'Ads/Native/Placement';
import { VideoPlayerApi } from 'Ads/Native/VideoPlayer';
import { WebPlayerApi } from 'Ads/Native/WebPlayer';
import { Platform } from 'Core/Constants/Platform';
import { Core, CoreModule } from 'Core/Core';
import { JaegerSpan, JaegerTags } from '../Core/Jaeger/JaegerSpan';
import { INativeResponse } from '../Core/Managers/Request';
import { AdMobSignalFactory } from '../AdMob/Utilities/AdMobSignalFactory';
import { InterstitialWebPlayerContainer } from './Utilities/WebPlayer/InterstitialWebPlayerContainer';
import { HttpKafka } from '../Core/Utilities/HttpKafka';
import { SdkStats } from './Utilities/SdkStats';
import { GameSessionCounters } from './Utilities/GameSessionCounters';
import { Activity } from './AdUnits/Containers/Activity';
import { ViewController } from './AdUnits/Containers/ViewController';
import { SessionManager } from './Managers/SessionManager';
import { MissedImpressionManager } from './Managers/MissedImpressionManager';
import { ConfigManager } from '../Core/Managers/ConfigManager';
import { GdprManager } from './Managers/GdprManager';
import { PlacementManager } from './Managers/PlacementManager';
import { BackupCampaignManager } from './Managers/BackupCampaignManager';
import { AssetManager } from './Managers/AssetManager';
import { CampaignManager } from './Managers/CampaignManager';
import { OldCampaignRefreshManager } from './Managers/OldCampaignRefreshManager';
import { BackupCampaignTest, ReportAdTest } from '../Core/Models/ABGroup';
import { AbstractPrivacy } from './Views/AbstractPrivacy';
import { TestEnvironment } from '../Core/Utilities/TestEnvironment';
import { MetaData } from '../Core/Utilities/MetaData';
import { ProgrammaticOperativeEventManager } from './Managers/ProgrammaticOperativeEventManager';
import { AuctionRequest } from '../Banners/Utilities/AuctionRequest';
import { Overlay } from './Views/Overlay';
import { AbstractAdUnit } from './AdUnits/AbstractAdUnit';
import { AdUnitContainer } from './AdUnits/Containers/AdUnitContainer';
import { AdUnitFactory } from './AdUnits/AdUnitFactory';
import { IApiModule, IModuleApi } from '../Core/Modules/IApiModule';
import { AndroidDeviceInfo } from '../Core/Models/AndroidDeviceInfo';
import { IosDeviceInfo } from '../Core/Models/IosDeviceInfo';
import { ProgrammaticTrackingService } from './Utilities/ProgrammaticTrackingService';

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

export class Ads extends CoreModule implements IApiModule {

    public readonly Api: IAdsApi;

    public readonly AdMobSignalFactory: AdMobSignalFactory;
    public readonly InterstitialWebPlayerContainer: InterstitialWebPlayerContainer;

    public readonly SessionManager: SessionManager;
    public readonly MissedImpressionManager: MissedImpressionManager;
    public readonly BackupCampaignManager: BackupCampaignManager;
    public readonly ProgrammaticTrackingService: ProgrammaticTrackingService;

    public Container: Activity | ViewController;
    public GdprManager: GdprManager;
    public PlacementManager: PlacementManager;
    public AssetManager: AssetManager;
    public CampaignManager: CampaignManager;
    public RefreshManager: OldCampaignRefreshManager;

    private _cachedCampaignResponse?: INativeResponse;

    constructor(core: Core) {
        super(core);

        const platform = core.NativeBridge.getPlatform();
        this.Api = {
            AdsProperties: new AdsPropertiesApi(core.NativeBridge),
            Listener: new ListenerApi(core.NativeBridge),
            Placement: new PlacementApi(core.NativeBridge),
            VideoPlayer: new VideoPlayerApi(core.NativeBridge),
            WebPlayer: new WebPlayerApi(core.NativeBridge),
            Android: platform === Platform.ANDROID ? {
                AdUnit: new AndroidAdUnitApi(core.NativeBridge),
                VideoPlayer: new AndroidVideoPlayerApi(core.NativeBridge)
            } : undefined,
            iOS: platform === Platform.IOS ? {
                AppSheet: new AppSheetApi(core.NativeBridge),
                AdUnit: new IosAdUnitApi(core.NativeBridge),
                VideoPlayer: new IosVideoPlayerApi(core.NativeBridge)
            } : undefined
        };

        this.AdMobSignalFactory = new AdMobSignalFactory(this.Core.NativeBridge.getPlatform(), this.Core.Api, this.Api, this.Core.ClientInfo, this.Core.DeviceInfo, this.Core.FocusManager);
        this.InterstitialWebPlayerContainer = new InterstitialWebPlayerContainer(this.Api.WebPlayer);
        if(this.Core.NativeBridge.getPlatform() === Platform.ANDROID) {
            document.body.classList.add('android');
            this.Container = new Activity(this.Core.Api, this.Api, <AndroidDeviceInfo>this.Core.DeviceInfo);
        } else if(this.Core.NativeBridge.getPlatform() === Platform.IOS) {
            const model = this.Core.DeviceInfo.getModel();
            if(model.match(/iphone/i) || model.match(/ipod/i)) {
                document.body.classList.add('iphone');
            } else if(model.match(/ipad/i)) {
                document.body.classList.add('ipad');
            }
            this.Container = new ViewController(this.Core.Api, this.Api, <IosDeviceInfo>this.Core.DeviceInfo, this.Core.FocusManager, this.Core.ClientInfo);
        }
        this.SessionManager = new SessionManager(this.Core.Api.Storage, this.Core.Request);
        this.MissedImpressionManager = new MissedImpressionManager(this.Core.Api.Storage);
        this.BackupCampaignManager = new BackupCampaignManager(this.Core.Api, this.Core.Config);
        this.ProgrammaticTrackingService = new ProgrammaticTrackingService(this.Core.Request, this.Core.ClientInfo, this.Core.DeviceInfo);
    }

    public initialize(jaegerInitSpan: JaegerSpan): Promise<void> {
        return Promise.resolve().then(() => {

            SdkStats.setInitTimestamp();
            GameSessionCounters.init();

            return this.setupTestEnvironment();
        }).then(() => {


            return this.Core.CacheBookkeeping.getCachedCampaignResponse();
        }).then(cachedCampaignResponse => {
            this.GdprManager = new GdprManager(this.Core.NativeBridge.getPlatform(), this.Core.Api, this.Core.Config, this.Config, this.Core.ClientInfo, this.Core.DeviceInfo, this.Core.Request);
            this._cachedCampaignResponse = cachedCampaignResponse;

            this.PlacementManager = new PlacementManager(this.Api, this.Config);

            return this.GdprManager.getConsentAndUpdateConfiguration().catch((error) => {
                // do nothing
                // error happens when consent value is undefined
            });
        }).then(() => {
            const defaultPlacement = this.Config.getDefaultPlacement();
            this.Api.Placement.setDefaultPlacement(defaultPlacement.getId());

            this.AssetManager = new AssetManager(this.Core.NativeBridge.getPlatform(), this.Core.Api, this.Core.CacheManager, this.Config.getCacheMode(), this.Core.DeviceInfo, this.Core.CacheBookkeeping, this.ProgrammaticTrackingService, this.BackupCampaignManager);
            if(this.SessionManager.getGameSessionId() % 10000 === 0) {
                this.AssetManager.setCacheDiagnostics(true);
            }

            this.CampaignManager = new CampaignManager(this.Core.NativeBridge.getPlatform(), this.Core.Api, this.Core.Config, this.Config, this.AssetManager, this.SessionManager, this.AdMobSignalFactory, this.Core.Request, this.Core.ClientInfo, this.Core.DeviceInfo, this.Core.MetaDataManager, this.Core.CacheBookkeeping, this.Core.JaegerManager, this.BackupCampaignManager);
            this.RefreshManager = new OldCampaignRefreshManager(this.Core.NativeBridge.getPlatform(), this.Core.Api, this.Api, this.Core.WakeUpManager, this.CampaignManager, this.Config, this.Core.FocusManager, this.SessionManager, this.Core.ClientInfo, this.Core.Request, this.Core.CacheManager);

            SdkStats.initialize(this.Core.Api, this.Core.Request, this.Core.Config, this.Config, this.SessionManager, this.CampaignManager, this.Core.MetaDataManager, this.Core.ClientInfo, this.Core.CacheManager);

            const refreshSpan = this.Core.JaegerManager.startSpan('Refresh', jaegerInitSpan.id, jaegerInitSpan.traceId);
            refreshSpan.addTag(JaegerTags.DeviceType, Platform[this.Core.NativeBridge.getPlatform()]);
            let refreshPromise;
            if(BackupCampaignTest.isValid(this.Core.Config.getAbGroup())) {
                refreshPromise = this.RefreshManager.refreshWithBackupCampaigns(this);
            } else if(this._cachedCampaignResponse !== undefined) {
                refreshPromise = this.RefreshManager.refreshFromCache(this._cachedCampaignResponse, refreshSpan);
            } else {
                refreshPromise = this.RefreshManager.refresh();
            }
            return refreshPromise.then((resp) => {
                this.Core.JaegerManager.stop(refreshSpan);
                return resp;
            }).catch((error) => {
                refreshSpan.addTag(JaegerTags.Error, 'true');
                refreshSpan.addTag(JaegerTags.ErrorMessage, error.message);
                this.Core.JaegerManager.stop(refreshSpan);
                throw error;
            });
        }).then(() => {
            return this.SessionManager.sendUnsentSessions();
        }).then(() => {
            if ((ReportAdTest.isValid(this.Core.Config.getAbGroup()) && this.Config.isGDPREnabled())) {
                return AbstractPrivacy.setUserInformation(this.GdprManager).catch(() => {
                    this.Core.Api.Sdk.logInfo('Failed to set up privacy information.');
                });
            }
        });
    }

    private setupTestEnvironment(): Promise<void> {
        return TestEnvironment.setup(new MetaData(this.Core.Api)).then(() => {
            if(TestEnvironment.get('serverUrl')) {
                ProgrammaticOperativeEventManager.setTestBaseUrl(TestEnvironment.get('serverUrl'));
                CampaignManager.setBaseUrl(TestEnvironment.get('serverUrl'));
                AuctionRequest.setBaseUrl(TestEnvironment.get('serverUrl'));
            }

            if(TestEnvironment.get('configUrl')) {
                ConfigManager.setTestBaseUrl(TestEnvironment.get('configUrl'));
            }

            if(TestEnvironment.get('kafkaUrl')) {
                HttpKafka.setTestBaseUrl(TestEnvironment.get('kafkaUrl'));
            }

            if(TestEnvironment.get('campaignId')) {
                CampaignManager.setCampaignId(TestEnvironment.get('campaignId'));
            }

            if(TestEnvironment.get('sessionId')) {
                CampaignManager.setSessionId(TestEnvironment.get('sessionId'));
            }

            if(TestEnvironment.get('country')) {
                CampaignManager.setCountry(TestEnvironment.get('country'));
            }

            if(TestEnvironment.get('autoSkip')) {
                Overlay.setAutoSkip(TestEnvironment.get('autoSkip'));
            }

            if(TestEnvironment.get('autoClose')) {
                AbstractAdUnit.setAutoClose(TestEnvironment.get('autoClose'));
            }

            if(TestEnvironment.get('autoCloseDelay')) {
                AbstractAdUnit.setAutoCloseDelay(TestEnvironment.get('autoCloseDelay'));
            }

            if(TestEnvironment.get('forcedOrientation')) {
                AdUnitContainer.setForcedOrientation(TestEnvironment.get('forcedOrientation'));
            }

            if(TestEnvironment.get('forcedPlayableMRAID')) {
                AdUnitFactory.setForcedPlayableMRAID(TestEnvironment.get('forcedPlayableMRAID'));
            }

            if(TestEnvironment.get('forcedGDPRBanner')) {
                AdUnitFactory.setForcedGDPRBanner(TestEnvironment.get('forcedGDPRBanner'));
            }

            let forcedARMRAID = false;
            if (TestEnvironment.get('forcedARMRAID')) {
                forcedARMRAID = TestEnvironment.get('forcedARMRAID');
                AdUnitFactory.setForcedARMRAID(forcedARMRAID);
            }
        });
    }

}

export abstract class AdsModule extends CoreModule {

    protected readonly Ads: Ads;

    protected constructor(ads: Ads) {
        super(ads.Core);
        this.Ads = ads;
    }

}
