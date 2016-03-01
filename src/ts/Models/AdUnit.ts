import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { SessionManager } from 'Managers/SessionManager';
import { StorageManager } from 'Managers/StorageManager';
import { NativeBridge } from 'NativeBridge';

export enum FinishState {
    COMPLETED,
    SKIPPED,
    ERROR
}

export class AdUnit {
    protected _placement: Placement;
    protected _nativeBridge: NativeBridge;
    private _campaign: Campaign;
    private _finishState: FinishState;
    private _sessionManager: SessionManager;
    private _storageManager: StorageManager;

    constructor(placement: Placement, campaign: Campaign, nativeBridge: NativeBridge, sessionManager: SessionManager, storageManager: StorageManager) {
        this._placement = placement;
        this._campaign = campaign;
        this._nativeBridge = nativeBridge;
        this._sessionManager = sessionManager;
        this._storageManager = storageManager;
    }

    public getPlacement(): Placement {
        return this._placement;
    }

    public getCampaign(): Campaign {
        return this._campaign;
    }

    public getFinishState(): FinishState {
        return this._finishState;
    }

    public setFinishState(finishState: FinishState): void {
        if(this._finishState !== FinishState.COMPLETED) {
            this._finishState = finishState;
        }
    }

    public getStorageManager() {
        return this._storageManager;
    }

    public getSessionManager() {
        return this._sessionManager;
    }

}
