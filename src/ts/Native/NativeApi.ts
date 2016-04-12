import { NativeBridge } from 'Native/NativeBridge';

export abstract class NativeApi {

    protected _nativeBridge: NativeBridge;
    protected _apiClass: string;

    constructor(nativeBridge: NativeBridge, apiClass: string) {
        this._nativeBridge = nativeBridge;
        this._apiClass = apiClass;
    }

    public handleEvent(event: string, parameters: any[]) {
        throw new Error(this._apiClass + ' event ' + event + ' does not have an observable');
    }

}
