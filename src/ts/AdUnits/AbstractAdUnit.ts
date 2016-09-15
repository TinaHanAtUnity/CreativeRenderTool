import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { Observable0 } from 'Utilities/Observable';
import { NativeBridge } from 'Native/NativeBridge';
import { EventManager } from 'Managers/EventManager';
import { AdUnitObservables } from 'AdUnits/AdUnitObservables';

export abstract class AbstractAdUnit {

    public onStart: Observable0;
    public onNewAdRequestAllowed: Observable0;
    public onClose: Observable0;

    protected _nativeBridge: NativeBridge;
    protected _placement: Placement;
    protected _campaign: Campaign;

    constructor(nativeBridge: NativeBridge, observables: AdUnitObservables, placement: Placement, campaign: Campaign) {
        this._nativeBridge = nativeBridge;
        this._placement = placement;
        this._campaign = campaign;
        this.onStart = observables.onStart;
        this.onNewAdRequestAllowed = observables.onNewAdRequestAllowed;
        this.onClose = observables.onClose;
    }

    public abstract show(): Promise<void>;

    public abstract hide(): Promise<void>;

    public abstract setNativeOptions(options: any): void;

    public abstract isShowing(): boolean;

    public getPlacement(): Placement {
        return this._placement;
    }

    public getCampaign(): Campaign {
        return this._campaign;
    }

    public sendImpressionEvent(eventManager: EventManager, sessionId: string): void {
        // do nothing; can be overridden in subclasses
    }

    public sendTrackingEvent(eventManager: EventManager, eventName: string, sessionId: string): void {
        // do nothing; can be overridden in subclasses
    }

    public sendProgressEvents(eventManager: EventManager, sessionId: string, position: number, oldPosition: number) {
        // do nothing; can be overridden in subclasses
    }
}
