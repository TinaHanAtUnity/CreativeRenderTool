import { ApiPackage, NativeApi } from 'Common/Native/NativeApi';
import { NativeBridge } from 'Common/Native/NativeBridge';

export abstract class NativeApiWithEventHandlers<T extends object> extends NativeApi {
    protected _handlers: T[] = [];

    constructor(nativeBridge: NativeBridge, apiClass: string, apiPackage: ApiPackage) {
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
