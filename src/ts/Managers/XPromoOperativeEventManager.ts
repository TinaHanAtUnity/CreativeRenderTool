import { IOperativeEventManagerParams, OperativeEventManager } from 'Managers/OperativeEventManager';
import { Session } from 'Models/Session';
import { AdUnitStyle } from 'Models/AdUnitStyle';
import { Placement } from 'Models/Placement';
import { IXPromoCampaign, XPromoCampaign } from 'Models/Campaigns/XPromoCampaign';
import { HttpKafka } from 'Utilities/HttpKafka';

export class XPromoOperativeEventManager extends OperativeEventManager {
    private _xPromoCampaign: XPromoCampaign;

    constructor(params: IOperativeEventManagerParams<XPromoCampaign>) {
        super(params);

        this._xPromoCampaign = params.campaign;
    }

    public sendHttpKafkaEvent(kafkaType: string, eventType: string, placement: Placement, videoOrientation?: string) {
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

            HttpKafka.sendEvent(kafkaType, infoJson);
        };

        return this.createUniqueEventMetadata(placement, this._sessionManager.getGameSessionId(), this._gamerServerId, OperativeEventManager.getPreviousPlacementId(), videoOrientation).then(fulfilled);
    }
    protected getInfoJson(placement: Placement, eventId: string, gameSession: number, gamerSid?: string, previousPlacementId?: string, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<[string, any]> {
        return super.getInfoJson(placement, eventId, gameSession, gamerSid, previousPlacementId, videoOrientation, adUnitStyle).then(([id, infoJson]) => {
            const landscapeVideo = this._xPromoCampaign.getVideo();
            const portraitVideo = this._xPromoCampaign.getPortraitVideo();
            if(landscapeVideo && landscapeVideo.isCached()) {
                infoJson.cached = true;
                infoJson.cachedOrientation = 'landscape';
            } else if(portraitVideo && portraitVideo.isCached()) {
                infoJson.cached = true;
                infoJson.cachedOrientation = 'portrait';
            } else {
                infoJson.cached = false;
            }

            return <[string, any]>[id, infoJson];
        });
    }
}
