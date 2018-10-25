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
import { ICore } from 'Core/ICore';
import { JaegerSpan, JaegerTags } from 'Core/Jaeger/JaegerSpan';
import { INativeResponse } from 'Core/Managers/RequestManager';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { InterstitialWebPlayerContainer } from 'Ads/Utilities/WebPlayer/InterstitialWebPlayerContainer';
import { HttpKafka } from 'Core/Utilities/HttpKafka';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { MissedImpressionManager } from 'Ads/Managers/MissedImpressionManager';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { PlacementManager } from 'Ads/Managers/PlacementManager';
import { BackupCampaignManager } from 'Ads/Managers/BackupCampaignManager';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { OldCampaignRefreshManager } from 'Ads/Managers/OldCampaignRefreshManager';
import { BackupCampaignTest } from 'Core/Models/ABGroup';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { MetaData } from 'Core/Utilities/MetaData';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { AuctionRequest } from 'Banners/Utilities/AuctionRequest';
import { Overlay } from 'Ads/Views/Overlay';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { CallbackStatus, INativeCallback } from 'Core/Native/Bridge/NativeBridge';
import { Placement } from 'Ads/Models/Placement';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { Promises, TimeoutError } from 'Core/Utilities/Promises';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Campaign } from 'Ads/Models/Campaign';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { UnityAdsError } from 'Core/Constants/UnityAdsError';
import { FinishState } from 'Core/Constants/FinishState';
import { BannerAdContext } from 'Banners/Context/BannerAdContext';
import { MRAIDAdUnitFactory } from '../MRAID/AdUnits/MRAIDAdUnitFactory';
import { CampaignParserManager } from './Managers/CampaignParserManager';
import { AdMob } from '../AdMob/AdMob';
import { MRAID } from '../MRAID/MRAID';
import { Display } from '../Display/Display';
import { Performance } from '../Performance/Performance';
import { VAST } from '../VAST/VAST';
import { VPAID } from '../VPAID/VPAID';
import { XPromo } from '../XPromo/XPromo';
import { IAds, IAdsApi } from './IAds';
import { IAnalytics } from '../Analytics/IAnalytics';
import { AdsConfigurationParser } from './Parsers/AdsConfigurationParser';
import { Promo } from 'Promo/Promo';
import { Banners } from 'Banners/Banners';
import { Monetization } from 'Monetization/Monetization';

export class Ads implements IAds {

    public readonly Api: Readonly<IAdsApi>;

    public readonly AdMobSignalFactory: AdMobSignalFactory;
    public readonly InterstitialWebPlayerContainer: InterstitialWebPlayerContainer;

    public readonly SessionManager: SessionManager;
    public readonly MissedImpressionManager: MissedImpressionManager;
    public readonly BackupCampaignManager: BackupCampaignManager;
    public readonly ProgrammaticTrackingService: ProgrammaticTrackingService;
    public readonly CampaignParserManager: CampaignParserManager;

    public Config: AdsConfiguration;
    public Container: Activity | ViewController;
    public GdprManager: GdprManager;
    public PlacementManager: PlacementManager;
    public AssetManager: AssetManager;
    public CampaignManager: CampaignManager;
    public RefreshManager: OldCampaignRefreshManager;

    private _currentAdUnit: AbstractAdUnit;
    private _cachedCampaignResponse?: INativeResponse;
    private _showing: boolean = false;
    private _creativeUrl?: string;
    private _requestDelay: number;
    private _wasRealtimePlacement: boolean = false;

    private _adUnitFactories: { [key: string]: AbstractAdUnitFactory } = {};

    private _core: ICore;

    public Banners: Banners;
    public Monetization: Monetization;

    constructor(config: any, core: ICore) {
        this.Config = AdsConfigurationParser.parse(config, core.ClientInfo);
        this._core = core;

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

        this.AdMobSignalFactory = new AdMobSignalFactory(this._core.NativeBridge.getPlatform(), this._core.Api, this.Api, this._core.ClientInfo, this._core.DeviceInfo, this._core.FocusManager);
        this.InterstitialWebPlayerContainer = new InterstitialWebPlayerContainer(this._core.NativeBridge.getPlatform(), this.Api);
        if(this._core.NativeBridge.getPlatform() === Platform.ANDROID) {
            document.body.classList.add('android');
            this.Container = new Activity(this._core.Api, this.Api, <AndroidDeviceInfo>this._core.DeviceInfo);
        } else if(this._core.NativeBridge.getPlatform() === Platform.IOS) {
            const model = this._core.DeviceInfo.getModel();
            if(model.match(/iphone/i) || model.match(/ipod/i)) {
                document.body.classList.add('iphone');
            } else if(model.match(/ipad/i)) {
                document.body.classList.add('ipad');
            }
            this.Container = new ViewController(this._core.Api, this.Api, <IosDeviceInfo>this._core.DeviceInfo, this._core.FocusManager, this._core.ClientInfo);
        }
        this.SessionManager = new SessionManager(this._core.Api.Storage, this._core.RequestManager, this._core.StorageBridge);
        this.MissedImpressionManager = new MissedImpressionManager(this._core.Api.Storage);
        this.BackupCampaignManager = new BackupCampaignManager(this._core.Api, this._core.StorageBridge, this._core.Config);
        this.ProgrammaticTrackingService = new ProgrammaticTrackingService(this._core.NativeBridge.getPlatform(), this._core.RequestManager, this._core.ClientInfo, this._core.DeviceInfo);
        this.CampaignParserManager = new CampaignParserManager();
    }

    public initialize(jaegerInitSpan: JaegerSpan) {
        return Promise.resolve().then(() => {
            SdkStats.setInitTimestamp();
            GameSessionCounters.init();
            return this.setupTestEnvironment();
        }).then(() => {
            return this._core.CacheBookkeeping.getCachedCampaignResponse();
        }).then(cachedCampaignResponse => {
            this.GdprManager = new GdprManager(this._core.NativeBridge.getPlatform(), this._core.Api, this._core.Config, this.Config, this._core.ClientInfo, this._core.DeviceInfo, this._core.RequestManager);
            this._cachedCampaignResponse = cachedCampaignResponse;

            this.PlacementManager = new PlacementManager(this.Api, this.Config);

            return this.GdprManager.getConsentAndUpdateConfiguration().catch((error) => {
                // do nothing
                // error happens when consent value is undefined
            });
        }).then(() => {
            const defaultPlacement = this.Config.getDefaultPlacement();
            this.Api.Placement.setDefaultPlacement(defaultPlacement.getId());

            this.AssetManager = new AssetManager(this._core.NativeBridge.getPlatform(), this._core.Api, this._core.CacheManager, this.Config.getCacheMode(), this._core.DeviceInfo, this._core.CacheBookkeeping, this.ProgrammaticTrackingService, this.BackupCampaignManager);
            if(this.SessionManager.getGameSessionId() % 10000 === 0) {
                this.AssetManager.setCacheDiagnostics(true);
            }

            const parserModules = [AdMob, Display, MRAID, Performance, VAST, VPAID, XPromo];
            parserModules.forEach(moduleConstructor => {
                const module = new moduleConstructor();
                const parsers = module.getParsers();
                this.CampaignParserManager.addParsers(parsers);
                parsers.forEach(parser => {
                    parser.getContentTypes().forEach(contentType => {
                        this._adUnitFactories[contentType] = module.getAdUnitFactory();
                    });
                });
            });

            const promo = new Promo(this._core, this, this._core.Purchasing, this._core.Analytics);
            const promoParsers = promo.getParsers();
            this.CampaignParserManager.addParsers(promoParsers);
            promoParsers.forEach(parser => {
                parser.getContentTypes().forEach(contentType => {
                    this._adUnitFactories[contentType] = promo.getAdUnitFactory();
                });
            });

            this.Banners = new Banners(this._core, this, this._core.Analytics);
            this.Monetization = new Monetization(this._core, this, promo, this._core.Purchasing);

            this.CampaignManager = new CampaignManager(this._core.NativeBridge.getPlatform(), this._core.Api, this._core.Config, this.Config, this.AssetManager, this.SessionManager, this.AdMobSignalFactory, this._core.RequestManager, this._core.ClientInfo, this._core.DeviceInfo, this._core.MetaDataManager, this._core.CacheBookkeeping, this.CampaignParserManager, this._core.JaegerManager, this.BackupCampaignManager);
            this.RefreshManager = new OldCampaignRefreshManager(this._core.NativeBridge.getPlatform(), this._core.Api, this.Api, this._core.WakeUpManager, this.CampaignManager, this.Config, this._core.FocusManager, this.SessionManager, this._core.ClientInfo, this._core.RequestManager, this._core.CacheManager);

            SdkStats.initialize(this._core.Api, this._core.RequestManager, this._core.Config, this.Config, this.SessionManager, this.CampaignManager, this._core.MetaDataManager, this._core.ClientInfo, this._core.CacheManager);
            promo.initialize();
            this.Monetization.Api.Listener.isMonetizationEnabled().then((enabled) => {
                if(enabled) {
                    this.Monetization.initialize();
                }
            });

            const refreshSpan = this._core.JaegerManager.startSpan('Refresh', jaegerInitSpan.id, jaegerInitSpan.traceId);
            refreshSpan.addTag(JaegerTags.DeviceType, Platform[this._core.NativeBridge.getPlatform()]);
            let refreshPromise;
            if(BackupCampaignTest.isValid(this._core.Config.getAbGroup())) {
                refreshPromise = this.RefreshManager.refreshWithBackupCampaigns(this.BackupCampaignManager);
            } else if(this._cachedCampaignResponse !== undefined) {
                refreshPromise = this.RefreshManager.refreshFromCache(this._cachedCampaignResponse, refreshSpan);
            } else {
                refreshPromise = this.RefreshManager.refresh();
            }
            return refreshPromise.then((resp) => {
                this._core.JaegerManager.stop(refreshSpan);
                return resp;
            }).catch((error) => {
                refreshSpan.addTag(JaegerTags.Error, 'true');
                refreshSpan.addTag(JaegerTags.ErrorMessage, error.message);
                this._core.JaegerManager.stop(refreshSpan);
                throw error;
            });
        }).then(() => {
            return this.SessionManager.sendUnsentSessions();
        });
    }

    public show(placementId: string, options: any, callback: INativeCallback): void {
        callback(CallbackStatus.OK);

        if(this._showing) {
            // do not send finish event because there will be a finish event from currently open ad unit
            this.showError(false, placementId, 'Can\'t show a new ad unit when ad unit is already open');
            return;
        }

        const placement: Placement = this.Config.getPlacement(placementId);
        if(!placement) {
            this.showError(true, placementId, 'No such placement: ' + placementId);
            return;
        }

        const campaign = this.RefreshManager.getCampaign(placementId);

        if(!campaign) {
            this.showError(true, placementId, 'Campaign not found');
            return;
        }

        SdkStats.sendShowEvent(placementId);

        if(campaign.isExpired()) {
            this.showError(true, placementId, 'Campaign has expired');
            this.RefreshManager.refresh();

            const error = new DiagnosticError(new Error('Campaign expired'), {
                id: campaign.getId(),
                willExpireAt: campaign.getWillExpireAt()
            });
            SessionDiagnostics.trigger('campaign_expired', error, campaign.getSession());
            return;
        }

        this._core.CacheBookkeeping.deleteCachedCampaignResponse();

        if (placement.getRealtimeData()) {
            this._core.Api.Sdk.logInfo('Unity Ads is requesting realtime fill for placement ' + placement.getId());
            const start = Date.now();

            const realtimeTimeoutInMillis = 1500;
            Promises.withTimeout(this.CampaignManager.requestRealtime(placement, campaign.getSession()), realtimeTimeoutInMillis).then(realtimeCampaign => {
                this._requestDelay = Date.now() - start;
                this._core.Api.Sdk.logInfo(`Unity Ads received a realtime request in ${this._requestDelay} ms.`);

                if(realtimeCampaign) {
                    this._core.Api.Sdk.logInfo('Unity Ads received new fill for placement ' + placement.getId() + ', streaming new ad unit');
                    this._wasRealtimePlacement = true;
                    placement.setCurrentCampaign(realtimeCampaign);
                    this.showAd(placement, realtimeCampaign, options);
                } else {
                    SessionDiagnostics.trigger('realtime_no_fill', {}, campaign.getSession());
                    this._core.Api.Sdk.logInfo('Unity Ads received no new fill for placement ' + placement.getId() + ', opening old ad unit');
                    this.showAd(placement, campaign, options);
                }
            }).catch((e) => {
                if (e instanceof TimeoutError) {
                    Diagnostics.trigger('realtime_network_timeout', {
                        auctionId: campaign.getSession().getId()
                    });
                }
                Diagnostics.trigger('realtime_error', {
                    error: e
                });
                this._core.Api.Sdk.logInfo('Unity Ads realtime fill request for placement ' + placement.getId() + ' failed, opening old ad unit');
                this.showAd(placement, campaign, options);
            });
        } else {
            this.showAd(placement, campaign, options);
        }
    }

    public showBanner(placementId: string, callback: INativeCallback) {
        callback(CallbackStatus.OK);

        const context = this.Banners.BannerAdContext;
        context.load(placementId).catch((e) => {
            this._core.Api.Sdk.logWarning(`Could not show banner due to ${e.message}`);
        });
    }

    public hideBanner(callback: INativeCallback) {
        callback(CallbackStatus.OK);

        const context = this.Banners.BannerAdContext;
        context.hide();
    }

    private showAd(placement: Placement, campaign: Campaign, options: any) {
        const testGroup = this._core.Config.getAbGroup();
        const start = Date.now();

        this._showing = true;

        if(this.Config.getCacheMode() !== CacheMode.DISABLED) {
            this.AssetManager.stopCaching();
        }

        Promise.all([
            this._core.DeviceInfo.getScreenWidth(),
            this._core.DeviceInfo.getScreenHeight(),
            this._core.DeviceInfo.getConnectionType()
        ]).then(([screenWidth, screenHeight, connectionType]) => {
            if(campaign.isConnectionNeeded() && connectionType === 'none') {
                this._showing = false;
                this.showError(true, placement.getId(), 'No connection');

                const error = new DiagnosticError(new Error('No connection is available'), {
                    id: campaign.getId()
                });
                SessionDiagnostics.trigger('mraid_no_connection', error, campaign.getSession());
                return;
            }

            const orientation = screenWidth >= screenHeight ? Orientation.LANDSCAPE : Orientation.PORTRAIT;
            this._currentAdUnit = this.getAdUnitFactory(campaign).createAdUnit({
                platform: this._core.NativeBridge.getPlatform(),
                core: this._core.Api,
                ads: this.Api,
                forceOrientation: orientation,
                focusManager: this._core.FocusManager,
                container: this.Container,
                deviceInfo: this._core.DeviceInfo,
                clientInfo: this._core.ClientInfo,
                thirdPartyEventManager: new ThirdPartyEventManager(this._core.Api, this._core.RequestManager, {
                    '%ZONE%': placement.getId(),
                    '%SDK_VERSION%': this._core.ClientInfo.getSdkVersion().toString()
                }),
                operativeEventManager: OperativeEventManagerFactory.createOperativeEventManager({
                    platform: this._core.NativeBridge.getPlatform(),
                    core: this._core.Api,
                    ads: this.Api,
                    request: this._core.RequestManager,
                    metaDataManager: this._core.MetaDataManager,
                    sessionManager: this.SessionManager,
                    clientInfo: this._core.ClientInfo,
                    deviceInfo: this._core.DeviceInfo,
                    coreConfig: this._core.Config,
                    adsConfig: this.Config,
                    storageBridge: this._core.StorageBridge,
                    campaign: campaign
                }),
                placement: placement,
                campaign: campaign,
                coreConfig: this._core.Config,
                adsConfig: this.Config,
                request: this._core.RequestManager,
                options: options,
                gdprManager: this.GdprManager,
                adMobSignalFactory: this.AdMobSignalFactory,
                programmaticTrackingService: this.ProgrammaticTrackingService,
                webPlayerContainer: this.InterstitialWebPlayerContainer,
                gameSessionId: this.SessionManager.getGameSessionId()
            });
            this.RefreshManager.setCurrentAdUnit(this._currentAdUnit);
            if (this.Monetization.isInitialized()) {
                this.Monetization.PlacementContentManager.setCurrentAdUnit(placement.getId(), this._currentAdUnit);
            }
            this._currentAdUnit.onClose.subscribe(() => this.onAdUnitClose());

            if(this._core.NativeBridge.getPlatform() === Platform.IOS && (campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign)) {
                if(!IosUtils.isAppSheetBroken(this._core.DeviceInfo.getOsVersion(), this._core.DeviceInfo.getModel()) && !campaign.getBypassAppSheet()) {
                    const appSheetOptions = {
                        id: parseInt(campaign.getAppStoreId(), 10)
                    };
                    this.Api.iOS!.AppSheet.prepare(appSheetOptions).then(() => {
                        const onCloseObserver = this.Api.iOS!.AppSheet.onClose.subscribe(() => {
                            this.Api.iOS!.AppSheet.prepare(appSheetOptions);
                        });
                        this._currentAdUnit.onClose.subscribe(() => {
                            this.Api.iOS!.AppSheet.onClose.unsubscribe(onCloseObserver);
                            if(CustomFeatures.isSimejiJapaneseKeyboardApp(this._core.ClientInfo.getGameId())) {
                                // app sheet is not closed properly if the user opens or downloads the game. Reset the app sheet.
                                this.Api.iOS!.AppSheet.destroy();
                            } else {
                                this.Api.iOS!.AppSheet.destroy(appSheetOptions);
                            }
                        });
                    });
                }
            }

            OperativeEventManager.setPreviousPlacementId(this.CampaignManager.getPreviousPlacementId());
            this.CampaignManager.setPreviousPlacementId(placement.getId());

            // Temporary for realtime testing purposes
            if (this._wasRealtimePlacement) {
                this._currentAdUnit.onStart.subscribe(() => {
                    const startDelay = Date.now() - start;
                    Diagnostics.trigger('realtime_delay', {
                        requestDelay: this._requestDelay,
                        startDelay: startDelay,
                        totalDelay: this._requestDelay + startDelay,
                        auctionId: campaign.getSession().getId(),
                        adUnitDescription: this._currentAdUnit.description()
                    });
                });
            }
            this._wasRealtimePlacement = false;

            this._currentAdUnit.show().then(() => {
                if(this._core.NativeBridge.getPlatform() === Platform.ANDROID) {
                    this._core.NativeBridge.setAutoBatchEnabled(true);
                    this._core.Api.Request.Android!.setMaximumPoolSize(8);
                } else {
                    this._core.Api.Request.setConcurrentRequestCount(8);
                }
            });
        });
    }

    private getAdUnitFactory(campaign: Campaign) {
        const contentType = campaign.getContentType();
        return this._adUnitFactories[contentType];
    }

    private showError(sendFinish: boolean, placementId: string, errorMsg: string): void {
        this._core.Api.Sdk.logError('Show invocation failed: ' + errorMsg);
        this.Api.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.SHOW_ERROR], errorMsg);
        if(sendFinish) {
            this.Api.Listener.sendFinishEvent(placementId, FinishState.ERROR);
        }
    }

    private onAdUnitClose(): void {
        this._showing = false;

        if(this._core.NativeBridge.getPlatform() === Platform.ANDROID) {
            if(!CustomFeatures.isAlwaysAutobatching(this._core.ClientInfo.getGameId())) {
                this._core.NativeBridge.setAutoBatchEnabled(false);
            }
            this._core.Api.Request.Android!.setMaximumPoolSize(1);
        } else {
            this._core.Api.Request.setConcurrentRequestCount(1);
        }
    }

    private setupTestEnvironment(): Promise<void> {
        return TestEnvironment.setup(new MetaData(this._core.Api)).then(() => {
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
                MRAIDAdUnitFactory.setForcedPlayableMRAID(TestEnvironment.get('forcedPlayableMRAID'));
            }

            if(TestEnvironment.get('forcedGDPRBanner')) {
                AbstractAdUnitFactory.setForcedGDPRBanner(TestEnvironment.get('forcedGDPRBanner'));
            }

            let forcedARMRAID = false;
            if (TestEnvironment.get('forcedARMRAID')) {
                forcedARMRAID = TestEnvironment.get('forcedARMRAID');
                MRAIDAdUnitFactory.setForcedARMRAID(forcedARMRAID);
            }
        });
    }

}
