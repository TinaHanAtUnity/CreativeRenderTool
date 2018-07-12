import { ApiPackage, NativeApi } from 'Native/NativeApi';
import { Observable4 } from 'Utilities/Observable';
import { NativeBridge } from 'Native/NativeBridge';

enum BroadcastEvent {
    ACTION
}

export class BroadcastApi extends NativeApi {

    public readonly onBroadcastAction = new Observable4<string, string, string, any>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Broadcast', ApiPackage.CORE);
    }

    public addBroadcastListener(listenerName: string, actions: string[]): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'addBroadcastListener', [listenerName, actions]);
    }

    public addDataSchemeBroadcastListener(listenerName: string, dataScheme: string, actions: string[]): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'addBroadcastListener', [listenerName, dataScheme, actions]);
    }

    public removeBroadcastListener(listenerName: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'removeBroadcastListener', [listenerName]);
    }

    public removeAllBroadcastListeners(): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'removeAllBroadcastListeners', []);
    }

    public handleEvent(event: string, parameters: any[]): void {
        if(event === BroadcastEvent[BroadcastEvent.ACTION]) {
            this.onBroadcastAction.trigger(parameters[0], parameters[1], parameters[2], parameters[3]);
        } else {
            super.handleEvent(event, parameters);
        }
    }
}
