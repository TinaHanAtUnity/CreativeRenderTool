import { Campaign } from 'Ads/Models/Campaign';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { Placement } from 'Ads/Models/Placement';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi, ICore } from 'Core/ICore';
import { IAdsApi, IAds } from 'Ads/IAds';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { FocusManager } from 'Core/Managers/FocusManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IThirdPartyEventManagerFactory, ThirdPartyEventMacro } from 'Ads/Managers/ThirdPartyEventManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { Privacy } from 'Ads/Views/Privacy';
import { PrivacyEventHandler, IPrivacyEventHandlerParameters } from 'Ads/EventHandlers/PrivacyEventHandler';
import { Video } from 'Ads/Models/Assets/Video';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { WebViewError } from 'Core/Errors/WebViewError';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { PrivacySettings } from 'Ads/Views/Consent/PrivacySettings';
import { PrivacyMethod } from 'Ads/Models/Privacy';
import { IStoreApi } from 'Store/IStore';

export interface IAbstractAdUnitParametersFactory<T1 extends Campaign, T2 extends IAdUnitParameters<T1>> {
    create(campaign: T1, placement: Placement, orientation: Orientation, playerMetadataServerId: string, options: unknown): T2;
}

export abstract class AbstractAdUnitParametersFactory<T1 extends Campaign, T2 extends IAdUnitParameters<T1>> implements IAbstractAdUnitParametersFactory<T1, T2> {
    private static _forceGDPRBanner: boolean;
    private static _forcedConsentUnit: boolean;

    protected _campaign: T1;
    protected _placement: Placement;
    protected _orientation: Orientation;

    private _platform: Platform;
    private _core: ICoreApi;
    private _ads: IAdsApi;
    private _store: IStoreApi;
    private _focusManager: FocusManager;
    private _container: AdUnitContainer;
    private _deviceInfo: DeviceInfo;
    private _clientInfo: ClientInfo;
    private _requestManager: RequestManager;
    private _metadataManager: MetaDataManager;
    private _adsConfig: AdsConfiguration;
    private _thirdPartyEventManagerFactory: IThirdPartyEventManagerFactory;
    private _coreConfig: CoreConfiguration;
    private _sessionManager: SessionManager;
    private _privacyManager: UserPrivacyManager;
    private _programmaticTrackingService: ProgrammaticTrackingService;
    private _storageBridge: StorageBridge;

    private _playerMetadataServerId: string;
    private _options: unknown;

    public static setForcedGDPRBanner(value: boolean) {
        AbstractAdUnitParametersFactory._forceGDPRBanner = value;
    }

    public static setForcedConsentUnit(value: boolean) {
        AbstractAdUnitParametersFactory._forcedConsentUnit = value;
    }

    constructor(core: ICore, ads: IAds) {
        this._platform = core.NativeBridge.getPlatform();
        this._core = core.Api;
        this._ads = ads.Api;
        this._store = core.Store.Api;
        this._focusManager = core.FocusManager;
        this._container = ads.Container;
        this._deviceInfo = core.DeviceInfo;
        this._clientInfo = core.ClientInfo;
        this._requestManager = core.RequestManager;
        this._metadataManager = core.MetaDataManager;
        this._adsConfig = ads.Config;
        this._coreConfig = core.Config;
        this._sessionManager = ads.SessionManager;
        this._privacyManager = ads.PrivacyManager;
        this._programmaticTrackingService = ads.ProgrammaticTrackingService;
        this._thirdPartyEventManagerFactory = ads.ThirdPartyEventManagerFactory;
        this._storageBridge = core.StorageBridge;
    }

    public create(campaign: T1, placement: Placement, orientation: Orientation, playerMetadataServerId: string, options: unknown): T2 {
        this._campaign = campaign;
        this._placement = placement;
        this._orientation = orientation;
        this._options = options;
        this._playerMetadataServerId = playerMetadataServerId;
        const defaultParams = this.getBaseParameters();
        return this.createParameters(defaultParams);
    }

    protected abstract createParameters(baseParams: IAdUnitParameters<T1>): T2;

    protected getBaseParameters(): IAdUnitParameters<T1> {
        return {
            platform: this._platform,
            core: this._core,
            ads: this._ads,
            store: this._store,
            forceOrientation: this._orientation,
            focusManager: this._focusManager,
            container: this._container,
            deviceInfo: this._deviceInfo,
            clientInfo: this._clientInfo,
            thirdPartyEventManager: this._thirdPartyEventManagerFactory.create({
                [ThirdPartyEventMacro.ZONE]: this._placement.getId(),
                [ThirdPartyEventMacro.SDK_VERSION]: this._clientInfo.getSdkVersion().toString(),
                [ThirdPartyEventMacro.GAMER_SID]: this._playerMetadataServerId || ''
            }),
            operativeEventManager: this.getOperativeEventManager(),
            placement: this._placement,
            campaign: this._campaign,
            coreConfig: this._coreConfig,
            adsConfig: this._adsConfig,
            request: this._requestManager,
            privacyManager: this._privacyManager,
            programmaticTrackingService: this._programmaticTrackingService,
            gameSessionId: this._sessionManager.getGameSessionId(),
            options: this._options,
            privacy: this.createPrivacy()
        };
    }

    protected getOperativeEventManager(): OperativeEventManager {
        return OperativeEventManagerFactory.createOperativeEventManager({
            platform: this._platform,
            core: this._core,
            ads: this._ads,
            request: this._requestManager,
            metaDataManager: this._metadataManager,
            sessionManager: this._sessionManager,
            clientInfo: this._clientInfo,
            deviceInfo: this._deviceInfo,
            coreConfig: this._coreConfig,
            adsConfig: this._adsConfig,
            storageBridge: this._storageBridge,
            campaign: this._campaign,
            playerMetadataServerId: this._playerMetadataServerId
        });
    }

    protected createPrivacy(): AbstractPrivacy {
        let privacy: AbstractPrivacy;

        if (this._adsConfig.getGamePrivacy().isEnabled() || AbstractAdUnitParametersFactory._forcedConsentUnit) {
            privacy = new PrivacySettings(this._platform, this._campaign, this._privacyManager, this._adsConfig.isGDPREnabled(), this._coreConfig.isCoppaCompliant());
        } else {
            privacy = new Privacy(this._platform, this._campaign, this._privacyManager, this._adsConfig.isGDPREnabled(), this._coreConfig.isCoppaCompliant());
        }

        const privacyEventHandlerParameters: IPrivacyEventHandlerParameters = {
            platform: this._platform,
            core: this._core,
            privacyManager: this._privacyManager,
            adsConfig: this._adsConfig
        };

        const privacyEventHandler = new PrivacyEventHandler(privacyEventHandlerParameters);

        privacy.addEventHandler(privacyEventHandler);
        return privacy;
    }

    protected showGDPRBanner(parameters: IAdUnitParameters<Campaign>): boolean {
        if (AbstractAdUnitParametersFactory._forceGDPRBanner) {
            return true;
        }

        if (PrivacyMethod.LEGITIMATE_INTEREST !== parameters.adsConfig.getGamePrivacy().getMethod()) {
            return false;
        }

        return parameters.adsConfig.isGDPREnabled() ? !parameters.adsConfig.isOptOutRecorded() : false;
    }

    protected getVideo(campaign: Campaign, forceOrientation: Orientation): Video {
        const video = CampaignAssetInfo.getOrientedVideo(campaign, forceOrientation);
        if(!video) {
            throw new WebViewError('Unable to select an oriented video');
        }
        return video;
    }

    protected createEndScreenParameters(privacy: AbstractPrivacy, targetGameName: string | undefined, parameters: IAdUnitParameters<Campaign>): IEndScreenParameters {
        const showGDPRBanner = this.showGDPRBanner(parameters);
        return {
            platform: parameters.platform,
            core: parameters.core,
            language: parameters.deviceInfo.getLanguage(),
            gameId: parameters.clientInfo.getGameId(),
            targetGameName: targetGameName,
            abGroup: parameters.coreConfig.getAbGroup(),
            privacy: privacy,
            showGDPRBanner: showGDPRBanner,
            adUnitStyle: undefined,
            campaignId: undefined,
            osVersion: undefined
        };
    }
    protected createOverlay(parameters: IAdUnitParameters<Campaign>, privacy: AbstractPrivacy, showPrivacyDuringVideo: boolean): AbstractVideoOverlay {

        const overlay = new VideoOverlay(parameters, privacy, this.showGDPRBanner(parameters), showPrivacyDuringVideo);

        if (parameters.placement.disableVideoControlsFade()) {
            overlay.setFadeEnabled(false);
        }

        return overlay;
    }
}
