import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign, ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { Session } from 'Ads/Models/Session';
import { IGameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { Platform } from 'Core/Constants/Platform';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { ABGroup } from 'Core/Models/ABGroup';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';
import { MediationMetaData } from 'Core/Models/MetaData/MediationMetaData';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Observable1, Observable3, Observable4 } from 'Core/Utilities/Observable';
import { Url } from 'Core/Utilities/Url';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { ILegacyRequestPrivacy, IRequestPrivacy } from 'Ads/Models/RequestPrivacy';
import { TrackingIdentifierFilter } from 'Ads/Utilities/TrackingIdentifierFilter';
import { GeneralTimingMetric } from 'Ads/Utilities/SDKMetrics';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { PARTNER_NAME, OM_JS_VERSION } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { createStopwatch } from 'Core/Utilities/Stopwatch';
import { ICoreApi } from 'Core/ICore';
import { StorageType } from 'Core/Native/Storage';

export interface ILoadedCampaign {
    campaign: Campaign;
    trackingUrls: ICampaignTrackingUrls;
}

export abstract class CampaignManager {

    public static setCampaignId(campaignId: string) {
        CampaignManager.CampaignId = campaignId;
    }

    public static setSessionId(sessionId: string) {
        CampaignManager.SessionId = sessionId;
    }

    public static setCountry(country: string) {
        CampaignManager.Country = country;
    }

    public static setCampaignResponse(campaignResponse: string) {
        CampaignManager.CampaignResponse = campaignResponse;
    }

    public static setBaseUrl(baseUrl: string): void {
        CampaignManager.BaseUrl = baseUrl + '/v4/games';
        CampaignManager.AuctionV5BaseUrl = baseUrl + '/v5/games';
        CampaignManager.TestModeUrl = baseUrl + '/v4/test/games';
    }

    protected static CampaignResponse: string | undefined;

    protected static AbGroup: ABGroup | undefined;

    protected static BaseUrl: string = 'https://auction.unityads.unity3d.com/v4/games';
    protected static AuctionV5BaseUrl: string = 'https://auction.unityads.unity3d.com/v5/games';
    protected static AuctionV6BaseUrl: string = 'https://auction.unityads.unity3d.com/v6/games';
    protected static TestModeUrl: string = 'https://auction.unityads.unity3d.com/v4/test/games';
    protected static AuctionV6TestBaseUrl: string = 'https://auction.unityads.unity3d.com/v6/test/games';

    protected static CampaignId: string | undefined;
    protected static SessionId: string | undefined;
    protected static Country: string | undefined;

    private _previousPlacementId: string | undefined;

    public readonly onCampaign = new Observable3<string, Campaign, ICampaignTrackingUrls | undefined>();
    public readonly onNoFill = new Observable1<string>();
    public readonly onError = new Observable4<unknown, string[], string, Session | undefined>();
    public readonly onConnectivityError = new Observable1<string[]>();
    public readonly onAdPlanReceived = new Observable3<number, number, number>();

    public abstract request(nofillRetry?: boolean): Promise<INativeResponse | void>;
    public abstract loadCampaign(placement: Placement): Promise<ILoadedCampaign | undefined>;

    public setPreviousPlacementId(id: string | undefined) {
        this._previousPlacementId = id;
    }

    public getPreviousPlacementId(): string | undefined {
        return this._previousPlacementId;
    }

    public static onlyRequest(request: RequestManager, requestUrl: string, requestBody: unknown, retries: number = 2): Promise<INativeResponse> {
        const body = JSON.stringify(requestBody);

        return Promise.resolve().then((): Promise<INativeResponse> => {
            if (CampaignManager.CampaignResponse !== undefined) {
                return Promise.resolve({
                    url: requestUrl,
                    response: CampaignManager.CampaignResponse,
                    responseCode: 200,
                    headers: []
                });
            }
            const headers: [string, string][] = [];
            return request.post(requestUrl, body, headers, {
                retries: retries,
                retryDelay: 10000,
                followRedirects: false,
                retryWithConnectionEvents: false
            });
        });
    }

    public static createRequestUrl(baseUrl: string, platform: Platform, clientInfo: ClientInfo, deviceInfo: DeviceInfo, coreConfig: CoreConfiguration, lastAuctionId?: string, nofillRetry?: boolean): Promise<string> {
        let url: string = baseUrl;

        const trackingIDs = TrackingIdentifierFilter.getDeviceTrackingIdentifiers(platform, deviceInfo);

        url = Url.addParameters(url, trackingIDs);

        if (nofillRetry && lastAuctionId) {
            url = Url.addParameters(url, {
                auctionId: lastAuctionId
            });
        }

        url = Url.addParameters(url, {
            deviceModel: deviceInfo.getModel(),
            platform: Platform[platform].toLowerCase(),
            sdkVersion: clientInfo.getSdkVersion(),
            stores: deviceInfo.getStores()
        });

        if (platform === Platform.IOS && deviceInfo instanceof IosDeviceInfo) {
            url = Url.addParameters(url, {
                osVersion: deviceInfo.getOsVersion(),
                screenScale: deviceInfo.getScreenScale()
            });
        } else if (platform === Platform.ANDROID && deviceInfo instanceof AndroidDeviceInfo) {
            url = Url.addParameters(url, {
                deviceMake: deviceInfo.getManufacturer(),
                screenSize:  deviceInfo.getScreenLayout(),
                screenDensity: deviceInfo.getScreenDensity(),
                apiLevel: deviceInfo.getApiLevel()
            });
        }

        if (coreConfig.getTestMode()) {
            url = Url.addParameters(url, { test: true });
        }

        if (CampaignManager.CampaignId) {
            url = Url.addParameters(url, {
                forceCampaignId: CampaignManager.CampaignId
            });
        }

        if (CampaignManager.SessionId) {
            url = Url.addParameters(url, {
                forceSessionId: CampaignManager.SessionId
            });
        }

        if (CampaignManager.AbGroup) {
            url = Url.addParameters(url, {
                forceAbGroup: CampaignManager.AbGroup
            });
        }

        if (CampaignManager.Country) {
            url = Url.addParameters(url, {
                force_country: CampaignManager.Country
            });
        }

        return Promise.all([
            deviceInfo.getScreenWidth(),
            deviceInfo.getScreenHeight(),
            deviceInfo.getConnectionType(),
            deviceInfo.getNetworkType()
        ]).then(([screenWidth, screenHeight, connectionType, networkType]) => {
            url = Url.addParameters(url, {
                screenWidth: screenWidth,
                screenHeight: screenHeight,
                connectionType: connectionType,
                networkType: networkType
            });
            return url;
        });
    }

    // todo: refactor requestedPlacement to something more sensible
    public static createRequestBody(clientInfo: ClientInfo, coreConfig: CoreConfiguration, deviceInfo: DeviceInfo, userPrivacyManager: UserPrivacyManager, sessionManager: SessionManager, privacy: PrivacySDK, gameSessionCounters: IGameSessionCounters | undefined, fullyCachedCampaignIds: string[] | undefined, versionCode: number | undefined, adMobSignalFactory: AdMobSignalFactory, freeSpace: number, metaDataManager: MetaDataManager, adsConfig: AdsConfiguration, isLoadEnabled: boolean, previousPlacementId?: string, requestPrivacy?: IRequestPrivacy, legacyRequestPrivacy?: ILegacyRequestPrivacy, nofillRetry?: boolean, requestedPlacement?: Placement, loadV5Support?: boolean): Promise<unknown> {
        const placementRequest: { [key: string]: unknown } = {};

        const body: { [key: string]: unknown } = {
            bundleVersion: clientInfo.getApplicationVersion(),
            bundleId: clientInfo.getApplicationName(),
            coppa: coreConfig.isCoppaCompliant(),
            language: deviceInfo.getLanguage(),
            gameSessionId: sessionManager.getGameSessionId(),
            timeZone: deviceInfo.getTimeZone(),
            simulator: deviceInfo instanceof IosDeviceInfo ? deviceInfo.isSimulator() : undefined,
            token: coreConfig.getToken(),
            legalFramework: privacy.getLegalFramework(),
            agreedOverAgeLimit: userPrivacyManager.getAgeGateChoice()
        };

        if (previousPlacementId) {
            body.previousPlacementId = previousPlacementId;
        }

        if (typeof navigator !== 'undefined' && navigator.userAgent && typeof navigator.userAgent === 'string') {
            body.webviewUa = navigator.userAgent;
        }

        if (nofillRetry) {
            body.nofillRetry = true;
        }

        return Promise.all([
            deviceInfo.getNetworkOperator(),
            deviceInfo.getNetworkOperatorName(),
            deviceInfo.getHeadset(),
            deviceInfo.getDeviceVolume(),
            adMobSignalFactory.getAdRequestSignal().then(signal => {
                return signal.getBase64ProtoBufNonEncoded();
            }),
            adMobSignalFactory.getOptionalSignal().then(signal => {
                return signal.getDTO();
            })
        ]).then(([networkOperator, networkOperatorName, headset, volume, requestSignal, optionalSignal]) => {
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

            return Promise.all([
                metaDataManager.fetch(MediationMetaData),
                metaDataManager.fetch(FrameworkMetaData)
            ]).then(([mediation, framework]) => {
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

                const placements = adsConfig.getPlacements();

                if (requestedPlacement) {
                    placementRequest[requestedPlacement.getId()] = {
                        adTypes: requestedPlacement.getAdTypes(),
                        allowSkip: requestedPlacement.allowSkip(),
                        auctionType: requestedPlacement.getAuctionType()
                    };
                } else {
                    Object.keys(placements).forEach((placementId) => {
                        const placement = placements[placementId];
                        if (!placement.isBannerPlacement()) {
                            placementRequest[placementId] = {
                                adTypes: placement.getAdTypes(),
                                allowSkip: placement.allowSkip(),
                                auctionType: placement.getAuctionType()
                            };
                        }
                    });
                }

                if (!legacyRequestPrivacy) {
                    Diagnostics.trigger('legacy_request_missing', {
                        userPrivacy: privacy.getUserPrivacy(),
                        gamePrivacy: privacy.getGamePrivacy()
                    });
                    legacyRequestPrivacy = {
                        gdprEnabled: privacy.isGDPREnabled(),
                        optOutEnabled: privacy.isOptOutEnabled(),
                        optOutRecorded: privacy.isOptOutRecorded()
                    };
                }

                body.placements = placementRequest;
                body.properties = coreConfig.getProperties();
                body.sessionDepth = SdkStats.getAdRequestOrdinal();
                body.projectId = coreConfig.getUnityProjectId();
                body.gameSessionCounters = gameSessionCounters;
                body.gdprEnabled = legacyRequestPrivacy.gdprEnabled;
                body.optOutEnabled = legacyRequestPrivacy.optOutEnabled;
                body.optOutRecorded = legacyRequestPrivacy.optOutRecorded;
                body.privacy = requestPrivacy;
                body.abGroup = coreConfig.getAbGroup();
                body.isLoadEnabled = isLoadEnabled;
                body.omidPartnerName = PARTNER_NAME;
                body.omidJSVersion = OM_JS_VERSION;

                const organizationId = coreConfig.getOrganizationId();
                if (organizationId) {
                    body.organizationId = organizationId;
                }

                const developerId = coreConfig.getDeveloperId();
                if (developerId) {
                    body.developerId = developerId;
                }

                if (loadV5Support) {
                    body.loadV5Support = loadV5Support;
                }

                if (deviceInfo instanceof IosDeviceInfo) {
                    body.plist = deviceInfo.getAdNetworksPlist();
                    body.idfv = deviceInfo.getVendorIdentifier();
                    body.deviceName = deviceInfo.getDeviceName();
                    body.locales = deviceInfo.getLocaleList();
                    body.currentUiTheme = deviceInfo.getCurrentUiTheme();
                    body.systemBootTime = deviceInfo.getSystemBootTime();
                    body.trackingAuthStatus = deviceInfo.getTrackingAuthorizationStatus();
                }

                return body;
            });
        });
    }

    public static getVersionCode(platform: Platform, core: ICoreApi, clientInfo: ClientInfo): Promise<number | undefined> {
        if (platform === Platform.ANDROID) {
            return core.DeviceInfo.Android!.getPackageInfo(clientInfo.getApplicationName()).then(packageInfo => {
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

    public static getFullyCachedCampaigns(core: ICoreApi): Promise<string[]> {
        return core.Storage.getKeys(StorageType.PRIVATE, 'cache.campaigns', false).then((campaignKeys) => {
            return campaignKeys;
        }).catch(() => {
            return [];
        });
    }
}
