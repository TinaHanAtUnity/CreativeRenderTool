import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageType } from 'Core/Native/Storage';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { Url } from 'Core/Utilities/Url';
import { Request } from 'Core/Utilities/Request';
import { Model, ISchema } from 'Core/Models/Model';
import { Promises } from 'Core/Utilities/Promises';

export interface IOrganicPurchase {
    productId: string | undefined;
    price: number | undefined;
    currency: string | undefined;
    receiptPurchaseData: string | undefined;
    signature: string | undefined;
}

export class OrganicPurchase extends Model<IOrganicPurchase> {
    public static Schema: ISchema<IOrganicPurchase> = {
        productId: ['string', 'undefined'],
        price: ['number', 'undefined'],
        currency: ['string', 'undefined'],
        receiptPurchaseData: ['string', 'undefined'],
        signature: ['string', 'undefined']
    };

    constructor(data: IOrganicPurchase) {
        super('OrganicPurchase', OrganicPurchase.Schema, data);
    }

    public getId(): string | undefined {
        return this.get('productId');
    }

    public getPrice(): number | undefined {
        return this.get('price');
    }

    public getCurrency(): string | undefined {
        return this.get('currency');
    }

    public getReceipt(): string | undefined {
        return this.get('receiptPurchaseData');
    }

    public getSignature(): string | undefined {
        return this.get('signature');
    }

    public getDTO(): { [key: string]: any } {
        return {
            'productId': this.getId(),
            'price': this.getPrice(),
            'currency': this.getCurrency(),
            'receiptPurchaseData': this.getReceipt(),
            'signature': this.getSignature()
        };
    }
}

// gets instantiated in webview.ts and will begin watching for organic purchase events.
export class OrganicPurchaseManager {

    private static InAppPurchaseStorageKey = 'iap.purchases';

    private _nativeBridge: NativeBridge;
    private _promoEvents: PromoEvents;
    private _request: Request;

    constructor(nativeBridge: NativeBridge, promoEvents: PromoEvents, request: Request) {
        this._nativeBridge = nativeBridge;
        this._promoEvents = promoEvents;
        this._request = request;
    }

    public initialize(): Promise<void> {
        const promise = this.getOrganicPurchase();
        this._nativeBridge.Storage.onSet.subscribe(() => this.getOrganicPurchase());
        return Promises.voidResult(promise);
    }

    private getOrganicPurchase(): Promise<void[]> {
        return this._nativeBridge.Storage.get(StorageType.PUBLIC, OrganicPurchaseManager.InAppPurchaseStorageKey).then((data: any) => {
            const promises: Promise<void>[] = [];
            if (data && data.length && data.length > 0) {
                for(const event of data) {
                    const organicPurchaseEvent = new OrganicPurchase(event);
                    const promise = this.postOrganicPurchaseEvents(organicPurchaseEvent);
                    promises.push(promise);
                }
                promises.push(this.resetIAPPurchaseMetaData());
            }
            return Promise.all(promises);
        });
    }

    private resetIAPPurchaseMetaData(): Promise<void> {
        return this._nativeBridge.Storage.set(StorageType.PUBLIC, OrganicPurchaseManager.InAppPurchaseStorageKey, []).then(() => {
            return this._nativeBridge.Storage.write(StorageType.PUBLIC);
        });
    }

    private postOrganicPurchaseEvents(organicPurchaseEvent: OrganicPurchase): Promise<void> {
        const productId = organicPurchaseEvent.getId();
        return this._promoEvents.onOrganicPurchaseSuccess({
            store: this._promoEvents.getAppStoreFromReceipt(organicPurchaseEvent.getReceipt()),
            productId: productId,
            storeSpecificId: productId,
            amount: organicPurchaseEvent.getPrice(),
            currency: organicPurchaseEvent.getCurrency(),
            native: false}, undefined, organicPurchaseEvent.getReceipt()).then((body) => {
                const promise = this._request.post(Url.addParameters('https://events.iap.unity3d.com/events/v1/organic_purchase', {'native': false, 'iap_service': false}), JSON.stringify(body));
                return Promises.voidResult(promise);
            }
        );
    }

}
