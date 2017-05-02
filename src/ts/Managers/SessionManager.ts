import { Session } from 'Models/Session';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { Url } from 'Utilities/Url';
import { EventManager } from 'Managers/EventManager';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { HttpKafka } from 'Utilities/HttpKafka';
// import { MetaDataManager } from 'Managers/MetaDataManager';

export class SessionManagerEventMetadataCreator {

    private _eventManager: EventManager;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _nativeBridge: NativeBridge;

    constructor(eventManager: EventManager, clientInfo: ClientInfo, deviceInfo: DeviceInfo, nativeBridge: NativeBridge) {
        this._eventManager = eventManager;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._nativeBridge = nativeBridge;
    }

    public createUniqueEventMetadata(adUnit: AbstractAdUnit, session: Session, gamerSid: string): Promise<[string, any]> {
        return this._eventManager.getUniqueEventId().then(id => {
            return this.getInfoJson(adUnit, id, session, gamerSid);
        });
    };

    private getInfoJson(adUnit: AbstractAdUnit, id: string, currentSession: Session, gamerSid: string): Promise<[string, any]> {
        const infoJson: any = {
            'eventId': id,
            'sessionId': currentSession.getId(),
            'gamerId': adUnit.getCampaign().getGamerId(),
            'campaignId': adUnit.getCampaign().getId(),
            'placementId': adUnit.getPlacement().getId(),
            'apiLevel': this._deviceInfo.getApiLevel(),
            'advertisingTrackingId': this._deviceInfo.getAdvertisingIdentifier(),
            'limitAdTracking': this._deviceInfo.getLimitAdTracking(),
            'osVersion': this._deviceInfo.getOsVersion(),
            'sid': gamerSid,
            'deviceMake': this._deviceInfo.getManufacturer(),
            'deviceModel': this._deviceInfo.getModel(),
            'sdkVersion': this._clientInfo.getSdkVersion()
        };

        const campaign = adUnit.getCampaign();
        if(campaign instanceof PerformanceCampaign) {
            infoJson.cached = campaign.getVideo().isCached();
        } else if(campaign instanceof VastCampaign) {
            infoJson.cached = campaign.getVideo().isCached();
        }

        if(typeof navigator !== 'undefined' && navigator.userAgent) {
            infoJson.webviewUa = navigator.userAgent;
        }

        const promises: Array<Promise<any>> = [];
        promises.push(this._deviceInfo.getNetworkType());
        promises.push(this._deviceInfo.getConnectionType());

        return Promise.all(promises).then(([networkType, connectionType]) => {
            infoJson.networkType = networkType;
            infoJson.connectionType = connectionType;

            const metaDataPromises: Array<Promise<any>> = [];
            // metaDataPromises.push(MetaDataManager.fetch(mediation(this._nativeBridge));
            // metaDataPromises.push(MetaDataManager.fetchFrameworkMetaData(this._nativeBridge));
            return Promise.all(metaDataPromises).then(([mediation, framework]) => {
                if(mediation) {
                    infoJson.mediationName = mediation.getName();
                    infoJson.mediationVersion = mediation.getVersion();
                    infoJson.mediationOrdinal = mediation.getOrdinal();
                }

                if(framework) {
                    infoJson.frameworkName = framework.getName();
                    infoJson.frameworkVersion = framework.getVersion();
                }

                return [id, infoJson];
            });
        });
}

}

export class SessionManager {

    public static setTestBaseUrl(baseUrl: string): void {
        SessionManager.VideoEventBaseUrl = baseUrl + '/mobile/gamers';
        SessionManager.ClickEventBaseUrl = baseUrl + '/mobile/campaigns';
    }

    private static VideoEventBaseUrl: string = 'https://adserver.unityads.unity3d.com/mobile/gamers';
    private static ClickEventBaseUrl: string = 'https://adserver.unityads.unity3d.com/mobile/campaigns';

    private _nativeBridge: NativeBridge;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _eventManager: EventManager;
    private _eventMetadataCreator: SessionManagerEventMetadataCreator;

    private _currentSession: Session;

    private _gamerServerId: string;

    constructor(nativeBridge: NativeBridge, clientInfo: ClientInfo, deviceInfo: DeviceInfo, eventManager: EventManager, eventMetadataCreator?: SessionManagerEventMetadataCreator) {
        this._nativeBridge = nativeBridge;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._eventManager = eventManager;
        this._eventMetadataCreator = eventMetadataCreator || new SessionManagerEventMetadataCreator(this._eventManager, this._clientInfo, this._deviceInfo, this._nativeBridge);
    }

    public create(): Promise<void[]> {
        return this._eventManager.getUniqueEventId().then(id => {
            this._currentSession = new Session(id);
            return this._eventManager.startNewSession(id);
        });
    }

    public getSession(): Session {
        return this._currentSession;
    }

    public setSession(session: Session) {
        this._currentSession = session;
    }

    public getEventManager() {
        return this._eventManager;
    }

    public getClientInfo() {
        return this._clientInfo;
    }

    public sendStart(adUnit: AbstractAdUnit): Promise<void> {
        if(this._currentSession) {
            if(this._currentSession.startSent) {
                return Promise.resolve(void(0));
            }
            this._currentSession.startSent = true;
        }

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this._eventManager.operativeEvent('start', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'video_start'), JSON.stringify(infoJson));
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerServerId).then(fulfilled);
    }

    public sendFirstQuartile(adUnit: AbstractAdUnit): Promise<void> {
        if(this._currentSession) {
            if(this._currentSession.firstQuartileSent) {
                return Promise.resolve(void(0));
            }
            this._currentSession.firstQuartileSent = true;
        }

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this._eventManager.operativeEvent('first_quartile', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'first_quartile'), JSON.stringify(infoJson));
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerServerId).then(fulfilled);
    }

    public sendMidpoint(adUnit: AbstractAdUnit): Promise<void> {
        if(this._currentSession) {
            if(this._currentSession.midpointSent) {
                return Promise.resolve(void(0));
            }
            this._currentSession.midpointSent = true;
        }

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this._eventManager.operativeEvent('midpoint', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'midpoint'), JSON.stringify(infoJson));
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerServerId).then(fulfilled);
    }

    public sendThirdQuartile(adUnit: AbstractAdUnit): Promise<void> {
        if(this._currentSession) {
            if (this._currentSession.thirdQuartileSent) {
                return Promise.resolve(void(0));
            }
            this._currentSession.thirdQuartileSent = true;
        }

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this._eventManager.operativeEvent('third_quartile', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'third_quartile'), JSON.stringify(infoJson));
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerServerId).then(fulfilled);
    }

    public sendSkip(adUnit: AbstractAdUnit, videoProgress?: number): Promise<void> {
        if(this._currentSession) {
            if(this._currentSession.skipSent) {
                return Promise.resolve(void(0));
            }
            this._currentSession.skipSent = true;
        }

        const fulfilled = ([id, infoJson]: [string, any]) => {
            if(videoProgress) {
                infoJson.skippedAt = videoProgress;
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

            infoJson.id = id;
            infoJson.ts = (new Date()).toISOString();

            HttpKafka.sendEvent('events.skip.json', infoJson);
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerServerId).then(fulfilled);
    }

    public sendView(adUnit: AbstractAdUnit): Promise<void> {
        if(this._currentSession) {
            if(this._currentSession.viewSent) {
                return Promise.resolve(void(0));
            }
            this._currentSession.viewSent = true;
        }

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this._eventManager.operativeEvent('view', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'video_end'), JSON.stringify(infoJson));
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerServerId).then(fulfilled);
    }

    public sendClick(adUnit: AbstractAdUnit): Promise<void> {
        const fulfilled = ([id, infoJson]: [string, any]) => {
            this._eventManager.operativeEvent('click', id, this._currentSession.getId(), this.createClickEventUrl(adUnit), JSON.stringify(infoJson));
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerServerId).then(fulfilled);
    }

    public setGamerServerId(serverId: string): void {
        this._gamerServerId = serverId;
    }

    private createVideoEventUrl(adUnit: AbstractAdUnit, type: string): string {
        const campaign = adUnit.getCampaign();
        return [
            SessionManager.VideoEventBaseUrl,
            campaign.getGamerId(),
            'video',
            type,
            campaign.getId(),
            this._clientInfo.getGameId()
        ].join('/');
    }

    private createClickEventUrl(adUnit: AbstractAdUnit): string {
        const campaign = adUnit.getCampaign();
        const url = [
            SessionManager.ClickEventBaseUrl,
            campaign.getId(),
            'click',
            campaign.getGamerId(),
        ].join('/');
        return Url.addParameters(url, {
            gameId: this._clientInfo.getGameId(),
            redirect: false
        });
    }

}
