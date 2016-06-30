import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { FinishState } from 'Constants/FinishState';
import { Observable0 } from 'Utilities/Observable';
import { NativeBridge } from 'Native/NativeBridge';
import { EventManager } from 'Managers/EventManager';

export abstract class AbstractAdUnit {

    public onStart: Observable0 = new Observable0();
    public onNewAdRequestAllowed: Observable0 = new Observable0();
    public onClose: Observable0 = new Observable0();

    protected _nativeBridge: NativeBridge;

    protected _placement: Placement;
    protected _campaign: Campaign;
    protected _finishState: FinishState;
    protected _showing: boolean = false;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: Campaign) {
        this._nativeBridge = nativeBridge;
        this._placement = placement;
        this._campaign = campaign;
    }

    public abstract show(): Promise<void>;

    public abstract hide(): Promise<void>;

    public abstract setNativeOptions(options: any): void;

    public getPlacement(): Placement {
        return this._placement;
    }

    public getCampaign(): Campaign {
        return this._campaign;
    }

    public setFinishState(finishState: FinishState) {
        if(this._finishState !== FinishState.COMPLETED) {
            this._finishState = finishState;
        }
    }

    public getFinishState(): FinishState {
        return this._finishState;
    }

    public isShowing(): boolean {
        return this._showing;
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
