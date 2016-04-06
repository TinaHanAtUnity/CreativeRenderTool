import { NativeBridge } from 'Native/NativeBridge';
import { Observable5, Observable3 } from 'Utilities/Observable';

export enum RequestEvent {
    COMPLETE,
    FAILED
}

export class RequestApi {

    public static onComplete: Observable5<string, string, string, number, [string, string][]> = new Observable5();
    public static onFailed: Observable3<string, string, string> = new Observable3();

    private static ApiClass = 'Request';

    public static get(id: string, url: string, headers: [string, string][]): Promise<string> {
        return NativeBridge.getInstance().invoke<string>(RequestApi.ApiClass, 'get', [id, url, headers]);
    }

    public static post(id: string, url: string, requestBody: string, headers: [string, string][]): Promise<string> {
        return NativeBridge.getInstance().invoke<string>(RequestApi.ApiClass, 'post', [id, url, requestBody, headers]);
    }

    public static setConnectTimeout(connectTimeout: number): Promise<number> {
        return NativeBridge.getInstance().invoke<number>(RequestApi.ApiClass, 'setConnectTimeout', [connectTimeout]);
    }

    public static getConnectTimeout(): Promise<number> {
        return NativeBridge.getInstance().invoke<number>(RequestApi.ApiClass, 'getConnectTimeout');
    }

    public static setReadTimeout(readTimeout: number): Promise<number> {
        return NativeBridge.getInstance().invoke<number>(RequestApi.ApiClass, 'setReadTimeout', [readTimeout]);
    }

    public static getReadTimeout(): Promise<number> {
        return NativeBridge.getInstance().invoke<number>(RequestApi.ApiClass, 'getReadTimeout');
    }

    public static handleEvent(event: string, parameters: any[]): void {
        console.dir(event);
        console.dir(parameters);
        switch(event) {
            case RequestEvent[RequestEvent.COMPLETE]:
                RequestApi.onComplete.trigger(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4]);
                break;

            case RequestEvent[RequestEvent.FAILED]:
                RequestApi.onFailed.trigger(parameters[0], parameters[1], parameters[2]);
                break;

            default:
                throw new Error('Request event ' + event + ' does not have an observable');
        }
    }

}
