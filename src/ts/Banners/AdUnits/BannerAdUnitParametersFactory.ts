import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IAdsApi } from 'Ads/IAds';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Placement } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { StorageBridge } from 'Core/Utilities/StorageBridge';

export class BannerAdUnitParametersFactory {

    private _platform: Platform;
    private _core: ICoreApi;
    private _ads: IAdsApi;
    private _request: RequestManager;
    private _metadataManager: MetaDataManager;
    private _coreConfig: CoreConfiguration;
    private _adsConfig: AdsConfiguration;
    private _container: AdUnitContainer;
    private _deviceInfo: DeviceInfo;
    private _clientInfo: ClientInfo;
    private _sessionManager: SessionManager;
    private _focusManager: FocusManager;
    private _adMobSignalFactory: AdMobSignalFactory;
    private _webPlayerContainer: WebPlayerContainer;
    private _gdprManager: GdprManager;
    private _programmaticTrackingService: ProgrammaticTrackingService;
    private _storageBridge: StorageBridge;
    private _analyticsManager: AnalyticsManager;

    constructor(platform: Platform, core: ICoreApi, ads: IAdsApi, request: RequestManager, metadataManager: MetaDataManager, coreConfig: CoreConfiguration, adsConfig: AdsConfiguration, container: AdUnitContainer, deviceInfo: DeviceInfo, clientInfo: ClientInfo, sessionManager: SessionManager, focusManager: FocusManager, analyticsManager: AnalyticsManager, adMobSignalFactory: AdMobSignalFactory, gdprManager: GdprManager, webPlayerContainer: WebPlayerContainer, programmaticTrackingService: ProgrammaticTrackingService, storageBridge: StorageBridge) {
        this._platform = platform;
        this._core = core;
        this._request = request;
        this._metadataManager = metadataManager;
        this._coreConfig = coreConfig;
        this._adsConfig = adsConfig;
        this._container = container;
        this._deviceInfo = deviceInfo;
        this._clientInfo = clientInfo;
        this._sessionManager = sessionManager;
        this._focusManager = focusManager;
        this._adMobSignalFactory = adMobSignalFactory;
        this._gdprManager = gdprManager;
        this._webPlayerContainer = webPlayerContainer;
        this._programmaticTrackingService = programmaticTrackingService;
        this._storageBridge = storageBridge;
        this._analyticsManager = analyticsManager;
    }

    public create(campaign: BannerCampaign, placement: Placement, options: any): Promise<IAdUnitParameters<BannerCampaign>> {
        return Promise.all([
            this.getDeviceOrientation()
        ]).then(([orientation]) => {
            return {
                platform: this._platform,
                core: this._core,
                ads: this._ads,
                forceOrientation: orientation,
                webPlayerContainer: this._webPlayerContainer,
                focusManager: this._focusManager,
                container: this._container,
                deviceInfo: this._deviceInfo,
                clientInfo: this._clientInfo,
                thirdPartyEventManager: new ThirdPartyEventManager(this._core, this._request, {
                    '%ZONE%': placement.getId(),
                    '%SDK_VERSION%': this._clientInfo.getSdkVersion().toString()
                }),
                operativeEventManager: OperativeEventManagerFactory.createOperativeEventManager({
                    request: this._request,
                    metaDataManager: this._metadataManager,
                    sessionManager: this._sessionManager,
                    clientInfo: this._clientInfo,
                    deviceInfo: this._deviceInfo,
                    coreConfig: this._coreConfig,
                    adsConfig: this._adsConfig,
                    platform: this._platform,
                    core: this._core,
                    ads: this._ads,
                    storageBridge: this._storageBridge,
                    campaign: campaign
                }),
                placement: placement,
                campaign: campaign,
                coreConfig: this._coreConfig,
                adsConfig: this._adsConfig,
                request: this._request,
                options: options,
                adMobSignalFactory: this._adMobSignalFactory,
                gdprManager: this._gdprManager,
                programmaticTrackingService: this._programmaticTrackingService
            };
        });
    }

    private getDeviceOrientation(): Promise<Orientation> {
        return Promise.all([
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight()
        ]).then(([width, height]) => width >= height ? Orientation.LANDSCAPE : Orientation.LANDSCAPE);
    }
}
