import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export abstract class EventedNativeApi<T extends object> extends NativeApi {

    protected _handlers: T[] = [];

    protected constructor(nativeBridge: NativeBridge, apiClass: string, apiPackage: ApiPackage) {
        super(nativeBridge, apiClass, apiPackage);
    }

    public addEventHandler(handler: T): T {
        this._handlers.push(handler);
        return handler;
    }

    public removeEventHandler(handler: T): void {
        if(this._handlers.length) {
            if(typeof handler !== 'undefined') {
                this._handlers = this._handlers.filter(storedHandler => storedHandler !== handler);
            } else {
                this._handlers = [];
            }
        }
    }

}
