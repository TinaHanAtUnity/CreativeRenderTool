import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable4 } from 'Core/Utilities/Observable';

enum BroadcastEvent {
    ACTION
}

export class BroadcastApi extends NativeApi {

    public readonly onBroadcastAction = new Observable4<string, string, string, unknown>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Broadcast', ApiPackage.CORE);
    }

    public addBroadcastListener(listenerName: string, actions: string[]): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'addBroadcastListener', [listenerName, actions]);
    }

    public addDataSchemeBroadcastListener(listenerName: string, dataScheme: string, actions: string[]): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'addBroadcastListener', [listenerName, dataScheme, actions]);
    }

    public removeBroadcastListener(listenerName: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'removeBroadcastListener', [listenerName]);
    }

    public removeAllBroadcastListeners(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'removeAllBroadcastListeners', []);
    }

    public handleEvent(event: string, parameters: unknown[]): void {
        if(event === BroadcastEvent[BroadcastEvent.ACTION]) {
            this.onBroadcastAction.trigger(parameters[0], parameters[1], parameters[2], parameters[3]);
        } else {
            super.handleEvent(event, parameters);
        }
    }
}
