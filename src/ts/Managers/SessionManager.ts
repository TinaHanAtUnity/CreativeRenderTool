import { Session } from 'Models/Session';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { Url } from 'Utilities/Url';
import { EventManager } from 'EventManager';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';

export class SessionManager {

    private static VideoEventBaseUrl = 'https://adserver.unityads.unity3d.com/mobile/gamers';
    private static ClickEventBaseUrl = 'https://adserver.unityads.unity3d.com/mobile/campaigns';

    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _eventManager: EventManager;

    private _currentSession: Session;

    private _gamerSid: string;

    constructor(clientInfo: ClientInfo, deviceInfo: DeviceInfo, eventManager: EventManager) {
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._eventManager = eventManager;
    }

    public create(): Promise<void> {
        return this._eventManager.getUniqueEventId().then(id => {
            this._currentSession = new Session(id);
        });
    }

    public getSession(): Session {
        return this._currentSession;
    }

    public sendShow(adUnit: AbstractAdUnit): void {
        this._eventManager.getUniqueEventId().then(id => {
            this._eventManager.operativeEvent('show', id, this._currentSession.getId(), this.createShowEventUrl(adUnit), JSON.stringify(this.getInfoJson(adUnit, id)));
            this.sendVastImpressionEvent(adUnit);
            this.sendVastTrackingEvent(adUnit, 'creativeView');
        });
    }

    public sendStart(adUnit: AbstractAdUnit): void {
        this._eventManager.getUniqueEventId().then(id => {
            this._eventManager.operativeEvent('start', id, this._currentSession.getId(), this.createVideoEventUrl(adUnit, 'video_start'), JSON.stringify(this.getInfoJson(adUnit, id)));
            this.sendVastTrackingEvent(adUnit, 'start');
        });
    }

    public sendProgress(adUnit: AbstractAdUnit, position: number, oldPosition: number): void {
        this.sendVastQuartileEvent(adUnit, position, oldPosition, 1);
        this.sendVastQuartileEvent(adUnit, position, oldPosition, 2);
        this.sendVastQuartileEvent(adUnit, position, oldPosition, 3);
    }

    public sendSkip(adUnit: AbstractAdUnit): void {
        this._eventManager.getUniqueEventId().then(id => {
            this._eventManager.operativeEvent('skip', id, this._currentSession.getId(), this.createVideoEventUrl(adUnit, 'video_skip'), JSON.stringify(this.getInfoJson(adUnit, id)));
        });
    }

    public sendView(adUnit: AbstractAdUnit): void {
        this._eventManager.getUniqueEventId().then(id => {
            this._eventManager.operativeEvent('view', id, this._currentSession.getId(), this.createVideoEventUrl(adUnit, 'video_end'), JSON.stringify(this.getInfoJson(adUnit, id)));
            this.sendVastTrackingEvent(adUnit, 'complete');
        });
    }

    public sendClick(adUnit: AbstractAdUnit): void {
        let campaign = adUnit.getCampaign();
        if(campaign.getClickAttributionUrl()) {
            this._eventManager.thirdPartyEvent('click attribution', this._currentSession.getId(), campaign.getClickAttributionUrl());
        }

        this._eventManager.getUniqueEventId().then(id => {
            this._eventManager.operativeEvent('click', id, this._currentSession.getId(), this.createClickEventUrl(adUnit), JSON.stringify(this.getInfoJson(adUnit, id)));
        });
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

    private getInfoJson(adUnit: AbstractAdUnit, id: string): { [key: string]: any } {
        return {
            'uuid': id,
            'gamer_id': adUnit.getGamerId(),
            'campaign_id': adUnit.getCampaignId(),
            'placement_id': adUnit.getPlacement().getId(),
            'advertising_id': this._deviceInfo.getAdvertisingIdentifier(),
            'tracking_enabled': this._deviceInfo.getLimitAdTracking(),
            'os_version': this._deviceInfo.getOsVersion(),
            'connection_type': this._deviceInfo.getNetworkType(),
            'sid': this._gamerSid
        };
    }

    private sendVastImpressionEvent(adUnit) {
        if (adUnit.getVast() && adUnit.getVast().getImpressionUrls()) {
            for (let impressionUrl of adUnit.getVast().getImpressionUrls()) {
                this._eventManager.thirdPartyEvent('vast impression', this._currentSession.getId(), impressionUrl);
            }
        }
    };

    private sendVastTrackingEvent(adUnit: AbstractAdUnit, eventName: string) {
        if (adUnit.getVast() && adUnit.getVast().getTrackingEventUrls(eventName)) {
            for (let startUrl of adUnit.getVast().getTrackingEventUrls(eventName)) {
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
        if (adUnit.getVast() && adUnit.getVast().getTrackingEventUrls(quartileEventName)) {
            let duration = adUnit.getVast().getDuration();
            if (duration > 0 && position / 1000 > duration * 0.25 * quartile && oldPosition / 1000 < duration * 0.25 * quartile) {
                for (let quartileUrl of adUnit.getVast().getTrackingEventUrls(quartileEventName)) {
                    this._eventManager.thirdPartyEvent(`vast ${quartileEventName}`, this._currentSession.getId(), quartileUrl);
                }
            }
        }
    }

}
