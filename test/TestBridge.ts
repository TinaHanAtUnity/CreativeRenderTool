import { NativeBridge } from '../src/ts/NativeBridge';

export abstract class TestBridgeApi {
    private _nativeBridge: NativeBridge;

    public setNativeBridge(nativeBridge: NativeBridge): void {
        this._nativeBridge = nativeBridge;
    }

    public getNativeBridge(): NativeBridge {
        return this._nativeBridge;
    }
}

export class TestBridge implements IWebViewBridge {
    private _nativeBridge: NativeBridge;

    private _apiMap: {} = {};

    constructor() {
        this._nativeBridge = new NativeBridge(this);
    }

    public getNativeBridge(): NativeBridge {
        return this._nativeBridge;
    }

    public setApi(className: string, apiClass: TestBridgeApi) {
        this._apiMap[className] = apiClass;
        this._apiMap[className].setNativeBridge(this._nativeBridge);
    }

    public handleInvocation(invocations: string): void {
        let calls: [string, string, any[], string][] = JSON.parse(invocations);
        console.dir(calls);
        let results: any[][] = calls.map((value: [string, string, any[], string]): any[] => {
            let [className, methodName, parameters, callback]: [string, string, any[], string] = value;
            className = className.split(NativeBridge.ApiPackageName + '.')[1];
            let apiClass: Object = this._apiMap[className];
            let apiMethod: Function = apiClass[methodName];
            if(!apiMethod) {
                throw new Error(className + '.' + methodName + ' is not implemented');
            }
            let result: any[] = apiMethod.apply(apiClass, parameters);
            result.unshift(callback);
            return result;
        });
        console.dir(results);
        this._nativeBridge.handleCallback(results);
    }

    public handleCallback(id: string, status: string, parameters?: string): void {
        console.log(id, status, parameters);
    }
}