import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { EventType } from 'Ads/Models/Session';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { FailedXpromoOperativeEventManager } from 'XPromo/Managers/FailedXpromoOperativeEventManager';
import { Promises } from 'Core/Utilities/Promises';
export class XPromoOperativeEventManager extends OperativeEventManager {
    constructor(params) {
        super(params);
        this._xPromoCampaign = params.campaign;
    }
    sendStart(params) {
        const session = this._campaign.getSession();
        if (session.getEventSent(EventType.START)) {
            return Promise.resolve();
        }
        session.setEventSent(EventType.START);
        GameSessionCounters.addStart(this._xPromoCampaign);
        return Promises.voidResult(this.sendHttpKafkaEvent('ads.xpromo.operative.videostart.v1.json', 'start', params));
    }
    sendView(params) {
        const session = this._campaign.getSession();
        if (session.getEventSent(EventType.VIEW)) {
            return Promise.resolve(void (0));
        }
        session.setEventSent(EventType.VIEW);
        GameSessionCounters.addView(this._xPromoCampaign);
        return this.sendHttpKafkaEvent('ads.xpromo.operative.videoview.v1.json', 'view', params).then(() => {
            return;
        });
    }
    sendClick(params) {
        const session = this._campaign.getSession();
        if (session.getEventSent(EventType.CLICK)) {
            return Promise.resolve(void (0));
        }
        session.setEventSent(EventType.CLICK);
        return this.sendHttpKafkaEvent('ads.xpromo.operative.videoclick.v1.json', 'click', params).then(() => {
            return;
        });
    }
    sendHttpKafkaEvent(kafkaType, eventType, params) {
        const fulfilled = ([id, infoJson]) => {
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
            return HttpKafka.sendEvent(kafkaType, KafkaCommonObjectType.PERSONAL, Object.assign({}, infoJson, { id: id, ts: (new Date()).toISOString(), event_type: eventType, sourceGameId: this._clientInfo.getGameId(), targetGameId: this._xPromoCampaign.getGameId().toString(), creativePackId: this._xPromoCampaign.getCreativeId(), targetStoreId: this._xPromoCampaign.getAppStoreId() })).catch(() => {
                const sessionId = this._campaign.getSession().getId();
                return this._core.DeviceInfo.getUniqueEventId().then(eventId => {
                    new FailedXpromoOperativeEventManager(this._core, sessionId, eventId).storeFailedEvent(this._storageBridge, {
                        kafkaType: kafkaType,
                        data: JSON.stringify(infoJson)
                    });
                    return Promise.resolve({});
                });
            });
        };
        return this.createUniqueEventMetadata(params, this._sessionManager.getGameSessionId(), OperativeEventManager.getPreviousPlacementId()).then(fulfilled);
    }
    createVideoEventUrl(type) {
        return this._xPromoCampaign.getVideoEventUrl(type);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWFByb21vT3BlcmF0aXZlRXZlbnRNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1hQcm9tby9NYW5hZ2Vycy9YUHJvbW9PcGVyYXRpdmVFdmVudE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUlILHFCQUFxQixFQUN4QixNQUFNLG9DQUFvQyxDQUFDO0FBQzVDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUd4RSxPQUFPLEVBQUUsU0FBUyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDNUUsT0FBTyxFQUFFLGlDQUFpQyxFQUFFLE1BQU0sbURBQW1ELENBQUM7QUFFdEcsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE1BQU0sT0FBTywyQkFBNEIsU0FBUSxxQkFBcUI7SUFJbEUsWUFBWSxNQUFvRDtRQUM1RCxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFZCxJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDM0MsQ0FBQztJQUVNLFNBQVMsQ0FBQyxNQUE2QjtRQUMxQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRTVDLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDdkMsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDNUI7UUFFRCxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0QyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ25ELE9BQU8sUUFBUSxDQUFDLFVBQVUsQ0FBQyxJ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