import {NativeBridge} from 'NativeBridge';
import {AdUnit, FinishState} from 'Models/AdUnit';
import {Campaign} from 'Models/Campaign';
import {Zone} from 'Models/Zone';
import {Observable} from 'Utilities/Observable';

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

    public startAdUnit(zone: Zone, campaign: Campaign): void {
        this._showing = true;
        this._adUnit = new AdUnit(zone, campaign);

    }

    public hideAdUnit(): void {
        this._nativeBridge.invoke('Listener', 'sendFinishEvent', [this._adUnit.getZone().getId(), FinishState[this._adUnit.getFinishState()]]);
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
            this.trigger('close', this._adUnit.getZone(), this._adUnit.getCampaign());
        }
    }

    private onDestroy(finishing: boolean): void {
        if(finishing && this._showing) {
            this._adUnit.setFinishState(FinishState.SKIPPED);
            this.trigger('close', this._adUnit.getZone(), this._adUnit.getCampaign());
        }
    }
}