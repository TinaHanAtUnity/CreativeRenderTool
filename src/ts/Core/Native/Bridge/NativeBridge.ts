import { EventCategory } from 'Core/Constants/EventCategory';
import { Platform } from 'Core/Constants/Platform';
import { BatchInvocation } from 'Core/Native/Bridge/BatchInvocation';
import { CallbackContainer } from 'Core/Native/Bridge/CallbackContainer';
import { INativeBridge } from 'Core/Native/Bridge/INativeBridge';
import { NativeApi } from 'Core/Native/Bridge/NativeApi';

export enum CallbackStatus {
    OK,
    ERROR
}

export type INativeCallback = (status: CallbackStatus, ...parameters: unknown[]) => void;

export class NativeBridge implements INativeBridge {

    private static _doubleRegExp: RegExp = /"(\d+\.\d+)=double"/g;

    private static convertStatus(status: string): CallbackStatus {
        switch(status) {
            case CallbackStatus[CallbackStatus.OK]:
                return CallbackStatus.OK;
            case CallbackStatus[CallbackStatus.ERROR]:
                return CallbackStatus.ERROR;
            default:
                throw new Error('Status string is not valid: ' + status);
        }
    }

    private _callbackId: number = 1;
    // tslint:disable-next-line
    private _callbackTable: {[key: number]: CallbackContainer<any>} = {};

    private _platform: Platform;
    private _backend: IWebViewBridge;

    private _autoBatchEnabled: boolean;
    private _currentBatch?: BatchInvocation;
    private _nextBatch?: BatchInvocation;

    private _eventHandlers: { [key: string]: NativeApi } = {};

    constructor(backend: IWebViewBridge, platform: Platform, autoBatch = true) {
        this._backend = backend;
        this._platform = platform;
        this._autoBatchEnabled = autoBatch;
    }

    public registerCallback<T>(resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void): number {
        const id: number = this._callbackId++;
        this._callbackTable[id] = new CallbackContainer(resolve, reject);
        return id;
    }

    public invoke<T>(className: string, methodName: string, parameters?: unknown[]): Promise<T> {
        if(this._autoBatchEnabled) {
            if(!this._currentBatch) {
                this._currentBatch = new BatchInvocation(this);
                const promise = this._currentBatch.queue<T>(className, methodName, parameters);
                this.invokeBatch(this._currentBatch);
                return promise;
            } else {
                if(!this._nextBatch) {
                    this._nextBatch = new BatchInvocation(this);
                }
                return this._nextBatch.queue<T>(className, methodName, parameters);
            }
        } else {
            const batch = new BatchInvocation(this);
            const promise = batch.queue<T>(className, methodName, parameters);
            this.invokeBatch(batch);
            return promise;
        }
    }

    public handleCallback(results: unknown[][]): void {
        if(this._nextBatch) {
            this._currentBatch = this._nextBatch;
            delete this._nextBatch;
            this.invokeBatch(this._currentBatch);
        } else {
            delete this._currentBatch;
        }

        results.forEach((result: unknown[]): void => {
            const id: number = parseInt(<string>result.shift(), 10);
            const status = NativeBridge.convertStatus(<string>result.shift());
            let parameters = <unknown[]>result.shift();
            const callbackObject = this._callbackTable[id];
            if(!callbackObject) {
                throw new Error('Unable to find matching callback object from callback id ' + id);
            }
            if(parameters.length === 1) {
                // @ts-ignore
                parameters = parameters[0];
            }
            switch(status) {
                case CallbackStatus.OK:
                    callbackObject.resolve(parameters);
                    break;
                case CallbackStatus.ERROR:
                    callbackObject.reject(parameters);
                    break;
                default:
                    throw new Error('Unknown callback status');
            }
            delete this._callbackTable[id];
        });
    }

    public addEventHandler(eventCategory: EventCategory, nativeApi: NativeApi) {
        if(!(EventCategory[eventCategory] in this._eventHandlers)) {
            this._eventHandlers[EventCategory[eventCategory]] = nativeApi;
        }
    }

    public handleEvent(parameters: unknown[]): void {
        const category = <string>parameters.shift();
        const event = <string>parameters.shift();
        if(category && category in this._eventHandlers) {
            this._eventHandlers[category].handleEvent(event, parameters);
        } else {
            throw new Error('Unknown event category: ' + category);
        }
    }

    public handleInvocation(parameters: unknown[]): void {
        const className = <string>parameters.shift();
        const methodName = <string>parameters.shift();
        const callback = <string>parameters.shift();
        parameters.push((status: CallbackStatus, ...callbackParameters: unknown[]) => {
            this.invokeCallback(callback, CallbackStatus[status], ...callbackParameters);
        });
        // @ts-ignore
        (<unknown>window)[className][methodName].apply((<unknown>window)[className], parameters);
    }

    public getPlatform(): Platform {
        return this._platform;
    }

    private invokeBatch(batch: BatchInvocation): void {
        this._backend.handleInvocation(JSON.stringify(batch.getBatch()).replace(NativeBridge._doubleRegExp, '$1'));
    }

    private invokeCallback(id: string, status: string, ...parameters: unknown[]): void {
        this._backend.handleCallback(id, status, JSON.stringify(parameters));
    }

}
