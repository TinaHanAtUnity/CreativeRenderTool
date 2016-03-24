import { NativeBridge } from 'Native/NativeBridge';
import { Observable4, Observable3 } from 'Utilities/Observable';

export enum ResolveEvent {
    COMPLETE,
    FAILED
}

export class ResolveApi {

    public static onComplete: Observable3<string, string, string> = new Observable3();
    public static onFailed: Observable4<string, string, string, string> = new Observable4();

    private static ApiClass = 'Resolve';

    public static resolve(id: string, host: string): Promise<string> {
        return NativeBridge.getInstance().invoke<string>(ResolveApi.ApiClass, 'resolve', [id, host]);
    }

    public static handleEvent(event: string, parameters: any[]): void {
        console.dir(event);
        console.dir(parameters);
        switch(event) {
            case ResolveEvent[ResolveEvent.COMPLETE]:
                ResolveApi.onComplete.trigger(parameters[0], parameters[1], parameters[2]);
                break;

            case ResolveEvent[ResolveEvent.FAILED]:
                ResolveApi.onFailed.trigger(parameters[0], parameters[1], parameters[2], parameters[3]);
                break;

            default:
                throw new Error('Resolve event ' + event + ' does not have an observable');
        }
    }

}
