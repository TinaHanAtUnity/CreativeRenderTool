import { NativeApi } from 'Native/NativeApi';
import { Observable4 } from 'Utilities/Observable';
import { NativeBridge } from 'Native/NativeBridge';

enum BroadcastEvent {
    ACTION
}

export class BroadcastApi extends NativeApi {
    public onBroadcastAction: Observable4<string, string, string, any> = new Observable4();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Broadcast');
    }

    public addBroadcastListener(listenerName: string, actions: string[]): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'addBroadcastListener', [listenerName, actions]);
    }

    public addDataSchemeBroadcastListener(listenerName: string, dataScheme: string, actions: string[]): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'addBroadcastListener', [listenerName, dataScheme, actions]);
    }

    public removeBroadcastListener(listenerName: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'removeBroadcastListener', [listenerName]);
    }

    public removeAllBroadcastListeners(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'removeAllBroadcastListeners', []);
    }

    public handleEvent(event: string, parameters: any[]): void {
        if(event === BroadcastEvent[BroadcastEvent.ACTION]) {
            this.onBroadcastAction.trigger(parameters[0], parameters[1], parameters[2], parameters[3]);
        } else {
            super.handleEvent(event, parameters);
        }
    }
}