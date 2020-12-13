import { FailedOperativeEventManager } from 'Ads/Managers/FailedOperativeEventManager';
import { EventType } from 'Ads/Models/Session';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { SessionUtils } from 'Ads/Utilities/SessionUtils';
import { Platform } from 'Core/Constants/Platform';
import { RequestManager } from 'Core/Managers/RequestManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';
import { MediationMetaData } from 'Core/Models/MetaData/MediationMetaData';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { TrackingIdentifierFilter } from 'Ads/Utilities/TrackingIdentifierFilter';
import { PrivacyMethod } from 'Privacy/Privacy';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
export class OperativeEventManager {
    static getEventKey(sessionId, eventId) {
        return SessionUtils.getSessionStorageKey(sessionId) + '.operative.' + eventId;
    }
    static getUrlKey(sessionId, eventId) {
        return OperativeEventManager.getEventKey(sessionId, eventId) + '.url';
    }
    static getDataKey(sessionId, eventId) {
        return OperativeEventManager.getEventKey(sessionId, eventId) + '.data';
    }
    static setPreviousPlacementId(id) {
        OperativeEventManager.PreviousPlacementId = id;
    }
    static getPreviousPlacementId() {
        return OperativeEventManager.PreviousPlacementId;
    }
    constructor(params) {
        this._storageBridge = params.storageBridge;
        this._metaDataManager = params.metaDataManager;
        this._sessionManager = params.sessionManager;
        this._clientInfo = params.clientInfo;
        this._deviceInfo = params.deviceInfo;
        this._request = params.request;
        this._coreConfig = params.coreConfig;
        this._adsConfig = params.adsConfig;
        this._campaign = params.campaign;
        this._platform = params.platform;
        this._core = params.core;
        this._ads = params.ads;
        this._playerMetadataServerId = params.playerMetadataServerId;
        this._privacySDK = params.privacySDK;
        this._userPrivacyManager = params.userPrivacyManager;
        this._loadV5Support = params.loadV5Support || false;
    }
    sendStart(params) {
        const session = this._campaign.getSession();
        if (session.getEventSent(EventType.START)) {
            return Promise.resolve();
        }
        session.setEventSent(EventType.START);
        GameSessionCounters.addStart(this._campaign);
        return this._metaDataManager.fetch(MediationMetaData, true, ['ordinal']).then(() => {
            return this.createUniqueEventMetadata(params, this._sessionManager.getGameSessionId(), OperativeEventManager.getPreviousPlacementId());
        }).then(([id, infoJson]) => {
            return this.sendEvent('start', id, session.getId(), this.createVideoEventUrl('video_start'), JSON.stringify(infoJson));
        }).then(() => {
            return;
        });
    }
    sendFirstQuartile(params) {
        const session = this._campaign.getSession();
        if (session.getEventSent(EventType.FIRST_QUARTILE)) {
            return Promise.resolve(void (0));
        }
        session.setEventSent(EventType.FIRST_QUARTILE);
        const fulfilled = ([id, infoJson]) => {
            this.sendEvent('first_quartile', id, session.getId(), this.createVideoEventUrl('first_quartile'), JSON.stringify(infoJson));
        };
        return this.createUniqueEventMetadata(params, this._sessionManager.getGameSessionId(), OperativeEventManager.getPreviousPlacementId()).then(fulfilled);
    }
    sendMidpoint(params) {
        const session = this._campaign.getSession();
        if (session.getEventSent(EventType.MIDPOINT)) {
            return Promise.resolve(void (0));
        }
        session.setEventSent(EventType.MIDPOINT);
        const fulfilled = ([id, infoJson]) => {
            this.sendEvent('midpoint', id, session.getId(), this.createVideoEventUrl('midpoint'), JSON.stringify(infoJson));
        };
        return this.createUniqueEventMetadata(params, this._sessionManager.getGameSessionId(), OperativeEventManager.getPreviousPlacementId()).then(fulfilled);
    }
    sendThirdQuartile(params) {
        const session = this._campaign.getSession();
        if (session.getEventSent(EventType.THIRD_QUARTILE)) {
            return Promise.resolve(void (0));
        }
        session.setEventSent(EventType.THIRD_QUARTILE);
        const fulfilled = ([id, infoJson]) => {
            this.sendEvent('third_quartile', id, session.getId(), this.createVideoEventUrl('third_quartile'), JSON.stringify(infoJson));
        };
        return this.createUniqueEventMetadata(params, this._sessionManager.getGameSessionId(), OperativeEventManager.getPreviousPlacementId()).then(fulfilled);
    }
    sendSkip(params) {
        const session = this._campaign.getSession();
        if (session.getEventSent(EventType.SKIP)) {
            return Promise.resolve(void (0));
        }
        session.setEventSent(EventType.SKIP);
        const fulfilled = ([id, infoJson]) => {
            if (params.videoProgress) {
                infoJson.skippedAt = params.videoProgress;
            }
            // todo: clears duplicate data for httpkafka, should be cleaned up
            delete infoJson.eventId;
            delete infoJson.apiLevel;
            delete infoJson.advertisingTrackingId;
            delete infoJson.limitAdTracking;
            delete infoJson.osVersion;
            delete infoJson.sid;
            delete infoJson.deviceMake;
            delete infoJson.deviceModel;
            delete infoJson.sdkVersion;
            delete infoJson.webviewUa;
            delete infoJson.networkType;
            delete infoJson.connectionType;
            // drop game session counters from skip event payload
            delete infoJson.gameSessionCounters;
            HttpKafka.sendEvent('ads.sdk2.events.skip.json', KafkaCommonObjectType.ANONYMOUS, Object.assign({ id: id, ts: (new Date()).toISOString() }, infoJson));
        };
        return this.createUniqueEventMetadata(params, this._sessionManager.getGameSessionId(), OperativeEventManager.getPreviousPlacementId()).then(fulfilled);
    }
    sendView(params) {
        const session = this._campaign.getSession();
        if (session.getEventSent(EventType.VIEW)) {
            return Promise.resolve(void (0));
        }
        session.setEventSent(EventType.VIEW);
        GameSessionCounters.addView(this._campaign);
        const fulfilled = ([id, infoJson]) => {
            this.sendEvent('view', id, session.getId(), this.createVideoEventUrl('video_end'), JSON.stringify(infoJson));
        };
        return this.createUniqueEventMetadata(params, this._sessionManager.getGameSessionId(), OperativeEventManager.getPreviousPlacementId()).then(fulfilled);
    }
    sendClick(params) {
        const session = this._campaign.getSession();
        if (session.getEventSent(EventType.CLICK)) {
            return Promise.resolve(void (0));
        }
        session.setEventSent(EventType.CLICK);
        const fulfilled = ([id, infoJson]) => {
            this.sendEvent('click', id, session.getId(), this.createClickEventUrl(), JSON.stringify(infoJson));
        };
        return this.createUniqueEventMetadata(params, this._sessionManager.getGameSessionId(), OperativeEventManager.getPreviousPlacementId()).then(fulfilled);
    }
    getClientInfo() {
        return this._clientInfo;
    }
    sendEvent(event, eventId, sessionId, url, data) {
        if (!url) {
            return Promise.resolve();
        }
        this._core.Sdk.logInfo('Unity Ads event: sending ' + event + ' event to ' + url);
        return this._request.post(url, data, [], {
            retries: 2,
            retryDelay: 10000,
            followRedirects: false,
            retryWithConnectionEvents: false
        }).catch((error) => {
            if (CustomFeatures.sampleAtGivenPercent(10)) {
                const diagnosticData = {
                    request: error.nativeRequest,
                    event: event,
                    sessionId: sessionId,
                    url: url,
                    response: error,
                    data: data,
                    campaignId: this._campaign.getId(),
                    creativeId: this._campaign.getCreativeId(),
                    seatId: this._campaign.getSeatId(),
                    auctionProtocol: RequestManager.getAuctionProtocol()
                };
                Diagnostics.trigger('operative_event_manager_failed_post', diagnosticData);
            }
            new FailedOperativeEventManager(this._core, sessionId, eventId).storeFailedEvent(this._storageBridge, {
                url: url,
                data: data
            });
        });
    }
    createVideoEventUrl(type) {
        Diagnostics.trigger('operative_event_manager_url_error', {
            message: 'Trying to use video-event url generation from base operative event manager',
            eventType: type
        });
        return undefined;
    }
    createClickEventUrl() {
        Diagnostics.trigger('operative_event_manager_url_error', {
            message: 'Trying to use click-event url generation from base operative event manager'
        });
        return undefined;
    }
    createUniqueEventMetadata(params, gameSession, previousPlacementId) {
        return this._core.DeviceInfo.getUniqueEventId().then(id => {
            return this.getInfoJson(params, id, gameSession, previousPlacementId);
        });
    }
    getInfoJson(params, eventId, gameSession, previousPlacementId) {
        const session = this._campaign.getSession();
        return Promise.all([
            this._deviceInfo.getNetworkType(),
            this._deviceInfo.getConnectionType(),
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight(),
            this._metaDataManager.fetch(MediationMetaData),
            this._metaDataManager.fetch(FrameworkMetaData)
        ]).then(([networkType, connectionType, screenWidth, screenHeight, mediation, framework]) => {
            let legacyRequestPrivacy = session.getLegacyPrivacy();
            if (!legacyRequestPrivacy) {
                Diagnostics.trigger('legacy_request_missing', {
                    userPrivacy: this._privacySDK.getUserPrivacy(),
                    gamePrivacy: this._privacySDK.getGamePrivacy()
                });
                legacyRequestPrivacy = {
                    gdprEnabled: this._privacySDK.isGDPREnabled(),
                    optOutEnabled: this._privacySDK.isOptOutEnabled(),
                    optOutRecorded: this._privacySDK.isOptOutRecorded()
                };
            }
            let infoJson = {
                'eventId': eventId,
                'auctionId': session.getId(),
                'gameSessionId': gameSession,
                'campaignId': this._campaign.getId(),
                'adType': this._campaign.getAdType(),
                'correlationId': this._campaign.getCorrelationId(),
                'seatId': this._campaign.getSeatId(),
                'placementId': params.placement.getId(),
                'osVersion': this._deviceInfo.getOsVersion(),
                'sid': this._playerMetadataServerId,
                'deviceModel': this._deviceInfo.getModel(),
                'sdkVersion': this._clientInfo.getSdkVersion(),
                'previousPlacementId': previousPlacementId,
                'bundleId': this._clientInfo.getApplicationName(),
                'meta': this._campaign.getMeta(),
                'platform': Platform[this._platform].toLowerCase(),
                'language': this._deviceInfo.getLanguage(),
                'cached': CampaignAssetInfo.isCached(this._campaign),
                'cachedOrientation': CampaignAssetInfo.getCachedVideoOrientation(this._campaign),
                'token': this._coreConfig.getToken(),
                'gdprEnabled': legacyRequestPrivacy.gdprEnabled,
                'optOutEnabled': legacyRequestPrivacy.optOutEnabled,
                'optOutRecorded': legacyRequestPrivacy.optOutRecorded,
                'privacy': session.getPrivacy(),
                'gameSessionCounters': session.getGameSessionCounters(),
                'networkType': networkType,
                'connectionType': connectionType,
                'screenWidth': screenWidth,
                'screenHeight': screenHeight,
                'deviceFreeSpace': session.getDeviceFreeSpace(),
                'isLoadEnabled': this._campaign.isLoadEnabled(),
                'legalFramework': this._privacySDK.getLegalFramework(),
                'agreedOverAgeLimit': this._userPrivacyManager.getAgeGateChoice(),
                'loadV5Support': this._loadV5Support
            };
            if (this._platform === Platform.ANDROID && this._deviceInfo instanceof AndroidDeviceInfo) {
                infoJson = Object.assign({}, infoJson, { 'apiLevel': this._deviceInfo.getApiLevel(), 'deviceMake': this._deviceInfo.getManufacturer(), 'screenDensity': this._deviceInfo.getScreenDensity(), 'screenSize': this._deviceInfo.getScreenLayout() });
            }
            if (this._platform === Platform.IOS && this._deviceInfo instanceof IosDeviceInfo) {
                infoJson = Object.assign({}, infoJson, { plist: this._deviceInfo.getAdNetworksPlist(), idfv: this._deviceInfo.getVendorIdentifier(), deviceName: this._deviceInfo.getDeviceName(), locales: this._deviceInfo.getLocaleList(), currentUiTheme: this._deviceInfo.getCurrentUiTheme(), systemBootTime: this._deviceInfo.getSystemBootTime(), trackingAuthStatus: this._deviceInfo.getTrackingAuthorizationStatus() });
            }
            const privacyMethod = this._privacySDK.getUserPrivacy().getMethod();
            if (privacyMethod === PrivacyMethod.LEGITIMATE_INTEREST || privacyMethod === PrivacyMethod.DEVELOPER_CONSENT) {
                infoJson.privacyType = privacyMethod;
            }
            const trackingIDs = TrackingIdentifierFilter.getDeviceTrackingIdentifiers(this._platform, this._deviceInfo);
            Object.assign(infoJson, trackingIDs);
            infoJson.videoOrientation = params.videoOrientation;
            if (typeof navigator !== 'undefined' && navigator.userAgent) {
                infoJson.webviewUa = navigator.userAgent;
            }
            if (params.adUnitStyle) {
                infoJson.adUnitStyle = params.adUnitStyle.getDTO();
            }
            if (mediation) {
                infoJson.mediationName = mediation.getName();
                infoJson.mediationVersion = mediation.getVersion();
                infoJson.mediationOrdinal = mediation.getOrdinal();
            }
            if (framework) {
                infoJson.frameworkName = framework.getName();
                infoJson.frameworkVersion = framework.getVersion();
            }
            return [eventId, infoJson];
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3BlcmF0aXZlRXZlbnRNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9NYW5hZ2Vycy9PcGVyYXRpdmVFdmVudE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFRdkYsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxtQkFBbUIsRUFBd0IsTUFBTSxtQ0FBbUMsQ0FBQztBQUM5RixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDMUQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBR25ELE9BQU8sRUFBbUIsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDL0UsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFJbEUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDM0UsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDM0UsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxTQUFTLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUU1RSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUQsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDbEYsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBR2hELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQThGMUQsTUFBTSxPQUFPLHFCQUFxQjtJ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