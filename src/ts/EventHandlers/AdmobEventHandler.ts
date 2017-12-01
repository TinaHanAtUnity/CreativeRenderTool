import { IAdMobEventHandler } from 'Views/AdMobView';
import { AdMobAdUnit } from 'AdUnits/AdMobAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { FinishState } from 'Constants/FinishState';
import { Timer } from 'Utilities/Timer';

export interface IAdMobEventHandlerParameters {
    adUnit: AdMobAdUnit;
    nativeBridge: NativeBridge;
}

export class AdMobEventHandler implements IAdMobEventHandler {
    // Abstracted for testing
    public static setLoadTimeout(timeout: number) {
        AdMobEventHandler._loadTimeout = timeout;
    }
    private static _loadTimeout: number = 5000;
    private _adUnit: AdMobAdUnit;
    private _nativeBridge: NativeBridge;
    private _timeoutTimer: Timer;

    constructor(parameters: IAdMobEventHandlerParameters) {
        this._adUnit = parameters.adUnit;
        this._nativeBridge = parameters.nativeBridge;
        this._timeoutTimer = new Timer(() => this.onFailureToLoad(), AdMobEventHandler._loadTimeout);
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

    public onVideoStart(): void {
        this._timeoutTimer.stop();
    }

    public onShow(): void {
        this._timeoutTimer.start();
    }

    private onFailureToLoad(): void {
        this._adUnit.setFinishState(FinishState.ERROR);
        this._adUnit.hide();
    }
}
