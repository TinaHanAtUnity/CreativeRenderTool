import { AbstractMRAIDEventBridge } from 'MRAID/EventBridge/AbstractMraidEventBridge';

export class MRAIDBridgeContainer {
    private _eventBridge: AbstractMRAIDEventBridge;

    public connect(eventBridge: AbstractMRAIDEventBridge): void {
        this._eventBridge = eventBridge;
        this._eventBridge.connect();
    }

    public disconnect(): void {
        this._eventBridge.connect();
    }

    public sendViewableEvent(viewable: boolean) {
        this._eventBridge.sendViewableEvent(viewable);
    }
}
