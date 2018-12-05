
import { StorageType, StorageApi } from 'Core/Native/Storage';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { Url } from 'Core/Utilities/Url';
import { Model, ISchema } from 'Core/Models/Model';
import { Promises } from 'Core/Utilities/Promises';
import { RequestManager } from 'Core/Managers/RequestManager';

export interface IOrganicPurchase {
    productId: string | undefined;
    price: number | undefined;
    currency: string | undefined;
    receiptPurchaseData: string | undefined;
    signature: string | undefined;
    ts: number | undefined;
}

export class OrganicPurchase extends Model<IOrganicPurchase> {
    public static Schema: ISchema<IOrganicPurchase> = {
        productId: ['string', 'undefined'],
        price: ['number', 'undefined'],
        currency: ['string', 'undefined'],
        receiptPurchaseData: ['string', 'undefined'],
        signature: ['string', 'undefined'],
        ts: ['number', 'undefined']
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

    public getTs(): number | undefined {
        return this.get('ts');
    }

    public getDTO(): { [key: string]: any } {
        return {
            'productId': this.getId(),
            'price': this.getPrice(),
            'currency': this.getCurrency(),
            'receiptPurchaseData': this.getReceipt(),
            'signature': this.getSignature(),
            'ts': this.getTs()
        };
    }
}

// gets instantiated in Promo.ts and will begin watching for organic purchase events.
export class OrganicPurchaseManager {

    private static InAppPurchaseStorageKey = 'iap.purchases';

    private _storage: StorageApi;
    private _promoEvents: PromoEvents;
    private _request: RequestManager;
    private _onSetObserver: (key: string, data: object) => void;

    constructor(storage: StorageApi, promoEvents: PromoEvents, request: RequestManager) {
        this._storage = storage;
        this._promoEvents = promoEvents;
        this._request = request;
        this._onSetObserver = () => this.getOrganicPurchase();
    }

    public initialize(): Promise<void> {
        return Promises.voidResult(this.getOrganicPurchase());
    }

    private subscribe() {
        this.unsubscribe();
        this._storage.onSet.subscribe(this._onSetObserver);
    }

    private unsubscribe() {
        this._storage.onSet.unsubscribe(this._onSetObserver);
    }

    private getOrganicPurchase(): Promise<void> {
        this.unsubscribe();
        return this._storage.get(StorageType.PUBLIC, OrganicPurchaseManager.InAppPurchaseStorageKey).then((data: any) => {
            const promises: Promise<void>[] = [];
            if (data && data.length && data.length > 0) {
                for(const event of data) {
                    const organicPurchaseEvent = new OrganicPurchase(event);
                    const promise = this.postOrganicPurchaseEvents(organicPurchaseEvent);
                    promises.push(promise);
                }
                return Promise.all(promises).then(() => {
                    return this.resetIAPPurchaseMetaData();
                });
            }
        }).then(() => {
            this.subscribe();
        }).catch((e) => {
            this.subscribe();
            throw e;
        });
    }

    private resetIAPPurchaseMetaData(): Promise<void> {
        return this._storage.set(StorageType.PUBLIC, OrganicPurchaseManager.InAppPurchaseStorageKey, []).then(() => {
            return this._storage.write(StorageType.PUBLIC);
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
