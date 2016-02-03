import { NativeBridge } from 'NativeBridge';
import { AdUnit, FinishState } from 'Models/AdUnit';
import { Observable } from 'Utilities/Observable';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';

export class AdUnitManager extends Observable {
    private _nativeBridge: NativeBridge;
    private _adUnit: AdUnit;
    private _showing: boolean = false;

    constructor(nativeBridge: NativeBridge) {
        super();
        this._nativeBridge = nativeBridge;
        this._nativeBridge.subscribe('ADUNIT_ON_PAUSE', this.onPause.bind(this));
        this._nativeBridge.subscribe('ADUNIT_ON_DESTROY', this.onDestroy.bind(this));
    }

    public start(adUnit: AdUnit, orientation: ScreenOrientation, keyEvents: any[]): Promise<any[]> {
        // this needs proper error handling and show lifecycle handling TODO
        this._showing = true;
        this._adUnit = adUnit;

        // last argument is View.SYSTEM_UI_FLAG_LOW_PROFILE, hides software navigation until user touches screen
        return this._nativeBridge.invoke('AdUnit', 'open', [['videoplayer', 'webview'], orientation, keyEvents, 1]);
    }

    public hide(): void {
        this._nativeBridge.invoke('AdUnit', 'close', []);
        this._nativeBridge.invoke('Listener', 'sendFinishEvent', [this._adUnit.getPlacement().getId(), FinishState[this._adUnit.getFinishState()]]);
        this._showing = false;
        this._adUnit = null;
    }

    public setFinishState(finishState: FinishState): void {
        this._adUnit.setFinishState(finishState);
    }

    public isShowing(): boolean {
        return this._showing;
    }

    /*
     ANDROID ACTIVITY LIFECYCLE EVENTS
     */

    private onPause(finishing: boolean): void {
        if(finishing && this._showing) {
            this._adUnit.setFinishState(FinishState.SKIPPED);
            this.trigger('close', this._adUnit.getPlacement(), this._adUnit.getCampaign());
        }
    }

    private onDestroy(finishing: boolean): void {
        if(finishing && this._showing) {
            this._adUnit.setFinishState(FinishState.SKIPPED);
            this.trigger('close', this._adUnit.getPlacement(), this._adUnit.getCampaign());
        }
    }
}