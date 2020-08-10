import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { Placement } from 'Ads/Models/Placement';
import {
    DisplayInterstitialAdUnit,
    IDisplayInterstitialAdUnitParameters
} from 'Display/AdUnits/DisplayInterstitialAdUnit';
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import { IDisplayInterstitialHandler } from 'Display/Views/DisplayInterstitial';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { EventType } from 'Ads/Models/Session';

export class DisplayInterstitialEventHandler extends GDPREventHandler implements IDisplayInterstitialHandler {
    private _operativeEventManager: OperativeEventManager;
    private _adUnit: DisplayInterstitialAdUnit;
    private _campaign: DisplayInterstitialCampaign;
    private _placement: Placement;

    constructor(adUnit: DisplayInterstitialAdUnit, parameters: IDisplayInterstitialAdUnitParameters) {
        super(parameters.privacyManager, parameters.coreConfig, parameters.adsConfig, parameters.privacySDK);
        this._operativeEventManager = parameters.operativeEventManager;
        this._adUnit = adUnit;
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
    }

    public onDisplayInterstitialClose(): void {
        const params: IOperativeEventParams = {
            placement: this._placement
        };
        this._operativeEventManager.sendThirdQuartile(params);
        this._operativeEventManager.sendView(params);

        // Temporary for PTS Migration Investigation
        if (!this._campaign.getSession().getEventSent(EventType.THIRD_QUARTILE)) {
            this._adUnit.sendTrackingEvent(TrackingEvent.THIRD_QUARTILE);
        }
        this._adUnit.sendTrackingEvent(TrackingEvent.COMPLETE);

        this._adUnit.hide();
    }
}
