import { NativeBridge } from 'NativeBridge';
import { AdUnit, FinishState } from 'Models/AdUnit';
import { Observable } from 'Utilities/Observable';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';

export class AdUnitManager extends Observable {
    private _nativeBridge: NativeBridge;
    private _adUnit: AdUnit;
    private _showing: boolean = false;
    private _opened: boolean = false;
    private _recreatingActivity: boolean = false;

    constructor(nativeBridge: NativeBridge) {
        super();
        this._nativeBridge = nativeBridge;
        this._nativeBridge.subscribe('ADUNIT_ON_CREATE', this.onCreate.bind(this));
        this._nativeBridge.subscribe('ADUNIT_ON_RESUME', this.onResume.bind(this));
        this._nativeBridge.subscribe('ADUNIT_ON_PAUSE', this.onPause.bind(this));
        this._nativeBridge.subscribe('ADUNIT_ON_DESTROY', this.onDestroy.bind(this));
    }

    public start(adUnit: AdUnit, orientation: ScreenOrientation, keyEvents: any[]): Promise<any[]> {
        // this needs proper error handling and show lifecycle handling TODO
        this._showing = true;
        this._adUnit = adUnit;
        this._adUnit.setVideoActive(true);

        return this._nativeBridge.invoke('AdUnit', 'open', [['videoplayer', 'webview'], orientation, keyEvents]);
    }

    public hide(): void {
        this._nativeBridge.invoke('AdUnit', 'close', []);
        this._nativeBridge.invoke('Listener', 'sendFinishEvent', [this._adUnit.getPlacement().getId(), FinishState[this._adUnit.getFinishState()]]);
        this._showing = false;
        this._opened = false;
        this._adUnit = null;
    }

    public setFinishState(finishState: FinishState): void {
        this._adUnit.setFinishState(finishState);
    }

    public isShowing(): boolean {
        return this._showing;
    }

    public setVideoPosition(position: number): void {
        this._adUnit.setVideoPosition(position);
    }

    public getVideoPosition(): number {
        return this._adUnit.getVideoPosition();
    }

    public setVideoActive(active: boolean): void {
        this._adUnit.setVideoActive(active);
    }

    public isVideoActive(): boolean {
        return this._adUnit.isVideoActive();
    }

    /*
     ANDROID ACTIVITY LIFECYCLE EVENTS
     */

    private onCreate(): void {
        if(this._showing && this._opened) {
            this._recreatingActivity = true;
        }
    }

    private onResume(): void {
        if(this._showing) {
            if(!this._opened) {
                this._opened = true;
                this.trigger('newadunit', this._adUnit);
            } else if(this._recreatingActivity) {
                this._recreatingActivity = false;
                this.trigger('recreateadunit', this._adUnit);
            }
        }
    }

    private onPause(finishing: boolean): void {
        if(finishing && this._showing) {
            this._adUnit.setFinishState(FinishState.SKIPPED);
            this.trigger('close', this._adUnit.getPlacement(), this._adUnit.getCampaign());
        }
    }

    private onDestroy(finishing: boolean): void {
        if(this._showing && finishing) {
            this._adUnit.setFinishState(FinishState.SKIPPED);
            this.trigger('close', this._adUnit.getPlacement(), this._adUnit.getCampaign());
        }
    }
}