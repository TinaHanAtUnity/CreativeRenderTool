import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { Placement } from 'Ads/Models/Placement';
import { IDisplayInterstitialHandler } from 'Display/Views/DisplayInterstitial';
import { NativeBridge } from 'Common/Native/NativeBridge';
import {
    DisplayInterstitialAdUnit,
    IDisplayInterstitialAdUnitParameters
} from 'Display/AdUnits/DisplayInterstitialAdUnit';
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';

export class DisplayInterstitialEventHandler extends GDPREventHandler implements IDisplayInterstitialHandler {
    private _nativeBridge: NativeBridge;
    private _operativeEventManager: OperativeEventManager;
    private _adUnit: DisplayInterstitialAdUnit;
    private _campaign: DisplayInterstitialCampaign;
    private _placement: Placement;

    constructor(nativeBridge: NativeBridge, adUnit: DisplayInterstitialAdUnit, parameters: IDisplayInterstitialAdUnitParameters) {
        super(parameters.gdprManager, parameters.configuration);
        this._nativeBridge = nativeBridge;
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
        this._adUnit.hide();
    }
}
