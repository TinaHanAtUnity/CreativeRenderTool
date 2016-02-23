import { NativeBridge } from 'NativeBridge';
import { FinishState } from 'Models/AdUnit';
import { VideoAdUnit } from 'Models/VideoAdUnit';
import { Observable } from 'Utilities/Observable';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { SystemUiVisibility } from 'Constants/Android/SystemUiVisibility';

// currently this class is hardcoded for video ads, this should be refactored for generic support for different ad units TODO
export class AdUnitManager extends Observable {
    private _nativeBridge: NativeBridge;
    private _adUnit: VideoAdUnit;
    private _showing: boolean = false;

    constructor(nativeBridge: NativeBridge) {
        super();
        this._nativeBridge = nativeBridge;
        this._nativeBridge.subscribe('ADUNIT_ON_RESUME', this.onResume.bind(this));
        this._nativeBridge.subscribe('ADUNIT_ON_PAUSE', this.onPause.bind(this));
        this._nativeBridge.subscribe('ADUNIT_ON_DESTROY', this.onDestroy.bind(this));
    }

    public start(adUnit: VideoAdUnit, orientation: ScreenOrientation, keyEvents: any[]): Promise<any[]> {
        this._showing = true;
        this._adUnit = adUnit;
        this._adUnit.setVideoActive(true);

        return this._nativeBridge.invoke('AdUnit', 'open', [['videoplayer', 'webview'], orientation, keyEvents, SystemUiVisibility.LOW_PROFILE]);
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

    public newWatch() {
        this._adUnit.setWatches(this._adUnit.getWatches() + 1);
    }

    public getWatches(): number {
        return this._adUnit.getWatches();
    }

    /*
     ANDROID ACTIVITY LIFECYCLE EVENTS
     */

    private onResume(): void {
        if(this._showing) {
            this.trigger('resumeadunit', this._adUnit);
        }
    }

    private onPause(finishing: boolean): void {
        if(finishing && this._showing) {
            this._adUnit.setFinishState(FinishState.SKIPPED);
            this.trigger('close', this._adUnit);
        }
    }

    private onDestroy(finishing: boolean): void {
        if(this._showing && finishing) {
            this._adUnit.setFinishState(FinishState.SKIPPED);
            this.trigger('close', this._adUnit);
        }
    }
}