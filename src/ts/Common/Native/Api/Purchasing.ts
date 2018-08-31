import { NativeBridge } from 'Common/Native/NativeBridge';
import { ApiPackage, NativeApi } from 'Common/Native/NativeApi';
import { Observable1 } from 'Core/Utilities/Observable';

export enum PurchasingEvent {
    COMMAND,
    VERSION,
    CATALOG,
    INITIALIZATION,
    EVENT
}

export class PurchasingApi extends NativeApi {

    public readonly onInitialize = new Observable1<string>();
    public readonly onCommandResult = new Observable1<string>();
    public readonly onGetPromoVersion = new Observable1<string>();
    public readonly onGetPromoCatalog = new Observable1<string>();
    public readonly onIAPSendEvent = new Observable1<string>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Purchasing', ApiPackage.ADS);
    }

    public initializePurchasing(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'initializePurchasing');
    }

    public getPromoVersion(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'getPromoVersion');
    }

    public getPromoCatalog(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'getPromoCatalog');
    }

    public initiatePurchasingCommand(event: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'initiatePurchasingCommand', [event]);
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

            case PurchasingEvent[PurchasingEvent.EVENT]:
                this.onIAPSendEvent.trigger(parameters[0]);
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }
}
