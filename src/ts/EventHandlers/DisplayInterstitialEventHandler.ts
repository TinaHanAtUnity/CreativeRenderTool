import { IDisplayInterstitialHandler } from 'Views/DisplayInterstitial';
import { NativeBridge } from 'Native/NativeBridge';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { DisplayInterstitialAdUnit, IDisplayInterstitialAdUnitParameters } from 'AdUnits/DisplayInterstitialAdUnit';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { Placement } from 'Models/Placement';
import { GameSessionCounters } from 'Utilities/GameSessionCounters';

export class DisplayInterstitialEventHandler implements IDisplayInterstitialHandler {
    private _nativeBridge: NativeBridge;
    private _operativeEventManager: OperativeEventManager;
    private _adUnit: DisplayInterstitialAdUnit;
    private _campaign: DisplayInterstitialCampaign;
    private _placement: Placement;

    constructor(nativeBridge: NativeBridge, adUnit: DisplayInterstitialAdUnit, parameters: IDisplayInterstitialAdUnitParameters) {
        this._nativeBridge = nativeBridge;
        this._operativeEventManager = parameters.operativeEventManager;
        this._adUnit = adUnit;
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
    }

    public onDisplayInterstitialClose(): void {
        this._operativeEventManager.sendThirdQuartile(this._placement);

        GameSessionCounters.addView(this._campaign);

        this._operativeEventManager.sendView(this._placement);
        this._adUnit.hide();
    }
}
