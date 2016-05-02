import { Session } from 'Models/Session';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { Url } from 'Utilities/Url';
import { EventManager } from 'EventManager';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';
import { INativeResponse } from 'Utilities/Request';

export class SessionManager {

    private static VideoEventBaseUrl = 'https://adserver.unityads.unity3d.com/mobile/gamers';
    private static ClickEventBaseUrl = 'https://adserver.unityads.unity3d.com/mobile/campaigns';

    private _nativeBridge: NativeBridge;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _eventManager: EventManager;

    private _currentSession: Session;

    private _gamerSid: string;

    constructor(nativeBridge: NativeBridge, clientInfo: ClientInfo, deviceInfo: DeviceInfo, eventManager: EventManager) {
        this._nativeBridge = nativeBridge;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._eventManager = eventManager;
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

    public sendShow(adUnit: AbstractAdUnit): void {
        this._eventManager.getUniqueEventId().then(id => {
            return this.getInfoJson(adUnit, id);
        }).then(([id, infoJson]) => {
            this._eventManager.operativeEvent('show', id, this._currentSession.getId(), this.createShowEventUrl(adUnit), JSON.stringify(infoJson));
            this.sendVastImpressionEvent(adUnit);
            this.sendVastTrackingEvent(adUnit, 'creativeView');
        });
    }

    public sendStart(adUnit: AbstractAdUnit): void {
        this._eventManager.getUniqueEventId().then(id => {
            return this.getInfoJson(adUnit, id);
        }).then(([id, infoJson]) => {
            this._eventManager.operativeEvent('start', id, this._currentSession.getId(), this.createVideoEventUrl(adUnit, 'video_start'), JSON.stringify(infoJson));
            this.sendVastTrackingEvent(adUnit, 'start');
        });
    }

    public sendProgress(adUnit: AbstractAdUnit, position: number, oldPosition: number): void {
        this.sendVastQuartileEvent(adUnit, position, oldPosition, 1);
        this.sendVastQuartileEvent(adUnit, position, oldPosition, 2);
        this.sendVastQuartileEvent(adUnit, position, oldPosition, 3);
    }

    public sendSkip(adUnit: AbstractAdUnit, videoProgress?: number): void {
        this._eventManager.getUniqueEventId().then(id => {
            return this.getInfoJson(adUnit, id);
        }).then(([id, infoJson]) => {
            if(videoProgress) {
                infoJson.skippedAt = videoProgress;
            }
            this._eventManager.operativeEvent('skip', id, this._currentSession.getId(), this.createVideoEventUrl(adUnit, 'video_skip'), JSON.stringify(infoJson));
        });
    }

    public sendView(adUnit: AbstractAdUnit): void {
        this._eventManager.getUniqueEventId().then(id => {
            return this.getInfoJson(adUnit, id);
        }).then(([id, infoJson]) => {
            this._eventManager.operativeEvent('view', id, this._currentSession.getId(), this.createVideoEventUrl(adUnit, 'video_end'), JSON.stringify(infoJson));
            this.sendVastTrackingEvent(adUnit, 'complete');
        });
    }

    public sendClick(adUnit: AbstractAdUnit): Promise<INativeResponse> {
        let campaign = adUnit.getCampaign();

        this._eventManager.getUniqueEventId().then(id => {
            return this.getInfoJson(adUnit, id);
        }).then(([id, infoJson]) => {
            this._eventManager.operativeEvent('click', id, this._currentSession.getId(), this.createClickEventUrl(adUnit), JSON.stringify(infoJson));
        });

        return this._eventManager.clickAttributionEvent(this._currentSession.getId(), campaign.getClickAttributionUrl(), campaign.getClickAttributionUrlFollowsRedirects());
    }

    public sendMute(adUnit: AbstractAdUnit, muted: boolean): void {
        if (muted) {
            this.sendVastTrackingEvent(adUnit, 'mute');
        } else {
            this.sendVastTrackingEvent(adUnit, 'unmute');
        }
    }

    public setGamerSid(sid: string): void {
        this._gamerSid = sid;
    }

    private createShowEventUrl(adUnit: AbstractAdUnit): string {
        return [
            SessionManager.VideoEventBaseUrl,
            adUnit.getGamerId(),
            'show',
            adUnit.getCampaignId(),
            this._clientInfo.getGameId()
        ].join('/');
    }

    private createVideoEventUrl(adUnit: AbstractAdUnit, type: string): string {
        return [
            SessionManager.VideoEventBaseUrl,
            adUnit.getGamerId(),
            'video',
            type,
            adUnit.getCampaignId(),
            this._clientInfo.getGameId()
        ].join('/');
    }

    private createClickEventUrl(adUnit: AbstractAdUnit): string {
        let url = [
            SessionManager.ClickEventBaseUrl,
            adUnit.getCampaignId(),
            'click',
            adUnit.getGamerId(),
        ].join('/');
        return Url.addParameters(url, {
            gameId: this._clientInfo.getGameId(),
            redirect: false
        });
    }

    private getInfoJson(adUnit: AbstractAdUnit, id: string): Promise<[string, any]> {
        let infoJson: any = {
            'eventId': id,
            'sessionId': this._currentSession.getId(),
            'gamer_id': adUnit.getGamerId(),
            'campaign_id': adUnit.getCampaignId(),
            'placementId': adUnit.getPlacement().getId(),
            'apiLevel': this._deviceInfo.getApiLevel(),
            'networkType': this._deviceInfo.getNetworkType(),
            'cached': true,
            'advertisingId': this._deviceInfo.getAdvertisingIdentifier(),
            'trackingEnabled': this._deviceInfo.getLimitAdTracking(),
            'osVersion': this._deviceInfo.getOsVersion(),
            'connectionType': this._deviceInfo.getConnectionType(),
            'sid': this._gamerSid,
            'deviceMake': this._deviceInfo.getManufacturer(),
            'deviceModel': this._deviceInfo.getModel()
        };

        return MediationMetaData.fetch(this._nativeBridge).then(mediation => {
            if(mediation) {
                infoJson.mediationName = mediation.getName();
                infoJson.mediationVersion = mediation.getVersion();
                infoJson.mediationOrdinal = mediation.getOrdinal();
            }
            return [id, infoJson];
        });
    }

    private sendVastImpressionEvent(adUnit) {
        if (adUnit.getCampaign().getVast() && adUnit.getCampaign().getVast().getImpressionUrls()) {
            for (let impressionUrl of adUnit.getCampaign().getVast().getImpressionUrls()) {
                this._eventManager.thirdPartyEvent('vast impression', this._currentSession.getId(), impressionUrl);
            }
        }
    };

    private sendVastTrackingEvent(adUnit: AbstractAdUnit, eventName: string) {
        if (adUnit.getCampaign().getVast() && adUnit.getCampaign().getVast().getTrackingEventUrls(eventName)) {
            for (let startUrl of adUnit.getCampaign().getVast().getTrackingEventUrls(eventName)) {
                this._eventManager.thirdPartyEvent(`vast ${eventName}`, this._currentSession.getId(), startUrl);
            }
        }
    }

    private sendVastQuartileEvent(adUnit: AbstractAdUnit, position: number, oldPosition: number, quartile: number) {
        let quartileEventName: string;
        if (quartile === 1) {
            quartileEventName = 'firstQuartile';
        }
        if (quartile === 2) {
            quartileEventName = 'midpoint';
        }
        if (quartile === 3) {
            quartileEventName = 'thirdQuartile';
        }
        if (adUnit.getCampaign().getVast() && adUnit.getCampaign().getVast().getTrackingEventUrls(quartileEventName)) {
            let duration = adUnit.getCampaign().getVast().getDuration();
            if (duration > 0 && position / 1000 > duration * 0.25 * quartile && oldPosition / 1000 < duration * 0.25 * quartile) {
                for (let quartileUrl of adUnit.getCampaign().getVast().getTrackingEventUrls(quartileEventName)) {
                    this._eventManager.thirdPartyEvent(`vast ${quartileEventName}`, this._currentSession.getId(), quartileUrl);
                }
            }
        }
    }

}
