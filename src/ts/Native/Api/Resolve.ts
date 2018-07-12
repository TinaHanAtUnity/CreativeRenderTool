import { NativeBridge } from 'Native/NativeBridge';
import { Observable4, Observable3 } from 'Utilities/Observable';
import { ApiPackage, NativeApi } from 'Native/NativeApi';

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
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'resolve', [id, host]);
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
