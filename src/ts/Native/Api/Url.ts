import {NativeBridge} from "../NativeBridge";
import {Observable5, Observable4, Observable3} from "../../Utilities/Observable";

export enum UrlEvent {
    COMPLETE,
    FAILED
}

export enum ResolveEvent {
    COMPLETE,
    FAILED
}

export class Url {

    public static onUrlComplete: Observable5<string, string, string, number, [string, string][]> = new Observable5();
    public static onUrlFailed: Observable3<string, string, string> = new Observable3();

    public static onResolveComplete: Observable3<string, string, string> = new Observable3();
    public static onResolveFailed: Observable4<string, string, string, string> = new Observable4();

    private static ApiClass = 'Url';

    public static resolve(id: string, host: string): Promise<string> {
        return NativeBridge.getInstance().invoke<string>(Url.ApiClass, 'resolve', [id, host]);
    }

    public static get(id: string, url: string, headers: [string, string][]): Promise<string> {
        return NativeBridge.getInstance().invoke<string>(Url.ApiClass, 'get', [id, url, headers]);
    }

    public static post(id: string, url: string, requestBody: string, headers: [string, string][]): Promise<string> {
        return NativeBridge.getInstance().invoke<string>(Url.ApiClass, 'post', [id, url, requestBody, headers]);
    }

    public static setConnectTimeout(connectTimeout: number): Promise<number> {
        return NativeBridge.getInstance().invoke<number>(Url.ApiClass, 'setConnectTimeout', [connectTimeout]);
    }

    public static getConnectTimeout(): Promise<number> {
        return NativeBridge.getInstance().invoke<number>(Url.ApiClass, 'getConnectTimeout');
    }

    public static setReadTimeout(readTimeout: number): Promise<number> {
        return NativeBridge.getInstance().invoke<number>(Url.ApiClass, 'setReadTimeout', [readTimeout]);
    }

    public static getReadTimeout(): Promise<number> {
        return NativeBridge.getInstance().invoke<number>(Url.ApiClass, 'getReadTimeout');
    }

    public static handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case UrlEvent[UrlEvent.COMPLETE]:
                Url.onUrlComplete.trigger(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4]);
                break;

            case UrlEvent[UrlEvent.FAILED]:
                Url.onUrlFailed.trigger(parameters[0], parameters[1], parameters[2]);
                break;

            case ResolveEvent[ResolveEvent.COMPLETE]:
                Url.onResolveComplete.trigger(parameters[0], parameters[1], parameters[2]);
                break;

            case ResolveEvent[ResolveEvent.FAILED]:
                Url.onResolveFailed.trigger(parameters[0], parameters[1], parameters[2], parameters[3]);
                break;

            default:
                throw new Error('Url event ' + event + ' does not have an observable');
        }
    }

}
