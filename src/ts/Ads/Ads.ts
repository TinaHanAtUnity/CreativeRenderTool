import { AdMob } from 'AdMob/AdMob';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { IAds, IAdsApi } from 'Ads/IAds';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { BackupCampaignManager } from 'Ads/Managers/BackupCampaignManager';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { MissedImpressionManager } from 'Ads/Managers/MissedImpressionManager';
import { OldCampaignRefreshManager } from 'Ads/Managers/OldCampaignRefreshManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { PlacementManager } from 'Ads/Managers/PlacementManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration, IRawAdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { IThirdPartyEventManagerFactory, ThirdPartyEventManagerFactory } from 'Ads/Managers/ThirdPartyEventManager';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
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
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { InterstitialWebPlayerContainer } from 'Ads/Utilities/WebPlayer/InterstitialWebPlayerContainer';
import { NewVideoOverlay } from 'Ads/Views/NewVideoOverlay';
import { Banners } from 'Banners/Banners';
import { AuctionRequest } from 'Banners/Utilities/AuctionRequest';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { UnityAdsError } from 'Core/Constants/UnityAdsError';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { ICore } from 'Core/ICore';
import { JaegerSpan, JaegerTags } from 'Core/Jaeger/JaegerSpan';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { CallbackStatus, INativeCallback } from 'Core/Native/Bridge/NativeBridge';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Promises, TimeoutError } from 'Core/Utilities/Promises';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { Display } from 'Display/Display';
import { Monetization } from 'Monetization/Monetization';
import { MRAID } from 'MRAID/MRAID';
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
import { PlayerMetaData } from 'Core/Models/MetaData/PlayerMetaData';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { CurrentPermission, PermissionsUtil, PermissionTypes } from 'Core/Utilities/Permissions';
import { AbstractParserModule } from 'Ads/Modules/AbstractParserModule';
import { MRAIDAdUnitParametersFactory } from 'MRAID/AdUnits/MRAIDAdUnitParametersFactory';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { ConsentUnit } from 'Ads/AdUnits/ConsentUnit';
import { PrivacyMethod } from 'Ads/Models/Privacy';

export class Ads implements IAds {

    public readonly Api: Readonly<IAdsApi>;

    public readonly AdMobSignalFactory: AdMobSignalFactory;
    public readonly InterstitialWebPlayerContainer: InterstitialWebPlayerContainer;

    public readonly SessionManager: SessionManager;
    public readonly MissedImpressionManager: MissedImpressionManager;
    public readonly BackupCampaignManager: BackupCampaignManager;
    public readonly ProgrammaticTrackingService: ProgrammaticTrackingService;
    public readonly ContentTypeHandlerManager: ContentTypeHandlerManager;
    public readonly ThirdPartyEventManagerFactory: IThirdPartyEventManagerFactory;

    public Config: AdsConfiguration;
    public Container: Activity | ViewController;
    public PrivacyManager: UserPrivacyManager;
    public PlacementManager: PlacementManager;
    public AssetManager: AssetManager;
    public CampaignManager: CampaignManager;
    public RefreshManager: OldCampaignRefreshManager;

    private _currentAdUnit: AbstractAdUnit;
    private _showing: boolean = false;
    private _creativeUrl?: string;
    private _requestDelay: number;
    private _wasRealtimePlacement: boolean = false;

    private _core: ICore;

    public Banners: Banners;
    public Monetization: Monetization;
    public AR: AR;

    constructor(config: unknown, core: ICore) {
        this.Config = AdsConfigurationParser.parse(<IRawAdsConfiguration>config, core.ClientInfo);
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
        this.SessionManager = new SessionManager(this._core.Api, this._core.RequestManager, this._core.StorageBridge);
        this.MissedImpressionManager = new MissedImpressionManager(this._core.Api);
        this.BackupCampaignManager = new BackupCampaignManager(this._core.Api, this._core.StorageBridge, this._core.Config, this._core.DeviceInfo);
        this.ProgrammaticTrackingService = new ProgrammaticTrackingService(this._core.NativeBridge.getPlatform(), this._core.RequestManager, this._core.ClientInfo, this._core.DeviceInfo);
        this.ContentTypeHandlerManager = new ContentTypeHandlerManager();
        this.ThirdPartyEventManagerFactory = new ThirdPartyEventManagerFactory(this._core.Api, this._core.RequestManager);
    }

    public initialize(jaegerInitSpan: JaegerSpan) {
        return Promise.resolve().then(() => {
            SdkStats.setInitTimestamp();
            GameSessionCounters.init();
            return this.setupTestEnvironment();
        }).then(() => {
            this.PrivacyManager = new UserPrivacyManager(this._core.NativeBridge.getPlatform(), this._core.Api, this._core.Config, this.Config, this._core.ClientInfo, this._core.DeviceInfo, this._core.RequestManager);

            this.PlacementManager = new PlacementManager(this.Api, this.Config);

            return this.PrivacyManager.getConsentAndUpdateConfiguration().catch(() => {
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

            const promo = new Promo(this._core, this, this._core.Purchasing, this._core.Analytics);
            const promoContentTypeHandlerMap = promo.getContentTypeHandlerMap();
            for(const contentType in promoContentTypeHandlerMap) {
                if(promoContentTypeHandlerMap.hasOwnProperty(contentType)) {
                    this.ContentTypeHandlerManager.addHandler(contentType, promoContentTypeHandlerMap[contentType]);
                }
            }

            this.Banners = new Banners(this._core, this);
            this.Monetization = new Monetization(this._core, this, promo, this._core.Purchasing);
            this.AR = new AR(this._core);

            if (this.SessionManager.getGameSessionId() % 1000 === 0) {
                Promise.all([
                    ARUtil.isARSupported(this.AR.Api),
                    PermissionsUtil.checkPermissionInManifest(this._core.NativeBridge.getPlatform(), this._core.Api, PermissionTypes.CAMERA),
                    PermissionsUtil.checkPermissions(this._core.NativeBridge.getPlatform(), this._core.Api, PermissionTypes.CAMERA)
                ]).then(([arSupported, permissionInManifest, permissionResult]) => {
                    Diagnostics.trigger('ar_device_support', {arSupported, permissionInManifest, permissionResult});
                }).catch((error) => {
                    Diagnostics.trigger('ar_device_support_check_error', error);
                });
            }

            const parserModules: AbstractParserModule[] = [
                new AdMob(this._core, this),
                new Display(this._core, this),
                new MRAID(this.AR.Api, this._core, this),
                new Performance(this.AR.Api, this._core, this),
                new VAST(this._core, this),
                new VPAID(this._core, this),
                new XPromo(this._core, this)
            ];

            parserModules.forEach(module => {
                const contentTypeHandlerMap = module.getContentTypeHandlerMap();
                for(const contentType in contentTypeHandlerMap) {
                    if(contentTypeHandlerMap.hasOwnProperty(contentType)) {
                        this.ContentTypeHandlerManager.addHandler(contentType, contentTypeHandlerMap[contentType]);
                    }
                }
            });

            this.CampaignManager = new CampaignManager(this._core.NativeBridge.getPlatform(), this._core.Api, this._core.Config, this.Config, this.AssetManager, this.SessionManager, this.AdMobSignalFactory, this._core.RequestManager, this._core.ClientInfo, this._core.DeviceInfo, this._core.MetaDataManager, this._core.CacheBookkeeping, this.ContentTypeHandlerManager, this._core.JaegerManager, this.BackupCampaignManager);
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
            return this.RefreshManager.refreshWithBackupCampaigns(this.BackupCampaignManager).then((resp) => {
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

    private isConsentShowRequired(): boolean {
        const gamePrivacy = this.Config.getGamePrivacy();
        const userPrivacy = this.Config.getUserPrivacy();

        if (!gamePrivacy.isEnabled() && gamePrivacy.getMethod() !== PrivacyMethod.UNITY_CONSENT) {
            return false;
        }

        if (!userPrivacy.isRecorded()) {
            return true;
        }

        const methodChangedSinceConsent = gamePrivacy.getMethod() !== userPrivacy.getMethod();
        const versionUpdatedSinceConsent = gamePrivacy.getVersion() > userPrivacy.getVersion();

        return methodChangedSinceConsent || versionUpdatedSinceConsent;
    }

    private showConsentIfNeeded(options: unknown): Promise<void> {
        if (!this.isConsentShowRequired()) {
            return Promise.resolve();
        }
        const consentView = new ConsentUnit({
            platform: this._core.NativeBridge.getPlatform(),
            privacyManager: this.PrivacyManager,
            adUnitContainer: this.Container,
            adsConfig: this.Config,
            core: this._core.Api
        });
        return consentView.show(options);
    }

    public show(placementId: string, options: unknown, callback: INativeCallback): void {
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

        if (campaign instanceof PromoCampaign && campaign.getRequiredAssets().length === 0) {
            this.showError(false, placementId, 'No creatives found for promo campaign');
            return;
        }

        if(campaign.isExpired()) {
            this.showError(true, placementId, 'Campaign has expired');
            this.RefreshManager.refresh();

            const error = new DiagnosticError(new Error('Campaign expired'), {
                id: campaign.getId(),
                willExpireAt: campaign.getWillExpireAt(),
                contentType: campaign.getContentType()
            });
            SessionDiagnostics.trigger('campaign_expired', error, campaign.getSession());
            return;
        }

        const trackingUrls = placement.getCurrentTrackingUrls();
        if(trackingUrls) {
            // Do not remove: Removing will currently break all tracking
            campaign.setTrackingUrls(trackingUrls);
        }

        if (placement.getRealtimeData() && !this.isConsentShowRequired()) {
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
            this.showConsentIfNeeded(options).then(() => {
                this.showAd(placement, campaign, options);
            });
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

    private showAd(placement: Placement, campaign: Campaign, options: unknown) {
        const testGroup = this._core.Config.getAbGroup();
        const start = Date.now();

        this._showing = true;

        if(this.Config.getCacheMode() !== CacheMode.DISABLED) {
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
            AbstractPrivacy.createBuildInformation(this._core.NativeBridge.getPlatform(), this._core.ClientInfo, this._core.DeviceInfo, campaign, this._core.Config);
            this._currentAdUnit = this.getAdUnitFactory(campaign).create(campaign, placement, orientation, playerMetadataServerId || '', options);
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
                    this._core.Api.Request.Android!.setMaximumPoolSize(8);
                } else {
                    this._core.Api.Request.setConcurrentRequestCount(8);
                }

                this.BackupCampaignManager.deleteBackupCampaigns();
            });
        });
    }

    private getAdUnitFactory(campaign: Campaign) {
        const contentType = campaign.getContentType();
        return this.ContentTypeHandlerManager.getFactory(contentType);
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
            this._core.Api.Request.Android!.setMaximumPoolSize(1);
        } else {
            this._core.Api.Request.setConcurrentRequestCount(1);
        }
    }

    private setupTestEnvironment(): void {
        if(TestEnvironment.get('serverUrl')) {
            ProgrammaticOperativeEventManager.setTestBaseUrl(TestEnvironment.get('serverUrl'));
            CampaignManager.setBaseUrl(TestEnvironment.get('serverUrl'));
            AuctionRequest.setBaseUrl(TestEnvironment.get('serverUrl'));
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
            NewVideoOverlay.setAutoSkip(TestEnvironment.get('autoSkip'));
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
            MRAIDAdUnitParametersFactory.setForcedExtendedMRAID(TestEnvironment.get('forcedPlayableMRAID'));
        }

        if(TestEnvironment.get('forcedGDPRBanner')) {
            AbstractAdUnitFactory.setForcedGDPRBanner(TestEnvironment.get('forcedGDPRBanner'));
        }

        let forcedARMRAID = false;
        if (TestEnvironment.get('forcedARMRAID')) {
            forcedARMRAID = TestEnvironment.get('forcedARMRAID');
            MRAIDAdUnitParametersFactory.setForcedARMRAID(forcedARMRAID);
        }

        if(TestEnvironment.get('creativeUrl')) {
            const creativeUrl = this._creativeUrl = TestEnvironment.get<string>('creativeUrl');
            let response: string = '';
            const platform = this._core.NativeBridge.getPlatform();
            if(platform === Platform.ANDROID) {
                response = CreativeUrlResponseAndroid.replace('{CREATIVE_URL_PLACEHOLDER}', creativeUrl);
            } else if(platform === Platform.IOS) {
                response = CreativeUrlResponseIos.replace('{CREATIVE_URL_PLACEHOLDER}', creativeUrl);
            }

            if (forcedARMRAID) {
                response = response.replace('{AD_TYPE_PLACEHOLDER}', 'MRAID_AR');
            } else {
                response = response.replace('{AD_TYPE_PLACEHOLDER}', 'MRAID');
            }

            CampaignManager.setCampaignResponse(response);
        }
    }
}
