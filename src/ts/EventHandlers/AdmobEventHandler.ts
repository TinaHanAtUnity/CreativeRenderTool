import { IAdMobEventHandler } from 'Views/AdMobView';
import { AdMobAdUnit } from 'AdUnits/AdMobAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { FinishState } from 'Constants/FinishState';

export interface IAdMobEventHandlerParameters {
    adUnit: AdMobAdUnit;
    nativeBridge: NativeBridge;
}

export class AdMobEventHandler implements IAdMobEventHandler {
    private _adUnit: AdMobAdUnit;
    private _nativeBridge: NativeBridge;

    constructor(parameters: IAdMobEventHandlerParameters) {
        this._adUnit = parameters.adUnit;
        this._nativeBridge = parameters.nativeBridge;
    }

    public onClose(): void {
        this._adUnit.hide();
    }

    public onOpenURL(url: string): void {
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            this._nativeBridge.UrlScheme.open(url);
        } else {
            this._nativeBridge.Intent.launch({
                action: 'android.intent.action.VIEW',
                uri: url
            });
        }
    }

    public onGrantReward(): void {
        this._adUnit.setFinishState(FinishState.COMPLETED);
    }
}
