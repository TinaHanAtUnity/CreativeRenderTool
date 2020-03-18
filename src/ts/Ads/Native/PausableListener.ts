import { FinishState } from 'Core/Constants/FinishState';
import { ListenerApi } from 'Ads/Native/Listener';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

type eventType = () => Promise<void>;

export class PausableListenerApi extends ListenerApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge);
    }

    private _paused: boolean = false;
    private _eventQueue: eventType[] = [];

    public sendReadyEvent(placementId: string): Promise<void> {
        if (this._paused) {
            this._eventQueue.push(() => {
                return super.sendReadyEvent(placementId);
            });
            return Promise.resolve();
        }
        return super.sendReadyEvent(placementId);
    }

    public sendStartEvent(placementId: string): Promise<void> {
        if (this._paused) {
            this._eventQueue.push(() => {
                return super.sendStartEvent(placementId);
            });
            return Promise.resolve();
        }
        return super.sendStartEvent(placementId);
    }

    public sendFinishEvent(placementId: string, result: FinishState): Promise<void> {
        if (this._paused) {
            this._eventQueue.push(() => {
                return super.sendFinishEvent(placementId, result);
            });
            return Promise.resolve();
        }
        return super.sendFinishEvent(placementId, result);
    }

    public sendClickEvent(placementId: string): Promise<void> {
        if (this._paused) {
            this._eventQueue.push(() => {
                return super.sendClickEvent(placementId);
            });
            return Promise.resolve();
        }
        return super.sendClickEvent(placementId);
    }

    public sendPlacementStateChangedEvent(placementId: string, oldState: string, newState: string): Promise<void> {
        if (this._paused) {
            this._eventQueue.push(() => {
                return super.sendPlacementStateChangedEvent(placementId, oldState, newState);
            });
            return Promise.resolve();
        }
        return super.sendPlacementStateChangedEvent(placementId, oldState, newState);
    }

    public sendErrorEvent(error: string, message: string): Promise<void> {
        if (this._paused) {
            this._eventQueue.push(() => {
                return super.sendErrorEvent(error, message);
            });
            return Promise.resolve();
        }
        return super.sendErrorEvent(error, message);
    }

    public pauseEvents(): void {
        this._paused = true;
    }

    public resumeEvents(): void {
        this._eventQueue.forEach((f) => {
            f();
        });
        this._paused = false;
    }
}
