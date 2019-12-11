import { AdMob } from 'AdMob/AdMob';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { IAds, IAdsApi } from 'Ads/IAds';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { AgeGateChoice, GDPREventAction, GDPREventSource, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { MissedImpressionManager } from 'Ads/Managers/MissedImpressionManager';
import { CampaignRefreshManager } from 'Ads/Managers/CampaignRefreshManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { PlacementManager } from 'Ads/Managers/PlacementManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration, IRawAdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { IThirdPartyEventManagerFactory, ThirdPartyEventManagerFactory } from 'Ads/Managers/ThirdPartyEventManagerFactory';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { AdsPropertiesApi } from 'Ads/Native/AdsProperties';
import { AndroidAdUnitApi } from 'Ads/Native/Android/AdUnit';
import { AndroidVideoPlayerApi } from 'Ads/Native/Android/VideoPlayer';
import { IosAdUnitApi } from 'Ads/Native/iOS/AdUnit';
import { IosVideoPlayerApi } from 'Ads/Native/iOS/VideoPlayer';
import { ListenerApi } from 'Ads/Native/Listener';
import { PlacementApi } from 'Ads/Native/Placement';
import { VideoPlayerApi } from 'Ads/Native/VideoPlayer';
import { WebPlayerApi } from 'Ads/Native/WebPlayer';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { ChinaMetric, ProgrammaticTrackingError, MiscellaneousMetric, LoadMetric, TimingMetric } from 'Ads/Utilities/ProgrammaticTrackingService';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { InterstitialWebPlayerContainer } from 'Ads/Utilities/WebPlayer/InterstitialWebPlayerContainer';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { BannerModule } from 'Banners/BannerModule';
import { AuctionRequest } from 'Ads/Networking/AuctionRequest';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { UnityAdsError } from 'Core/Constants/UnityAdsError';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { ICore } from 'Core/ICore';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { CallbackStatus, INativeCallback } from 'Core/Native/Bridge/NativeBridge';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { Display } from 'Display/Display';
import { Monetization } from 'Monetization/Monetization';
import { MRAID } from 'MRAID/MRAID';
import { MRAIDView } from 'MRAID/Views/MRAIDView';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { Performance } from 'Performance/Performance';
import { Promo } from 'Promo/Promo';
import { VAST } from 'VAST/VAST';
import { VPAID } from 'VPAID/VPAID';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { XPromo } from 'XPromo/XPromo';
import { AR } from 'AR/AR';
import CreativeUrlResponseAndroid from 'json/CreativeUrlResponseAndroid.json';
import CreativeUrlResponseIos from 'json/CreativeUrlResponseIos.json';
import { CampaignResponseUtils } from 'Ads/Utilities/CampaignResponseUtils';
import { PlayerMetaData } from 'Core/Models/MetaData/PlayerMetaData';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { PermissionsUtil, PermissionTypes } from 'Core/Utilities/Permissions';
import { AbstractParserModule } from 'Ads/Modules/AbstractParserModule';
import { MRAIDAdUnitParametersFactory } from 'MRAID/AdUnits/MRAIDAdUnitParametersFactory';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PrivacyUnit } from 'Ads/AdUnits/PrivacyUnit';
import { China } from 'China/China';
import { IStore } from 'Store/IStore';
import { Store } from 'Store/Store';
import { RequestManager } from 'Core/Managers/RequestManager';
import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { LoadApi } from 'Core/Native/LoadApi';
import { RefreshManager } from 'Ads/Managers/RefreshManager';
import { PerPlacementLoadManager } from 'Ads/Managers/PerPlacementLoadManager';
import { Analytics } from 'Analytics/Analytics';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { PrivacyParser } from 'Privacy/Parsers/PrivacyParser';
import { Promises } from 'Core/Utilities/Promises';
import { LoadExperiment, LoadRefreshV4, ZyngaLoadRefreshV4 } from 'Core/Models/ABGroup';
import { PerPlacementLoadManagerV4 } from 'Ads/Managers/PerPlacementLoadManagerV4';
import { PrivacyMetrics } from 'Privacy/PrivacyMetrics';
import { PerPlacementLoadAdapter } from 'Ads/Managers/PerPlacementLoadAdapter';

export class Ads implements IAds {

    public readonly Api: Readonly<IAdsApi>;

    public readonly AdMobSignalFactory: AdMobSignalFactory;
    public readonly InterstitialWebPlayerContainer: InterstitialWebPlayerContainer;

    public readonly SessionManager: SessionManager;
    public readonly MissedImpressionManager: MissedImpressionManager;
    public readonly ContentTypeHandlerManager: ContentTypeHandlerManager;
    public readonly ThirdPartyEventManagerFactory: IThirdPartyEventManagerFactory;

    public Config: AdsConfiguration;
    public Container: Activity | ViewController;
    public PrivacySDK: PrivacySDK;
    public PrivacyManager: UserPrivacyManager;
    public PlacementManager: PlacementManager;
    public AssetManager: AssetManager;
    public CampaignManager: CampaignManager;
    public RefreshManager: RefreshManager;

    private static _forcedConsentUnit: boolean = false;

    private _currentAdUnit: AbstractAdUnit;
    private _showing: boolean = false;
    private _showingPrivacy: boolean = false;
    private _loadApiEnabled: boolean = false;
    private _webViewEnabledLoad: boolean = false;
    private _core: ICore;

    public BannerModule: BannerModule;
    public Monetization: Monetization;
    public AR: AR;
    public China: China;
    public Analytics: Analytics;
    public Store: IStore;

    constructor(config: unknown, core: ICore) {
        this.PrivacySDK = PrivacyParser.parse(<IRawAdsConfiguration>config, core.ClientInfo, core.DeviceInfo);
        this.Config = AdsConfigurationParser.parse(<IRawAdsConfiguration>config);
        this._core = core;

        this.Analytics = new Analytics(core, this.PrivacySDK);
        this.Store = new Store(core, this.Analytics.AnalyticsManager);

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
                AdUnit: new IosAdUnitApi(core.NativeBridge),
                VideoPlayer: new IosVideoPlayerApi(core.NativeBridge)
            } : undefined,
            LoadApi: new LoadApi(core.NativeBridge)
        };

        this.AdMobSignalFactory = new AdMobSignalFactory(this._core.NativeBridge.getPlatform(), this._core.Api, this.Api, this._core.ClientInfo, this._core.DeviceInfo, this._core.FocusManager);
        this.InterstitialWebPlayerContainer = new InterstitialWebPlayerContainer(this._core.NativeBridge.getPlatform(), this.Api);
        if (this._core.NativeBridge.getPlatform() === Platform.ANDROID) {
            document.body.classList.add('android');
            this.Container = new Activity(this._core.Api, this.Api, <AndroidDeviceInfo> this._core.DeviceInfo);
        } else if (this._core.NativeBridge.getPlatform() === Platform.IOS) {
            const model = this._core.DeviceInfo.getModel();
            if (model.match(/iphone/i) || model.match(/ipod/i)) {
                document.body.classList.add('iphone');
            } else if (model.match(/ipad/i)) {
                document.body.classList.add('ipad');
            }
            this.Container = new ViewController(this._core.Api, this.Api, <IosDeviceInfo> this._core.DeviceInfo, this._core.FocusManager, this._core.ClientInfo);
        }
        this.SessionManager = new SessionManager(this._core.Api, this._core.RequestManager, this._core.StorageBridge);
        this.MissedImpressionManager = new MissedImpressionManager(this._core.Api);
        this.ContentTypeHandlerManager = new ContentTypeHandlerManager();
        this.ThirdPartyEventManagerFactory = new ThirdPartyEventManagerFactory(this._core.Api, this._core.RequestManager);
    }

    public initialize(): Promise<void> {
        return Promise.resolve().then(() => {
            SdkStats.setInitTimestamp();
            GameSessionCounters.init();
            return this.setupTestEnvironment();
        }).then(() => {
            return this.Analytics.initialize();
        }).then((gameSessionId: number) => {
            this.SessionManager.setGameSessionId(gameSessionId);
            this.PrivacyManager = new UserPrivacyManager(this._core.NativeBridge.getPlatform(), this._core.Api, this._core.Config, this.Config, this._core.ClientInfo, this._core.DeviceInfo, this._core.RequestManager, this.PrivacySDK, Ads._forcedConsentUnit);
            this.PlacementManager = new PlacementManager(this.Api, this.Config);

            PrivacyMetrics.setGameSessionId(gameSessionId);
            PrivacyMetrics.setPrivacy(this.PrivacySDK);
            PrivacyMetrics.setAbGroup(this._core.Config.getAbGroup());
        }).then(() => {
            return this.setupLoadApiEnabled();
        }).then(() => {
            return this.PrivacyManager.getConsentAndUpdateConfiguration().catch(() => {
                // do nothing
                // error happens when consent value is undefined
            });
        }).then(() => {
            const defaultPlacement = this.Config.getDefaultPlacement();
            this.Api.Placement.setDefaultPlacement(defaultPlacement.getId());

            this.AssetManager = new AssetManager(this._core.NativeBridge.getPlatform(), this._core.Api, this._core.CacheManager, this.Config.getCacheMode(), this._core.DeviceInfo, this._core.CacheBookkeeping, this._core.ProgrammaticTrackingService);
            if (this.SessionManager.getGameSessionId() % 10000 === 0) {
                this.AssetManager.setCacheDiagnostics(true);
            }

            const promo = new Promo(this._core, this, this._core.Purchasing);
            const promoContentTypeHandlerMap = promo.getContentTypeHandlerMap();
            for (const contentType in promoContentTypeHandlerMap) {
                if (promoContentTypeHandlerMap.hasOwnProperty(contentType)) {
                    this.ContentTypeHandlerManager.addHandler(contentType, promoContentTypeHandlerMap[contentType]);
                }
            }

            this.BannerModule = new BannerModule(this._core, this);
            this.Monetization = new Monetization(this._core, this, promo, this._core.Purchasing);
            this.AR = new AR(this._core);

            if (CustomFeatures.isChinaSDK(this._core.NativeBridge.getPlatform(), this._core.ClientInfo.getSdkVersionName())) {
                this.China = new China(this._core);
                this.China.initialize();
            }

            if (this.SessionManager.getGameSessionId() % 1000 === 0) {
                Promise.all([
                    ARUtil.isARSupported(this.AR.Api),
                    PermissionsUtil.checkPermissionInManifest(this._core.NativeBridge.getPlatform(), this._core.Api, PermissionTypes.CAMERA),
                    PermissionsUtil.checkPermissions(this._core.NativeBridge.getPlatform(), this._core.Api, PermissionTypes.CAMERA)
                ]).then(([arSupported, permissionInManifest, permissionResult]) => {
                    Diagnostics.trigger('ar_device_support', { arSupported, permissionInManifest, permissionResult });
                }).catch((error) => {
                    Diagnostics.trigger('ar_device_support_check_error', error);
                });
            }

            this.logChinaMetrics();

            const parserModules: AbstractParserModule[] = [
                new AdMob(this._core, this),
                new Display(this._core, this),
                new MRAID(this.AR.Api, this._core, this),
                new Performance(this.AR.Api, this._core, this, this.China),
                new VAST(this._core, this),
                new VPAID(this._core, this),
                new XPromo(this._core, this)
            ];

            parserModules.forEach(module => {
                const contentTypeHandlerMap = module.getContentTypeHandlerMap();
                for (const contentType in contentTypeHandlerMap) {
                    if (contentTypeHandlerMap.hasOwnProperty(contentType)) {
                        this.ContentTypeHandlerManager.addHandler(contentType, contentTypeHandlerMap[contentType]);
                    }
                }
            });

            RequestManager.setAuctionProtocol(this._core.Config, this.Config, this._core.NativeBridge.getPlatform(), this._core.ClientInfo);

            this.CampaignManager = new CampaignManager(this._core.NativeBridge.getPlatform(), this._core, this._core.Config, this.Config, this.AssetManager, this.SessionManager, this.AdMobSignalFactory, this._core.RequestManager, this._core.ClientInfo, this._core.DeviceInfo, this._core.MetaDataManager, this._core.CacheBookkeeping, this.ContentTypeHandlerManager, this.PrivacySDK, this.PrivacyManager);
            this.configureRefreshManager();
            SdkStats.initialize(this._core.Api, this._core.RequestManager, this._core.Config, this.Config, this.SessionManager, this.CampaignManager, this._core.MetaDataManager, this._core.ClientInfo, this._core.CacheManager);

            promo.initialize();

            this.Monetization.Api.Listener.isMonetizationEnabled().then((enabled) => {
                if (enabled) {
                    this.Monetization.initialize();
                }
            });

        }).then(() => {
            return this._core.Api.Sdk.initComplete();
        }).then(() => {
            const initializeAuctionTimespan = Date.now();
            return Promises.voidResult(this.RefreshManager.initialize().then(() => {
                this._core.ProgrammaticTrackingService.batchEvent(TimingMetric.AuctionToFillStatusTime, Date.now() - initializeAuctionTimespan);
            }));
        }).then(() => {
            return Promises.voidResult(this.SessionManager.sendUnsentSessions());
        });
    }

    private configureRefreshManager(): void {
        if (this._loadApiEnabled && this._webViewEnabledLoad) {
            const abGroup = this._core.Config.getAbGroup();
            const isZyngaDealGame = CustomFeatures.isZyngaDealGame(this._core.ClientInfo.getGameId());

            if (isZyngaDealGame && ZyngaLoadRefreshV4.isValid(abGroup)) {
                this.RefreshManager = new PerPlacementLoadManagerV4(this.Api, this.Config, this._core.Config, this.CampaignManager, this._core.ClientInfo, this._core.FocusManager, this._core.ProgrammaticTrackingService);
            } else if (LoadRefreshV4.isValid(abGroup)) {
                this.RefreshManager = new PerPlacementLoadManagerV4(this.Api, this.Config, this._core.Config, this.CampaignManager, this._core.ClientInfo, this._core.FocusManager, this._core.ProgrammaticTrackingService);
            } else {
                this.RefreshManager = new PerPlacementLoadManager(this.Api, this.Config, this._core.Config, this.CampaignManager, this._core.ClientInfo, this._core.FocusManager, this._core.ProgrammaticTrackingService);
            }
        } else if (this._loadApiEnabled) {
            this.RefreshManager = new PerPlacementLoadAdapter(this._core.NativeBridge.getPlatform(), this._core.Api, this._core.Config, this.Api, this._core.WakeUpManager, this.CampaignManager, this.Config, this._core.FocusManager, this.SessionManager, this._core.ClientInfo, this._core.RequestManager, this._core.CacheManager);
        } else {
            this.RefreshManager = new CampaignRefreshManager(this._core.NativeBridge.getPlatform(), this._core.Api, this._core.Config, this.Api, this._core.WakeUpManager, this.CampaignManager, this.Config, this._core.FocusManager, this.SessionManager, this._core.ClientInfo, this._core.RequestManager, this._core.CacheManager);
        }
    }

    private showPrivacyIfNeeded(options: unknown): Promise<void> {
        if (!this.PrivacyManager.isPrivacyShowRequired()) {
            return Promise.resolve();
        }

        if (CustomFeatures.sampleAtGivenPercent(1)) {
            Diagnostics.trigger('consent_show', {adsConfig: JSON.stringify(this.Config.getDTO())});
        }

        if (this._core.Config.isCoppaCompliant()) {
            Diagnostics.trigger('consent_with_coppa', {
                coreConfig: this._core.Config.getDTO(),
                adsConfig: this.Config.getDTO()
            });
            return Promise.resolve();
        }

        this._showingPrivacy = true;

        const privacyView = new PrivacyUnit({
            abGroup: this._core.Config.getAbGroup(),
            platform: this._core.NativeBridge.getPlatform(),
            privacyManager: this.PrivacyManager,
            adUnitContainer: this.Container,
            adsConfig: this.Config,
            core: this._core.Api,
            deviceInfo: this._core.DeviceInfo,
            pts: this._core.ProgrammaticTrackingService,
            privacySDK: this.PrivacySDK
        });
        return privacyView.show(options);
    }

    public show(placementId: string, options: unknown, callback: INativeCallback): void {
        callback(CallbackStatus.OK);

        if (this.isAttemptingToShowInBackground()) {
            this._core.ProgrammaticTrackingService.reportMetricEvent(MiscellaneousMetric.CampaignAttemptedShowInBackground);
            return;
        }

        const campaign = this.RefreshManager.getCampaign(placementId);
        if (!campaign) {
            this.showError(true, placementId, 'Campaign not found');
            this._core.ProgrammaticTrackingService.reportMetricEvent(MiscellaneousMetric.CampaignNotFound);
            return;
        }

        const contentType = campaign.getContentType();
        const seatId = campaign.getSeatId();

        if (this._showing || this._showingPrivacy) {
            // do not send finish event because there will be a finish event from currently open ad unit
            this.showError(false, placementId, 'Can\'t show a new ad unit when ad unit is already open');
            this._core.ProgrammaticTrackingService.reportErrorEvent(ProgrammaticTrackingError.AdUnitAlreadyShowing, contentType, seatId);
            return;
        }

        if (this._core.DeviceIdManager &&
            this._core.DeviceIdManager.isCompliant(this._core.Config.getCountry(), this.PrivacySDK.isGDPREnabled(), this.PrivacySDK.isOptOutRecorded(), this.PrivacySDK.isOptOutEnabled()) &&
            this._core.DeviceInfo instanceof AndroidDeviceInfo &&
            !this._core.DeviceInfo.getDeviceId1()) {

            this._core.DeviceIdManager.getDeviceIds().then(() => {
                Diagnostics.trigger('china_imei_collected', {
                    imei: this._core.DeviceInfo instanceof AndroidDeviceInfo ? this._core.DeviceInfo.getDeviceId1() : 'no-info'
                });
            }).catch((error) => {
                Diagnostics.trigger('china_imei_notcollected', error);
            });
        }

        const placement: Placement = this.Config.getPlacement(placementId);
        if (!placement) {
            this.showError(true, placementId, 'No such placement: ' + placementId);
            this._core.ProgrammaticTrackingService.reportErrorEvent(ProgrammaticTrackingError.PlacementWithIdDoesNotExist, contentType, seatId);
            return;
        }

        SdkStats.sendShowEvent(placementId);

        if (campaign instanceof PromoCampaign && campaign.getRequiredAssets().length === 0) {
            this.showError(false, placementId, 'No creatives found for promo campaign');
            this._core.ProgrammaticTrackingService.reportErrorEvent(ProgrammaticTrackingError.PromoWithoutCreatives, contentType, seatId);
            return;
        }

        if (campaign.isExpired()) {
            this.showError(true, placementId, 'Campaign has expired');
            this.RefreshManager.refresh();

            const error = new DiagnosticError(new Error('Campaign expired'), {
                id: campaign.getId(),
                willExpireAt: campaign.getWillExpireAt(),
                contentType: campaign.getContentType()
            });
            SessionDiagnostics.trigger('campaign_expired', error, campaign.getSession());
            this._core.ProgrammaticTrackingService.reportErrorEvent(ProgrammaticTrackingError.CampaignExpired, contentType, seatId);
            return;
        }

        const trackingUrls = placement.getCurrentTrackingUrls();
        if (trackingUrls) {
            // Do not remove: Removing will currently break all tracking
            campaign.setTrackingUrls(trackingUrls);
        } else {
            this._core.ProgrammaticTrackingService.reportErrorEvent(ProgrammaticTrackingError.MissingTrackingUrlsOnShow, contentType);
        }

        this.showPrivacyIfNeeded(options).then(() => {
            this._showingPrivacy = false;
            this.showAd(placement, campaign, options);
        });
    }

    private showAd(placement: Placement, campaign: Campaign, options: unknown) {

        this._showing = true;

        if (this.Config.getCacheMode() !== CacheMode.DISABLED) {
            this.AssetManager.stopCaching();
        }

        Promise.all([
            this._core.DeviceInfo.getScreenWidth(),
            this._core.DeviceInfo.getScreenHeight(),
            this._core.DeviceInfo.getConnectionType(),
            this._core.MetaDataManager.fetch(PlayerMetaData, false)
        ]).then(([screenWidth, screenHeight, connectionType, playerMetadata]) => {
            let playerMetadataServerId: string | undefined;
            if (playerMetadata) {
                playerMetadataServerId = playerMetadata.getServerId();
            }

            if (campaign.isConnectionNeeded() && connectionType === 'none') {
                this._showing = false;
                this.showError(true, placement.getId(), 'No connection');

                const error = new DiagnosticError(new Error('No connection is available'), {
                    id: campaign.getId()
                });
                SessionDiagnostics.trigger('mraid_no_connection', error, campaign.getSession());
                // If there is no connection, would this metric even be fired? If it does, then maybe we should investigate enabling this regardless of connection
                this._core.ProgrammaticTrackingService.reportErrorEvent(ProgrammaticTrackingError.NoConnectionWhenNeeded, campaign.getContentType(), campaign.getSeatId());
                return;
            }

            const orientation = screenWidth >= screenHeight ? Orientation.LANDSCAPE : Orientation.PORTRAIT;
            AbstractPrivacy.createBuildInformation(this._core.NativeBridge.getPlatform(), this._core.ClientInfo, this._core.DeviceInfo, campaign, this._core.Config);
            this._currentAdUnit = this.getAdUnitFactory(campaign).create(campaign, placement, orientation, playerMetadataServerId || '', options);
            this.RefreshManager.setCurrentAdUnit(this._currentAdUnit, placement);
            if (this.Monetization.isInitialized()) {
                this.Monetization.PlacementContentManager.setCurrentAdUnit(placement.getId(), this._currentAdUnit);
            }
            this._currentAdUnit.onClose.subscribe(() => this.onAdUnitClose());

            if (this._core.NativeBridge.getPlatform() === Platform.IOS && (campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign)) {
                if (!IosUtils.isAppSheetBroken(this._core.DeviceInfo.getOsVersion(), this._core.DeviceInfo.getModel(), orientation) && !campaign.getBypassAppSheet()) {
                    const appSheetOptions = {
                        id: parseInt(campaign.getAppStoreId(), 10)
                    };
                    this.Store.Api.iOS!.AppSheet.prepare(appSheetOptions).then(() => {
                        const onCloseObserver = this.Store.Api.iOS!.AppSheet.onClose.subscribe(() => {
                            this.Store.Api.iOS!.AppSheet.prepare(appSheetOptions);
                        });
                        this._currentAdUnit.onClose.subscribe(() => {
                            this.Store.Api.iOS!.AppSheet.onClose.unsubscribe(onCloseObserver);
                            if (CustomFeatures.isSimejiJapaneseKeyboardApp(this._core.ClientInfo.getGameId())) {
                                // app sheet is not closed properly if the user opens or downloads the game. Reset the app sheet.
                                this.Store.Api.iOS!.AppSheet.destroy();
                            } else {
                                this.Store.Api.iOS!.AppSheet.destroy(appSheetOptions);
                            }
                        });
                    });
                }
            }

            OperativeEventManager.setPreviousPlacementId(this.CampaignManager.getPreviousPlacementId());
            this.CampaignManager.setPreviousPlacementId(placement.getId());

            this._currentAdUnit.show().then(() => {
                if (this._loadApiEnabled && this._webViewEnabledLoad) {
                    this._core.ProgrammaticTrackingService.reportMetricEvent(LoadMetric.LoadEnabledShow);
                }
            });
        });
    }

    private isAttemptingToShowInBackground(): boolean {
        const isAppBackgrounded = !this._core.FocusManager.isAppForeground();
        const isAppWhitelistedToShowInBackground = CustomFeatures.isWhitelistedToShowInBackground(this._core.ClientInfo.getGameId());
        return isAppBackgrounded && !isAppWhitelistedToShowInBackground;
    }

    private getAdUnitFactory(campaign: Campaign) {
        const contentType = campaign.getContentType();
        return this.ContentTypeHandlerManager.getFactory(contentType);
    }

    private showError(sendFinish: boolean, placementId: string, errorMsg: string): void {
        this._core.Api.Sdk.logError('Show invocation failed: ' + errorMsg);
        this.Api.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.SHOW_ERROR], errorMsg);
        if (sendFinish) {
            this.Api.Listener.sendFinishEvent(placementId, FinishState.ERROR);
        }
    }

    private onAdUnitClose(): void {
        this._showing = false;
    }

    private setupTestEnvironment(): void {
        if (TestEnvironment.get('serverUrl')) {
            ProgrammaticOperativeEventManager.setTestBaseUrl(TestEnvironment.get('serverUrl'));
            CampaignManager.setBaseUrl(TestEnvironment.get('serverUrl'));
            AuctionRequest.setBaseUrl(TestEnvironment.get('serverUrl'));
        }

        if (TestEnvironment.get('campaignId')) {
            CampaignManager.setCampaignId(TestEnvironment.get('campaignId'));
        }

        if (TestEnvironment.get('sessionId')) {
            CampaignManager.setSessionId(TestEnvironment.get('sessionId'));
            AuctionRequest.setSessionId(TestEnvironment.get('sessionId'));
        }

        if (TestEnvironment.get('country')) {
            CampaignManager.setCountry(TestEnvironment.get('country'));
        }

        if (TestEnvironment.get('autoSkip')) {
            VideoOverlay.setAutoSkip(TestEnvironment.get('autoSkip'));
        }

        if (TestEnvironment.get('autoClose')) {
            AbstractAdUnit.setAutoClose(TestEnvironment.get('autoClose'));
        }

        if (TestEnvironment.get('autoCloseDelay')) {
            AbstractAdUnit.setAutoCloseDelay(TestEnvironment.get('autoCloseDelay'));
        }

        if (TestEnvironment.get('forcedOrientation')) {
            AdUnitContainer.setForcedOrientation(TestEnvironment.get('forcedOrientation'));
        }

        if (TestEnvironment.get('forcedPlayableMRAID')) {
            MRAIDAdUnitParametersFactory.setForcedExtendedMRAID(TestEnvironment.get('forcedPlayableMRAID'));
        }

        if (TestEnvironment.get('forcedGDPRBanner')) {
            AbstractAdUnitParametersFactory.setForcedGDPRBanner(TestEnvironment.get('forcedGDPRBanner'));
        }

        let forcedARMRAID = false;
        if (TestEnvironment.get('forcedARMRAID')) {
            forcedARMRAID = TestEnvironment.get('forcedARMRAID');
            MRAIDAdUnitParametersFactory.setForcedARMRAID(forcedARMRAID);
        }

        let forcedConsentUnit = false;
        if (TestEnvironment.get('forcedConsent')) {
            forcedConsentUnit = TestEnvironment.get('forcedConsent');
            Ads._forcedConsentUnit = forcedConsentUnit;
        }

        if (TestEnvironment.get('creativeUrl')) {
            // reset auction protocol to allow changing between creativeUrl and creativePack modes
            RequestManager.setTestAuctionProtocol(undefined);

            const creativeUrl = TestEnvironment.get<string>('creativeUrl');
            let response: string = '';
            const platform = this._core.NativeBridge.getPlatform();
            if (platform === Platform.ANDROID) {
                response = JSON.stringify(CreativeUrlResponseAndroid).replace('{CREATIVE_URL_PLACEHOLDER}', creativeUrl);
            } else if (platform === Platform.IOS) {
                response = JSON.stringify(CreativeUrlResponseIos).replace('{CREATIVE_URL_PLACEHOLDER}', creativeUrl);
            }

            if (forcedARMRAID) {
                response = response.replace('{AD_TYPE_PLACEHOLDER}', 'MRAID_AR');
            } else {
                response = response.replace('{AD_TYPE_PLACEHOLDER}', 'MRAID');
            }

            CampaignManager.setCampaignResponse(response);
        }

        const creativePack: string = TestEnvironment.get('creativePack');
        if (creativePack) {
            // reset auction protocol to allow changing between creativeUrl and creativePack modes
            RequestManager.setTestAuctionProtocol(undefined);

            const platform = this._core.NativeBridge.getPlatform();
            const response = CampaignResponseUtils.getVideoCreativePackResponse(platform, creativePack);

            CampaignManager.setCampaignResponse(response);
        }

        if (TestEnvironment.get('debugJsConsole')) {
            MRAIDView.setDebugJsConsole(TestEnvironment.get('debugJsConsole'));
        }
    }

    private logChinaMetrics() {
        const isChineseUser = this._core.Config.getCountry() === 'CN';
        if (isChineseUser) {
            this._core.ProgrammaticTrackingService.reportMetricEvent(ChinaMetric.ChineseUserInitialized);
        }
        this.identifyUser(isChineseUser);
    }

    private identifyUser(isChineseUser: boolean) {
        this.isUsingChineseNetworkOperator().then(isAChineseNetwork => {
            if (isAChineseNetwork) {
                const networkMetric = isChineseUser ? ChinaMetric.ChineseUserIdentifiedCorrectlyByNetworkOperator : ChinaMetric.ChineseUserIdentifiedIncorrectlyByNetworkOperator;
                this._core.ProgrammaticTrackingService.reportMetricEvent(networkMetric);
            } else {
                const localeMetric = isChineseUser ? ChinaMetric.ChineseUserIdentifiedCorrectlyByLocale : ChinaMetric.ChineseUserIdentifiedIncorrectlyByLocale;
                this.logChinaLocalizationOptimizations(localeMetric);
            }
        });
    }

    private isUsingChineseNetworkOperator(): Promise<boolean> {
        return this._core.DeviceInfo.getNetworkOperator().then(networkOperator => {
            return !!(networkOperator && networkOperator.length >= 3 && networkOperator.substring(0, 3) === '460');
        });
    }

    private logChinaLocalizationOptimizations(metric: ChinaMetric) {
        const deviceLanguage = this._core.DeviceInfo.getLanguage().toLowerCase();
        const chineseLanguage = !!(deviceLanguage.match(/zh[-_]cn/) || deviceLanguage.match(/zh[-_]hans/) || deviceLanguage.match(/zh(((_#?hans)?(_\\D\\D)?)|((_\\D\\D)?(_#?hans)?))$/));
        const chineseTimeZone = this._core.DeviceInfo.getTimeZone() === 'GMT+08:00';
        if (chineseLanguage && chineseTimeZone) {
            this._core.ProgrammaticTrackingService.reportMetricEvent(metric);
        }
    }

    private setupLoadApiEnabled(): void {
        this._loadApiEnabled = this._core.ClientInfo.getUsePerPlacementLoad();

        const isZyngaDealGame = CustomFeatures.isZyngaDealGame(this._core.ClientInfo.getGameId());
        const isMopubTestGame = CustomFeatures.isMopubTestGameForLoad(this._core.ClientInfo.getGameId());
        const isContainedLoadExperiment = LoadExperiment.isValid(this._core.Config.getAbGroup()) && CustomFeatures.isWhiteListedForLoadApi(this._core.ClientInfo.getGameId());
        if (isContainedLoadExperiment || isZyngaDealGame || isMopubTestGame) {
            this._webViewEnabledLoad = true;
        }
    }
}
