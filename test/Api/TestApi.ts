import { INativeBridge } from '../../src/ts/INativeBridge';

export abstract class TestApi {
    private _nativeBridge: INativeBridge;

    public setNativeBridge(nativeBridge: INativeBridge): void {
        this._nativeBridge = nativeBridge;
    }

    public getNativeBridge(): INativeBridge {
        return this._nativeBridge;
    }
}