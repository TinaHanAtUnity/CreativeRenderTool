import { IDisplayInterstitialHandler } from 'Views/DisplayInterstitial';
import { NativeBridge } from 'Native/NativeBridge';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { DisplayInterstitialAdUnit } from 'AdUnits/DisplayInterstitialAdUnit';
import { IAdUnitParameters } from 'AdUnits/AbstractAdUnit';

export class DisplayInterstitialEventHandler implements IDisplayInterstitialHandler {
    private _nativeBridge: NativeBridge;
    private _operativeEventManager: OperativeEventManager;
    private _adUnit: DisplayInterstitialAdUnit;

    constructor(nativeBridge: NativeBridge, adUnit: DisplayInterstitialAdUnit, parameters: IAdUnitParameters) {
        this._nativeBridge = nativeBridge;
        this._operativeEventManager = parameters.operativeEventManager;
        this._adUnit = adUnit;
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
        this._operativeEventManager.sendThirdQuartile(this._adUnit);
        this._operativeEventManager.sendView(this._adUnit);
        this._adUnit.hide();
    }
}
