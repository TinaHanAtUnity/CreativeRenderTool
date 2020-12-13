import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { Platform } from 'Core/Constants/Platform';
import { RequestManager, AuctionProtocol } from 'Core/Managers/RequestManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';
import { MediationMetaData } from 'Core/Models/MetaData/MediationMetaData';
import { StorageType } from 'Core/Native/Storage';
import { Url } from 'Core/Utilities/Url';
import { TrackingIdentifierFilter } from 'Ads/Utilities/TrackingIdentifierFilter';
import { RequestPrivacyFactory } from 'Ads/Models/RequestPrivacy';
import { PARTNER_NAME, OM_JS_VERSION } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { SDKMetrics, ChinaAucionEndpoint } from 'Ads/Utilities/SDKMetrics';
/**
 * Creates a request for an auction with the given placements.
 *
 * This object is not reusable, a request should be made once and then a new request object should be used, rather than
 * keeping a reference. See {@link AuctionRequestFactory} for creating Auction requests.
 */
export class AuctionRequest {
    constructor(params) {
        this._useChinaAuctionEndpoint = false;
        this._placements = {};
        this._retryCount = 2;
        this._retryDelay = 10000;
        this._headers = [];
        this._requestDuration = 0;
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
        this._privacy = RequestPrivacyFactory.create(params.privacySDK, this._deviceInfo.getLimitAdTracking());
        this._privacySDK = params.privacySDK;
        this._userPrivacyManager = params.userPrivacyManager;
        this._useChinaAuctionEndpoint = (params.coreConfig.getCountry() === 'CN');
        this.assignBaseUrl();
    }
    static create(params) {
        return new AuctionRequest(params);
    }
    static setAbGroup(abGroup) {
        AuctionRequest.AbGroup = abGroup;
    }
    static setCampaignId(campaignId) {
        AuctionRequest.CampaignId = campaignId;
    }
    static setCountry(country) {
        AuctionRequest.Country = country;
    }
    static setCampaignResponse(campaignResponse) {
        AuctionRequest.CampaignResponse = campaignResponse;
    }
    static setSessionId(sessionId) {
        AuctionRequest.SessionId = sessionId;
    }
    static setBaseUrl(baseUrl) {
        AuctionRequest.BaseUrl = baseUrl + '/v4/games';
        AuctionRequest.AuctionV5BaseUrl = baseUrl + '/v5/games';
    }
    request() {
        if (this._promise) {
            return this._promise;
        }
        this._promise = Promise.all([
            this.getRequestURL(),
            this.getRequestBody()
        ]).then(([url, body]) => {
            this._url = url;
            this._requestStart = Date.now();
            if (AuctionRequest.CampaignResponse) {
                return this.getStaticResponse(url);
            }
            if (this._useChinaAuctionEndpoint) {
                SDKMetrics.reportMetricEvent(ChinaAucionEndpoint.AuctionRequest);
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
                if (this._useChinaAuctionEndpoint) {
                    SDKMetrics.reportMetricEvent(ChinaAucionEndpoint.AuctionResponse);
                }
                return JSON.parse(response.response);
            });
        });
        return this._promise;
    }
    getURL() {
        return this._url;
    }
    // Overrides the URL used in the request.
    setURL(url) {
        this._url = url;
    }
    getBody() {
        return this._body;
    }
    // Overrides the body used in the request.
    setBody(body) {
        this._body = body;
    }
    setNoFillRetry(nofillRetry) {
        this._noFillRetry = nofillRetry;
    }
    setPreviousPlacementID(previousPlacementID) {
        this._previousPlacementID = previousPlacementID;
    }
    setPlacements(placements) {
        this._placements = placements;
    }
    setTimeout(timeout) {
        this._timeout = timeout;
    }
    setSession(session) {
        this._session = session;
    }
    getRequestStartTime() {
        return this._requestStart;
    }
    getRequestDuration() {
        return this._requestDuration;
    }
    addPlacement(placement) {
        this._placements[placement.getId()] = placement;
    }
    getNativeResponse() {
        return this._response;
    }
    addHeader([key, value]) {
        this._headers.push([key, value]);
    }
    setBaseURL(url) {
        this._baseURL = url;
    }
    getRequestURL() {
        if (this._url) {
            return Promise.resolve(this._url);
        }
        let url = this.getBaseURL();
        if (this._useChinaAuctionEndpoint) {
            url = url.replace(/(.*auction\.unityads\.)(unity3d\.com)(.*)/, '$1unity.cn$3');
        }
        url = Url.addParameters(url, TrackingIdentifierFilter.getDeviceTrackingIdentifiers(this._platform, this._deviceInfo));
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
        }
        else if (this._platform === Platform.ANDROID && this._deviceInfo instanceof AndroidDeviceInfo) {
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
        const promises = [];
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
    createPlacementRequest() {
        const placementRequest = {};
        Object.keys(this._placements).forEach((placementId) => {
            const placement = this._placements[placementId];
            placementRequest[placementId] = this.createPlacementDTO(placement);
        });
        return placementRequest;
    }
    createPlacementDTO(placement) {
        return {
            adTypes: placement.getAdTypes(),
            allowSkip: placement.allowSkip()
        };
    }
    getStaticResponse(url) {
        return Promise.resolve({
            url: url,
            response: AuctionRequest.CampaignResponse,
            responseCode: 200,
            headers: []
        });
    }
    getRequestBody() {
        if (this._body) {
            return Promise.resolve(this._body);
        }
        return Promise.all([
            this._deviceInfo.getFreeSpace(),
            this._deviceInfo.getNetworkOperator(),
            this._deviceInfo.getNetworkOperatorName(),
            this._deviceInfo.getHeadset(),
            this._deviceInfo.getDeviceVolume(),
            this.getFullyCachedCampaigns(),
            this.getVersionCode(),
            this._adMobSignalFactory.getAdRequestSignal().then(signal => {
                return signal.getBase64ProtoBufNonEncoded();
            }),
            this._adMobSignalFactory.getOptionalSignal().then(signal => {
                return signal.getDTO();
            })
        ]).then(([freeSpace, networkOperator, networkOperatorName, headset, volume, fullyCachedCampaignIds, versionCode, requestSignal, optionalSignal]) => {
            return Promise.all([
                this._metaDataManager.fetch(MediationMetaData),
                this._metaDataManager.fetch(FrameworkMetaData)
            ]).then(([mediation, framework]) => {
                return {
                    bundleVersion: this._clientInfo.getApplicationVersion(),
                    bundleId: this._clientInfo.getApplicationName(),
                    coppa: this._coreConfig.isCoppaCompliant(),
                    language: this._deviceInfo.getLanguage(),
                    gameSessionId: this._sessionManager.getGameSessionId(),
                    timeZone: this._deviceInfo.getTimeZone(),
                    simulator: this._deviceInfo instanceof IosDeviceInfo ? this._deviceInfo.isSimulator() : undefined,
                    token: this._coreConfig.getToken(),
                    previousPlacementId: this._previousPlacementID ? this._previousPlacementID : undefined,
                    webviewUa: (typeof navigator !== 'undefined' && navigator.userAgent && typeof navigator.userAgent === 'string') ? navigator.userAgent : undefined,
                    nofillRetry: this._noFillRetry,
                    deviceFreeSpace: freeSpace,
                    networkOperator: networkOperator,
                    networkOperatorName: networkOperatorName,
                    wiredHeadset: headset,
                    volume: volume,
                    requestSignal: requestSignal,
                    ext: optionalSignal,
                    cachedCampaigns: (fullyCachedCampaignIds && fullyCachedCampaignIds.length > 0) ? fullyCachedCampaignIds : undefined,
                    versionCode: versionCode,
                    mediationName: mediation ? mediation.getName() : undefined,
                    mediationVersion: mediation ? mediation.getVersion() : undefined,
                    mediationOrdinal: mediation && mediation.getOrdinal() ? mediation.getOrdinal() : undefined,
                    frameworkName: framework ? framework.getName() : undefined,
                    frameworkVersion: framework ? framework.getVersion() : undefined,
                    placements: this.createPlacementRequest(),
                    properties: this._coreConfig.getProperties(),
                    sessionDepth: SdkStats.getAdRequestOrdinal(),
                    projectId: this._coreConfig.getUnityProjectId(),
                    gameSessionCounters: GameSessionCounters.getCurrentCounters(),
                    gdprEnabled: this._privacySDK.isGDPREnabled(),
                    optOutEnabled: this._privacySDK.isOptOutEnabled(),
                    optOutRecorded: this._privacySDK.isOptOutRecorded(),
                    privacy: this._privacy,
                    abGroup: this._coreConfig.getAbGroup(),
                    developerId: this._coreConfig.getDeveloperId(),
                    organizationId: this._coreConfig.getOrganizationId(),
                    isLoadEnabled: false,
                    omidPartnerName: PARTNER_NAME,
                    omidJSVersion: OM_JS_VERSION,
                    legalFramework: this._privacySDK.getLegalFramework(),
                    agreedOverAgeLimit: this._userPrivacyManager.getAgeGateChoice(),
                    plist: this._deviceInfo instanceof IosDeviceInfo ? this._deviceInfo.getAdNetworksPlist() : undefined,
                    idfv: this._deviceInfo instanceof IosDeviceInfo ? this._deviceInfo.getVendorIdentifier() : undefined,
                    deviceName: this._deviceInfo instanceof IosDeviceInfo ? this._deviceInfo.getDeviceName() : undefined,
                    locales: this._deviceInfo instanceof IosDeviceInfo ? this._deviceInfo.getLocaleList() : undefined,
                    currentUiTheme: this._deviceInfo instanceof IosDeviceInfo ? this._deviceInfo.getCurrentUiTheme() : undefined,
                    systemBootTime: this._deviceInfo instanceof IosDeviceInfo ? this._deviceInfo.getSystemBootTime() : undefined,
                    trackingAuthStatus: this._deviceInfo instanceof IosDeviceInfo ? this._deviceInfo.getTrackingAuthorizationStatus() : undefined
                };
            });
        });
    }
    getFullyCachedCampaigns() {
        return this._core.Storage.getKeys(StorageType.PRIVATE, 'cache.campaigns', false).then((campaignKeys) => {
            return campaignKeys;
        }).catch(() => {
            return [];
        });
    }
    getVersionCode() {
        if (this._platform === Platform.ANDROID) {
            return this._core.DeviceInfo.Android.getPackageInfo(this._clientInfo.getApplicationName()).then(packageInfo => {
                if (packageInfo.versionCode) {
                    return packageInfo.versionCode;
                }
                else {
                    return undefined;
                }
            }).catch(() => {
                return undefined;
            });
        }
        else {
            return Promise.resolve(undefined);
        }
    }
    assignBaseUrl() {
        if (this._coreConfig.getTestMode()) {
            this._baseURL = AuctionRequest.TestModeUrl;
            return;
        }
        switch (RequestManager.getAuctionProtocol()) {
            // TODO: Update banners to use Auction V6
            case AuctionProtocol.V6:
            case AuctionProtocol.V5:
                this._baseURL = AuctionRequest.AuctionV5BaseUrl;
                break;
            case AuctionProtocol.V4:
            default:
                this._baseURL = AuctionRequest.BaseUrl;
        }
    }
    getBaseURL() {
        return [
            this._baseURL,
            this._clientInfo.getGameId(),
            'requests'
        ].join('/');
    }
}
AuctionRequest.BaseUrl = 'https://auction.unityads.unity3d.com/v4/games';
AuctionRequest.AuctionV5BaseUrl = 'https://auction.unityads.unity3d.com/v5/games';
AuctionRequest.AuctionV6BaseUrl = 'https://auction.unityads.unity3d.com/v6/games';
AuctionRequest.TestModeUrl = 'https://auction.unityads.unity3d.com/v4/test/games';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXVjdGlvblJlcXVlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL05ldHdvcmtpbmcvQXVjdGlvblJlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBS0EsT0FBTyxFQUFFLG1CQUFtQixFQUF3QixNQUFNLG1DQUFtQyxDQUFDO0FBQzlGLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHbkQsT0FBTyxFQUFtQixjQUFjLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDaEcsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFJbEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDekMsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDbEYsT0FBTyxFQUFtQixxQkFBcUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBSW5GLE9BQU8sRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFFeEYsT0FBTyxFQUFFLFVBQVUsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBb0czRTs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxjQUFjO0lBeUV2QixZQUFZLE1BQTZCO1FBeEVqQyw2QkFBd0IsR0FBd0IsS0FBSyxDQUFDO1FBb0R0RCxnQkFBVyxHQUFnQyxF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