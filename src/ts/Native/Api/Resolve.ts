import { NativeBridge } from 'Native/NativeBridge';
import { Observable4, Observable3 } from 'Utilities/Observable';
import { NativeApi } from 'Native/NativeApi';

export enum ResolveEvent {
    COMPLETE,
    FAILED
}

export class ResolveApi extends NativeApi {

    public onComplete: Observable3<string, string, string> = new Observable3();
    public onFailed: Observable4<string, string, string, string> = new Observable4();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Resolve');
    }

    public resolve(id: string, host: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'resolve', [id, host]);
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
