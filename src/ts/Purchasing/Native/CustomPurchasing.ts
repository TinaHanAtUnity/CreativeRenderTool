import { NativeApi, ApiPackage } from 'Core/Native/Bridge/NativeApi';
import { Observable1, Observable2 } from 'Core/Utilities/Observable';
import { ITransactionDetails, IProduct, ITransactionErrorDetails } from 'Purchasing/PurchasingAdapter';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import {EventCategory} from '../../Core/Constants/EventCategory';

export enum CustomPurchasingEvent {
    PRODUCTS_RETRIEVED,
    TRANSACTION_COMPLETE,
    TRANSACTION_ERROR
}

export class CustomPurchasingApi extends NativeApi {
    public readonly onProductsRetrieved = new Observable1<IProduct[]>();
    public readonly onTransactionComplete = new Observable1<ITransactionDetails>();
    public readonly onTransactionError = new Observable1<ITransactionErrorDetails>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'CustomPurchasing', ApiPackage.PURCHASING_CORE, EventCategory.CUSTOM_PURCHASING);
    }

    public available(): Promise<boolean> {
        return this._nativeBridge.invoke(this._fullApiClassName, 'available', []);
    }

    public purchaseItem(productId: string, extras: any) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'purchaseItem', [productId, extras]);
    }

    public refreshCatalog() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'refreshCatalog', []);
    }

    public handleEvent(event: string, parameters: any[]) {
        switch (event) {
        case CustomPurchasingEvent[CustomPurchasingEvent.PRODUCTS_RETRIEVED]:
            this.onProductsRetrieved.trigger(parameters[0]);
            break;
        case CustomPurchasingEvent[CustomPurchasingEvent.TRANSACTION_COMPLETE]:
            this.onTransactionComplete.trigger(parameters[0]);
            break;
        case CustomPurchasingEvent[CustomPurchasingEvent.TRANSACTION_ERROR]:
            const details: ITransactionErrorDetails = parameters[0];
            details.store = this.translateStore(details.store);
            this.onTransactionError.trigger(details);
            break;
        default:
            super.handleEvent(event, parameters);
        }
    }

    private translateStore(store: string): string {
        if (store) {
            switch(store) {
                case 'NOT_SPECIFIED':
                    return 'NotSpecified';
                case 'GOOGLE_PLAY':
                    return 'GooglePlay';
                case 'AMAZON_APP_STORE':
                    return 'AmazonAppStore';
                case 'CLOUD_MOOLAH':
                    return 'CloudMoolah';
                case 'SAMSUNG_APPS':
                    return 'SamsungApps';
                case 'XIAOMI_MI_PAY':
                    return 'XiaomiMiPay';
                case 'MAC_APP_STORE':
                    return 'MacAppStore';
                case 'APPLE_APP_STORE':
                    return 'AppleAppStore';
                case 'WIN_RT':
                    return 'WinRT';
                case 'TIZEN_STORE':
                    return 'TizenStore';
                case 'FACEBOOK_STORE':
                    return 'FacebookStore';
                default:
                    return 'NotSpecified';
            }
        } else {
            return 'NotSpecified';
        }
    }
}
