import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
export class DisplayInterstitialEventHandler extends GDPREventHandler {
    constructor(adUnit, parameters) {
        super(parameters.privacyManager, parameters.coreConfig, parameters.adsConfig, parameters.privacySDK);
        this._operativeEventManager = parameters.operativeEventManager;
        this._adUnit = adUnit;
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
    }
    onDisplayInterstitialClose() {
        const params = {
            placement: this._placement
        };
        this._operativeEventManager.sendThirdQuartile(params);
        this._operativeEventManager.sendView(params);
        // Temporary for PTS Migration Investigation
        this._adUnit.sendTrackingEvent(TrackingEvent.THIRD_QUARTILE);
        this._adUnit.sendTrackingEvent(TrackingEvent.COMPLETE);
        this._adUnit.hide();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzcGxheUludGVyc3RpdGlhbEV2ZW50SGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9EaXNwbGF5L0V2ZW50SGFuZGxlcnMvRGlzcGxheUludGVyc3RpdGlhbEV2ZW50SGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQVN0RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFFcEUsTUFBTSxPQUFPLCtCQUFnQyxTQUFRLGdCQUFnQjtJQU1qRSxZQUFZLE1BQWlDLEVBQUUsVUFBZ0Q7UUFDM0YsS0FBSyxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsVUFBVSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyRyxJQUFJLENBQUMsc0JBQXNCLEdBQUcsVUFBVSxDQUFDLHFCQUFxQixDQUFDO1FBQy9ELElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUNyQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUM7SUFDM0MsQ0FBQztJQUVNLDBCQUEwQjtRQUM3QixNQUFNLE1BQU0sR0FBMEI7WUFDbEMsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVO1NBQzdCLENBQUM7UUFDRixJQUFJLENBQUMsc0JBQXNCLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUU3Qyw0Q0FBNEM7UUFDNUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN4QixDQUFDO0NBQ0oifQ==