import { SdkStats } from 'Ads/Utilities/SdkStats';
import { Platform } from 'Core/Constants/Platform';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';
import { MediationMetaData } from 'Core/Models/MetaData/MediationMetaData';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Observable1, Observable3, Observable4 } from 'Core/Utilities/Observable';
import { Url } from 'Core/Utilities/Url';
import { TrackingIdentifierFilter } from 'Ads/Utilities/TrackingIdentifierFilter';
import { PARTNER_NAME, OM_JS_VERSION } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { StorageType } from 'Core/Native/Storage';
export class CampaignManager {
    constructor() {
        this.onCampaign = new Observable3();
        this.onNoFill = new Observable1();
        this.onError = new Observable4();
        this.onConnectivityError = new Observable1();
        this.onAdPlanReceived = new Observable3();
    }
    static setCampaignId(campaignId) {
        CampaignManager.CampaignId = campaignId;
    }
    static setSessionId(sessionId) {
        CampaignManager.SessionId = sessionId;
    }
    static setCountry(country) {
        CampaignManager.Country = country;
    }
    static setCampaignResponse(campaignResponse) {
        CampaignManager.CampaignResponse = campaignResponse;
    }
    static setBaseUrl(baseUrl) {
        CampaignManager.BaseUrl = baseUrl + '/v4/games';
        CampaignManager.AuctionV5BaseUrl = baseUrl + '/v5/games';
        CampaignManager.TestModeUrl = baseUrl + '/v4/test/games';
    }
    setPreviousPlacementId(id) {
        this._previousPlacementId = id;
    }
    getPreviousPlacementId() {
        return this._previousPlacementId;
    }
    static onlyRequest(request, requestUrl, requestBody, retries = 2) {
        const body = JSON.stringify(requestBody);
        return Promise.resolve().then(() => {
            if (CampaignManager.CampaignResponse !== undefined) {
                return Promise.resolve({
                    url: requestUrl,
                    response: CampaignManager.CampaignResponse,
                    responseCode: 200,
                    headers: []
                });
            }
            const headers = [];
            return request.post(requestUrl, body, headers, {
                retries: retries,
                retryDelay: 10000,
                followRedirects: false,
                retryWithConnectionEvents: false
            });
        });
    }
    static createRequestUrl(baseUrl, platform, clientInfo, deviceInfo, coreConfig, lastAuctionId, nofillRetry) {
        let url = baseUrl;
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
        }
        else if (platform === Platform.ANDROID && deviceInfo instanceof AndroidDeviceInfo) {
            url = Url.addParameters(url, {
                deviceMake: deviceInfo.getManufacturer(),
                screenSize: deviceInfo.getScreenLayout(),
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
    static createRequestBody(clientInfo, coreConfig, deviceInfo, userPrivacyManager, sessionManager, privacy, gameSessionCounters, fullyCachedCampaignIds, versionCode, adMobSignalFactory, freeSpace, metaDataManager, adsConfig, isLoadEnabled, previousPlacementId, requestPrivacy, legacyRequestPrivacy, nofillRetry, requestedPlacement, loadV5Support) {
        const placementRequest = {};
        const body = {
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
                }
                else {
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
    static getVersionCode(platform, core, clientInfo) {
        if (platform === Platform.ANDROID) {
            return core.DeviceInfo.Android.getPackageInfo(clientInfo.getApplicationName()).then(packageInfo => {
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
    static getFullyCachedCampaigns(core) {
        return core.Storage.getKeys(StorageType.PRIVATE, 'cache.campaigns', false).then((campaignKeys) => {
            return campaignKeys;
        }).catch(() => {
            return [];
        });
    }
}
CampaignManager.BaseUrl = 'https://auction.unityads.unity3d.com/v4/games';
CampaignManager.AuctionV5BaseUrl = 'https://auction.unityads.unity3d.com/v5/games';
CampaignManager.AuctionV6BaseUrl = 'https://auction.unityads.unity3d.com/v6/games';
CampaignManager.TestModeUrl = 'https://auction.unityads.unity3d.com/v4/test/games';
CampaignManager.AuctionV6TestBaseUrl = 'https://auction.unityads.unity3d.com/v6/test/games';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FtcGFpZ25NYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9NYW5hZ2Vycy9DYW1wYWlnbk1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBT0EsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2xELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUduRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUlsRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDM0UsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDM0UsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2xGLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUd6QyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUdsRixPQUFPLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBSXhGLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQU9sRCxNQUFNLE9BQWdCLGVBQWU7SUFBckM7UUF3Q29CLGVBQVUsR0FBRyxJQUFJLFdBQVcsRUFBdUQsQ0FBQztRQUNwRixhQUFRLEdBQUcsSUFBSSxXQUFXLEVBQVUsQ0FBQztRQUNyQyxZQUFPLEdBQUcsSUFBSSxXQUFXLEVBQWtELENBQUM7UUFDNUUsd0JBQW1CLEdBQUcsSUFBSSxXQUFXLEVBQVksQ0FBQztRQUNsRCxxQkFBZ0IsR0FBRyxJQUFJ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