import { IDisplayInterstitialHandler } from 'Views/DisplayInterstitial';
import { NativeBridge } from 'Native/NativeBridge';
import { IOperativeEventParams, OperativeEventManager } from 'Managers/OperativeEventManager';
import { DisplayInterstitialAdUnit, IDisplayInterstitialAdUnitParameters } from 'AdUnits/DisplayInterstitialAdUnit';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { Placement } from 'Models/Placement';
import { GDPREventHandler } from 'EventHandlers/GDPREventHandler';

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
