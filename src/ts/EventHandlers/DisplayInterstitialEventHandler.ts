import { IDisplayInterstitialHandler } from 'Views/DisplayInterstitial';
import { NativeBridge } from 'Native/NativeBridge';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { DisplayInterstitialAdUnit, IDisplayInterstitialAdUnitParameters } from 'AdUnits/DisplayInterstitialAdUnit';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';

export class DisplayInterstitialEventHandler implements IDisplayInterstitialHandler {
    private _nativeBridge: NativeBridge;
    private _operativeEventManager: OperativeEventManager;
    private _adUnit: DisplayInterstitialAdUnit;
    private _campaign: DisplayInterstitialCampaign;

    constructor(nativeBridge: NativeBridge, adUnit: DisplayInterstitialAdUnit, parameters: IDisplayInterstitialAdUnitParameters) {
        this._nativeBridge = nativeBridge;
        this._operativeEventManager = parameters.operativeEventManager;
        this._adUnit = adUnit;
        this._campaign = parameters.campaign;
    }

    public onDisplayInterstitialClick(url: string): void {
        this._adUnit.openLink(url);
    }

    public onDisplayInterstitialReward(): void {
        // EMPTY?
    }

    public onDisplayInterstitialSkip(): void {
        this.onDisplayInterstitialClose();
    }

    public onDisplayInterstitialClose(): void {
        this._operativeEventManager.sendThirdQuartile(this._campaign.getSession(), this._campaign);
        this._operativeEventManager.sendView(this._campaign.getSession(), this._campaign);
        this._adUnit.hide();
    }
}
