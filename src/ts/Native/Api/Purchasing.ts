import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';
import { Observable1 } from 'Utilities/Observable';

export enum PurchasingEvent {
    COMMAND,
    VERSION,
    CATALOG,
    INITIALIZATION
}

export class PurchasingApi extends NativeApi {

    public readonly onInitialize = new Observable1<string>();
    public readonly onCommandResult = new Observable1<string>();
    public readonly onGetPromoVersion = new Observable1<string>();
    public readonly onGetPromoCatalog = new Observable1<string>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Purchasing');
    }

    public initializePromo(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'initializePurchasing');
    }

    public getPromoVersion(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'getPromoVersion');
    }

    public getPromoCatalog(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'getPromoCatalog');
    }

    public initializePurchasingParameters(event: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'initiatePurchasingCommand', [event]);
    }

    public sendPurchasingCommand(event: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'initiatePurchasingCommand', [event]);
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case PurchasingEvent[PurchasingEvent.COMMAND]:
                this.onCommandResult.trigger(parameters[0]);
                break;

            case PurchasingEvent[PurchasingEvent.VERSION]:
                this.onGetPromoVersion.trigger(parameters[0]);
                break;

            case PurchasingEvent[PurchasingEvent.CATALOG]:
                this.onGetPromoCatalog.trigger(parameters[0]);
                break;

            case PurchasingEvent[PurchasingEvent.INITIALIZATION]:
                this.onInitialize.trigger(parameters[0]);
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }
}
