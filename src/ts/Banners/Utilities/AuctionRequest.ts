import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Placement } from 'Ads/Models/Placement';
import { Session } from 'Ads/Models/Session';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { Platform } from 'Core/Constants/Platform';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';
import { MediationMetaData } from 'Core/Models/MetaData/MediationMetaData';
import { StorageType } from 'Core/Native/Storage';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { Url } from 'Core/Utilities/Url';
import { ICoreApi } from 'Core/ICore';

export interface IAuctionResponse {
    correlationId: string;
    auctionId: string;
    placements: { [placementID: string]: string };
    media: { [mediaID: string]: IPlacementMedia };
    realtimeData: { [placementID: string]: string };
}

export interface IPlacementMedia {
    contentType: string;
    content: string;
    cacheTTL: number;
    trackingUrls: { [eventName: string]: string[] };
    adType: string;
    campaignId: string | undefined;
    creativeId: string | undefined;
    seatId: number | undefined;
    appCategory: string | undefined;
    appSubCategory: string | undefined;
    advertiserCampaignId: string | undefined;
    advertiserDomain: string | undefined;
    advertiserBundleId: string | undefined;
    useWebViewUserAgentForTracking: boolean | undefined;
    buyerId: string | undefined;
}

export interface IAuctionRequestParams {
    platform: Platform;
    core: ICoreApi;
    coreConfig: CoreConfiguration;
    adsConfig: AdsConfiguration;
    adMobSignalFactory: AdMobSignalFactory;
    metaDataManager: MetaDataManager;
    request: RequestManager;
    clientInfo: ClientInfo;
    deviceInfo: DeviceInfo;
    sessionManager: SessionManager;
}

/**
 * Creates a request for an auction with the given placements.
 *
 * This object is not reusable, a request should be made once and then a new request object should be used, rather than
 * keeping a reference. See {@link AuctionRequestFactory} for creating Auction requests.
 */
export class AuctionRequest {

    public static create(params: IAuctionRequestParams) {
        return new AuctionRequest(params);
    }

    public static setAbGroup(abGroup: number) {
        AuctionRequest.AbGroup = abGroup;
    }

    public static setCampaignId(campaignId: string) {
        AuctionRequest.CampaignId = campaignId;
    }

    public static setCountry(country: string) {
        AuctionRequest.Country = country;
    }

    public static setCampaignResponse(campaignResponse: string) {
        AuctionRequest.CampaignResponse = campaignResponse;
    }

    public static setSessionId(sessionId: string): void {
        AuctionRequest.SessionId = sessionId;
    }

    public static setBaseUrl(baseUrl: string): void {
        AuctionRequest.BaseUrl = baseUrl + '/v4/games';
    }

    private static CampaignResponse: string;
    private static AbGroup: number | undefined;
    private static BaseUrl: string = 'https://auction.unityads.unity3d.com/v4/games';
    private static CampaignId: string | undefined;
    private static Country: string | undefined;
    private static SessionId: string | undefined;

    protected _platform: Platform;
    protected _core: ICoreApi;
    protected _response: INativeResponse;
    private _coreConfig: CoreConfiguration;
    private _adsConfig: AdsConfiguration;
    private _adMobSignalFactory: AdMobSignalFactory;
    private _metaDataManager: MetaDataManager;
    private _request: RequestManager;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _sessionManager: SessionManager;
    private _placements: { [id: string]: Placement } = {};
    private _previousPlacementID: string | undefined;
    private _noFillRetry: boolean;
    private _retryCount: number = 2;
    private _retryDelay: number = 10000;
    private _baseURL = AuctionRequest.BaseUrl;
    private _timeout: number | undefined;
    private _session: Session;
    private _url: string | null;
    private _body: any | null;
    private _headers: Array<[string, string]> = [];

    private _requestStart: number;
    private _requestDuration: number = 0;

    private _promise: Promise<IAuctionResponse>;

    constructor(params: IAuctionRequestParams) {
        this._platform = params.platform;
        this._core = params.core;
        this._coreConfig = params.coreConfig;
        this._adsConfig = params.adsConfig;
        this._request = params.request;
        this._clientInfo = params.clientInfo;
        this._deviceInfo = params.deviceInfo;
        this._metaDataManager = params.metaDataManager;
        this._adMobSignalFactory = params.adMobSignalFactory;
        this._sessionManager = params.sessionManager;
    }

    public request(): Promise<IAuctionResponse> {
        if (this._promise) {
            return this._promise;
        }
        const promises = [
            this.getRequestURL(),
            this.getRequestBody()
        ];
        this._promise = Promise.all(promises).then(([url, body]) => {
            this._url = url;
            this._requestStart = Date.now();
            if (AuctionRequest.CampaignResponse) {
                return this.getStaticResponse(url);
            }
            return this._request.post(url, JSON.stringify(body), this._headers, {
                retries: this._retryCount,
                retryDelay: this._retryDelay,
                followRedirects: false,
                retryWithConnectionEvents: false,
                timeout: this._timeout
            }).then((response) => {
                this._response = response;
                this._requestDuration = Date.now() - this._requestStart;
                return JSON.parse(response.response);
            });
        });
        return this._promise;
    }

    public getURL(): string | null {
        return this._url;
    }

    // Overrides the URL used in the request.
    public setURL(url: string) {
        this._url = url;
    }

    public getBody(): any | null {
        return this._body;
    }

    // Overrides the body used in the request.
    public setBody(body: any) {
        this._body = body;
    }

    public setNoFillRetry(nofillRetry: boolean) {
        this._noFillRetry = nofillRetry;
    }

    public setPreviousPlacementID(previousPlacementID: string | undefined) {
        this._previousPlacementID = previousPlacementID;
    }

    public setPlacements(placements: { [id: string]: Placement }) {
        this._placements = placements;
    }

    public setTimeout(timeout: number) {
        this._timeout = timeout;
    }

    public setSession(session: Session) {
        this._session = session;
    }

    public getRequestStartTime(): number {
        return this._requestStart;
    }

    public getRequestDuration(): number {
        return this._requestDuration;
    }

    public addPlacement(placement: Placement) {
        this._placements[placement.getId()] = placement;
    }

    public getNativeResponse(): INativeResponse {
        return this._response;
    }

    public addHeader([key, value]: [string, string]) {
        this._headers.push([key, value]);
    }

    public setBaseURL(url: string) {
        this._baseURL = url;
    }

    protected getRequestURL(): Promise<string> {
        if (this._url) {
            return Promise.resolve(this._url);
        }
        let url = this.getBaseURL();
        if (this._deviceInfo.getAdvertisingIdentifier()) {
            url = Url.addParameters(url, {
                advertisingTrackingId: this._deviceInfo.getAdvertisingIdentifier(),
                limitAdTracking: this._deviceInfo.getLimitAdTracking()
            });
        } else if (this._platform === Platform.ANDROID && this._deviceInfo instanceof AndroidDeviceInfo) {
            url = Url.addParameters(url, {
                androidId: this._deviceInfo.getAndroidId()
            });
        }

        url = Url.addParameters(url, {
            deviceModel: this._deviceInfo.getModel(),
            platform: Platform[this._platform].toLowerCase(),
            sdkVersion: this._clientInfo.getSdkVersion(),
            stores: this._deviceInfo.getStores()
        });

        if (this._session) {
            url = Url.addParameters(url, {
                auctionId: this._session.getId()
            });
        }

        if (this._platform === Platform.IOS && this._deviceInfo instanceof IosDeviceInfo) {
            url = Url.addParameters(url, {
                osVersion: this._deviceInfo.getOsVersion(),
                screenScale: this._deviceInfo.getScreenScale()
            });
        } else if (this._platform === Platform.ANDROID && this._deviceInfo instanceof AndroidDeviceInfo) {
            url = Url.addParameters(url, {
                deviceMake: this._deviceInfo.getManufacturer(),
                screenSize: this._deviceInfo.getScreenLayout(),
                screenDensity: this._deviceInfo.getScreenDensity(),
                apiLevel: this._deviceInfo.getApiLevel()
            });
        }

        if (this._coreConfig.getTestMode()) {
            url = Url.addParameters(url, { test: true });
        }

        if (AuctionRequest.SessionId) {
            url = Url.addParameters(url, {
                forceSessionId: AuctionRequest.SessionId
            });
}

        if (AuctionRequest.CampaignId) {
            url = Url.addParameters(url, {
                forceCampaignId: AuctionRequest.CampaignId
            });
        }

        if (AuctionRequest.AbGroup) {
            url = Url.addParameters(url, {
                forceAbGroup: AuctionRequest.AbGroup
            });
        }

        if (AuctionRequest.Country) {
            url = Url.addParameters(url, {
                force_country: AuctionRequest.Country
            });
        }

        const promises: Array<Promise<any>> = [];
        promises.push(this._deviceInfo.getScreenWidth());
        promises.push(this._deviceInfo.getScreenHeight());
        promises.push(this._deviceInfo.getConnectionType());
        promises.push(this._deviceInfo.getNetworkType());

        return Promise.all(promises).then(([screenWidth, screenHeight, connectionType, networkType]) => {
            url = Url.addParameters(url, {
                screenWidth: screenWidth,
                screenHeight: screenHeight,
                connectionType: connectionType,
                networkType: networkType
            });

            return url;
        });
    }

    protected createPlacementRequest(): any {
        const placementRequest: any = {};
        Object.keys(this._placements).forEach((placementId) => {
            const placement = this._placements[placementId];
            placementRequest[placementId] = this.createPlacementDTO(placement);
        });
        return placementRequest;
    }

    protected createPlacementDTO(placement: Placement): any {
        const dto: any = {
            adTypes: placement.getAdTypes(),
            allowSkip: placement.allowSkip()
        };

        if (placement.getRealtimeData()) {
            dto.realtimeData = placement.getRealtimeData();
        }
        return dto;
    }

    private getStaticResponse(url: string): Promise<INativeResponse> {
        return Promise.resolve({
            url: url,
            response: AuctionRequest.CampaignResponse,
            responseCode: 200,
            headers: []
        });
    }

    private getRequestBody(): Promise<any> {
        if (this._body) {
            return Promise.resolve(this._body);
        }
        const promises: Array<Promise<any>> = [];
        promises.push(this._deviceInfo.getFreeSpace());
        promises.push(this._deviceInfo.getNetworkOperator());
        promises.push(this._deviceInfo.getNetworkOperatorName());
        promises.push(this._deviceInfo.getHeadset());
        promises.push(this._deviceInfo.getDeviceVolume());
        promises.push(this.getFullyCachedCampaigns());
        promises.push(this.getVersionCode());
        promises.push(this._adMobSignalFactory.getAdRequestSignal().then(signal => {
            return signal.getBase64ProtoBufNonEncoded();
        }));
        promises.push(this._adMobSignalFactory.getOptionalSignal().then(signal => {
            return signal.getDTO();
        }));

        const body: any = {
            bundleVersion: this._clientInfo.getApplicationVersion(),
            bundleId: this._clientInfo.getApplicationName(),
            coppa: this._coreConfig.isCoppaCompliant(),
            language: this._deviceInfo.getLanguage(),
            gameSessionId: this._sessionManager.getGameSessionId(),
            timeZone: this._deviceInfo.getTimeZone(),
            simulator: this._deviceInfo instanceof IosDeviceInfo ? this._deviceInfo.isSimulator() : undefined,
            token: this._coreConfig.getToken()
        };

        if (this._previousPlacementID) {
            body.previousPlacementId = this._previousPlacementID;
        }

        if (typeof navigator !== 'undefined' && navigator.userAgent && typeof navigator.userAgent === 'string') {
            body.webviewUa = navigator.userAgent;
        }

        if (this._noFillRetry) {
            body.nofillRetry = true;
        }

        return Promise.all(promises).then(([freeSpace, networkOperator, networkOperatorName, headset, volume, fullyCachedCampaignIds, versionCode, requestSignal, optionalSignal]) => {
            body.deviceFreeSpace = freeSpace;
            body.networkOperator = networkOperator;
            body.networkOperatorName = networkOperatorName;
            body.wiredHeadset = headset;
            body.volume = volume;
            body.requestSignal = requestSignal;
            body.ext = optionalSignal;

            if (fullyCachedCampaignIds && fullyCachedCampaignIds.length > 0) {
                body.cachedCampaigns = fullyCachedCampaignIds;
            }

            if (versionCode) {
                body.versionCode = versionCode;
            }

            const metaDataPromises: Array<Promise<any>> = [];
            metaDataPromises.push(this._metaDataManager.fetch(MediationMetaData));
            metaDataPromises.push(this._metaDataManager.fetch(FrameworkMetaData));

            return Promise.all(metaDataPromises).then(([mediation, framework]) => {
                if (mediation) {
                    body.mediationName = mediation.getName();
                    body.mediationVersion = mediation.getVersion();
                    if (mediation.getOrdinal()) {
                        body.mediationOrdinal = mediation.getOrdinal();
                    }
                }

                if (framework) {
                    body.frameworkName = framework.getName();
                    body.frameworkVersion = framework.getVersion();
                }

                const placementRequest = this.createPlacementRequest();

                body.placements = placementRequest;
                body.properties = this._coreConfig.getProperties();
                body.sessionDepth = SdkStats.getAdRequestOrdinal();
                body.projectId = this._coreConfig.getUnityProjectId();
                body.gameSessionCounters = GameSessionCounters.getDTO();
                body.gdprEnabled = this._adsConfig.isGDPREnabled();
                body.optOutEnabled = this._adsConfig.isOptOutEnabled();
                body.optOutRecorded = this._adsConfig.isOptOutRecorded();

                const organizationId = this._coreConfig.getOrganizationId();
                if (organizationId) {
                    body.organizationId = organizationId;
                }

                return body;
            });
        });
    }

    private getFullyCachedCampaigns(): Promise<string[]> {
        return this._core.Storage.getKeys(StorageType.PRIVATE, 'cache.campaigns', false).then((campaignKeys) => {
            return campaignKeys;
        }).catch(() => {
            return [];
        });
    }

    private getVersionCode(): Promise<number | undefined> {
        if (this._platform === Platform.ANDROID) {
            return this._core.DeviceInfo.Android!.getPackageInfo(this._clientInfo.getApplicationName()).then(packageInfo => {
                if (packageInfo.versionCode) {
                    return packageInfo.versionCode;
                } else {
                    return undefined;
                }
            }).catch(() => {
                return undefined;
            });
        } else {
            return Promise.resolve(undefined);
        }
    }

    private getBaseURL(): string {
        return [
            this._baseURL,
            this._clientInfo.getGameId(),
            'requests'
        ].join('/');
    }
}
