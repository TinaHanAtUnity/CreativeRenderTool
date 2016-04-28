import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { FinishState } from 'Constants/FinishState';
import { Observable0 } from 'Utilities/Observable';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { KeyCode } from 'Constants/Android/KeyCode';
import { SessionManager } from 'Managers/SessionManager';
import { NativeBridge } from 'Native/NativeBridge';
import { Vast } from 'Models/Vast';

export abstract class AbstractAdUnit {

    public onStart: Observable0 = new Observable0();
    public onClose: Observable0 = new Observable0();

    protected _nativeBridge: NativeBridge;

    protected _session;
    protected _placement;
    protected _campaign;
    protected _vast;

    protected _finishState;

    protected _showing: boolean = false;

    constructor(nativeBridge: NativeBridge, session: SessionManager, placement: Placement, campaign: Campaign, vast: Vast) {
        this._nativeBridge = nativeBridge;
        this._session = session;
        this._placement = placement;
        this._campaign = campaign;
        this._vast = vast;
    }

    public abstract show(requestedOrientation: ScreenOrientation, keyEvents: KeyCode[]): Promise<void>;
    public abstract hide(): Promise<void>;

    public getSession(): SessionManager {
        return this._session;
    }

    public getPlacement(): Placement {
        return this._placement;
    }

    public getCampaign(): Campaign {
        return this._campaign;
    }

    public getVast(): Vast {
        return this._vast;
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

    public getGamerId(): string {
        if (this._campaign) {
            return this._campaign.getGamerId();
        } else {
            return this._vast.getGamerId();
        }
    }

    public getCampaignId(): string {
        if (this._campaign) {
            return this._campaign.getId();
        } else {
            return this._vast.getAds()[0].getId();
        }
    }

}
