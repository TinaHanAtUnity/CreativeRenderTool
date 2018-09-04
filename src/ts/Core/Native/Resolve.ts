import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable3, Observable4 } from 'Core/Utilities/Observable';

export enum ResolveEvent {
    COMPLETE,
    FAILED
}

export class ResolveApi extends NativeApi {

    public readonly onComplete = new Observable3<string, string, string> ();
    public readonly onFailed = new Observable4<string, string, string, string>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Resolve', ApiPackage.CORE);
    }

    public resolve(id: string, host: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'resolve', [id, host]);
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case ResolveEvent[ResolveEvent.COMPLETE]:
                this.onComplete.trigger(parameters[0], parameters[1], parameters[2]);
                break;

            case ResolveEvent[ResolveEvent.FAILED]:
                this.onFailed.trigger(parameters[0], parameters[1], parameters[2], parameters[3]);
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }

}
