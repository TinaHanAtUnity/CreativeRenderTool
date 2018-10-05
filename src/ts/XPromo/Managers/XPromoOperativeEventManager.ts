import {
    IOperativeEventManagerParams,
    IOperativeEventParams,
    OperativeEventManager
} from 'Ads/Managers/OperativeEventManager';
import { EventType } from 'Ads/Models/Session';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { PlayerMetaData } from 'Core/Models/MetaData/PlayerMetaData';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { INativeResponse } from 'Core/Managers/Request';
import { FailedXpromoOperativeEventManager } from 'XPromo/Managers/FailedXpromoOperativeEventManager';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';

export class XPromoOperativeEventManager extends OperativeEventManager {

    private _xPromoCampaign: XPromoCampaign;

    constructor(params: IOperativeEventManagerParams<XPromoCampaign>) {
        super(params);

        this._xPromoCampaign = params.campaign;
    }

    public sendStart(params: IOperativeEventParams): Promise<void> {
        const session = this._campaign.getSession();

        if(session.getEventSent(EventType.START)) {
            return Promise.resolve();
        }

        session.setEventSent(EventType.START);
        GameSessionCounters.addStart(this._xPromoCampaign);
        return this._metaDataManager.fetch(PlayerMetaData, false).then(player => {
            if(player) {
                this.setGamerServerId(player.getServerId());
            } else {
                this.setGamerServerId(undefined);
            }
            return this.sendHttpKafkaEvent('ads.xpromo.operative.videostart.v1.json', 'start', params);
        }).then(() => {
            return;
        });
    }

    public sendView(params: IOperativeEventParams): Promise<void> {
        const session = this._campaign.getSession();

        if(session.getEventSent(EventType.VIEW)) {
            return Promise.resolve(void(0));
        }
        session.setEventSent(EventType.VIEW);

        GameSessionCounters.addView(this._xPromoCampaign);

        return this.sendHttpKafkaEvent('ads.xpromo.operative.videoview.v1.json', 'view', params).then(() => {
            return;
        });
    }

    public sendClick(params: IOperativeEventParams): Promise<void> {
        const session = this._campaign.getSession();

        if(session.getEventSent(EventType.CLICK)) {
            return Promise.resolve(void(0));
        }
        session.setEventSent(EventType.CLICK);
        return this.sendHttpKafkaEvent('ads.xpromo.operative.videoclick.v1.json', 'click', params).then(() => {
            return;
        });
    }

    public sendHttpKafkaEvent(kafkaType: string, eventType: string, params: IOperativeEventParams): Promise<INativeResponse> {
        const fulfilled = ([id, infoJson]: [string, any]) => {

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
            infoJson.event_type = eventType;
            infoJson.sourceGameId = this._clientInfo.getGameId();
            infoJson.targetGameId = this._xPromoCampaign.getGameId().toString();
            infoJson.creativePackId = this._xPromoCampaign.getCreativeId();
            infoJson.targetStoreId = this._xPromoCampaign.getAppStoreId();

            return HttpKafka.sendEvent(kafkaType, KafkaCommonObjectType.PERSONAL, infoJson).catch(() => {
                const sessionId = this._campaign.getSession().getId();
                return this._nativeBridge.DeviceInfo.getUniqueEventId().then(eventId => {
                    new FailedXpromoOperativeEventManager(sessionId, eventId).storeFailedEvent(this._nativeBridge, {
                        kafkaType: kafkaType,
                        data: JSON.stringify(infoJson)
                    });
                    return Promise.resolve(<INativeResponse>{});
                });
            });
        };

        return this.createUniqueEventMetadata(params, this._sessionManager.getGameSessionId(), this._gamerServerId, OperativeEventManager.getPreviousPlacementId()).then(fulfilled);
    }

    protected createVideoEventUrl(type: string): string | undefined {
        return this._xPromoCampaign.getVideoEventUrl(type);
    }
}
