import { IStoreApi } from 'Store/IStore';
import { IAppleProduct } from 'Store/Native/iOS/Products';
import { CallbackContainer } from 'Core/Native/Bridge/CallbackContainer';

export class AppleStore {
    private _store: IStoreApi;
    private _callbackId: number = 1;
    private _callbacks: { [requestId: number]: CallbackContainer<IAppleProduct> };
    private _productRequests: { [requestId: number]: string };

    constructor(store: IStoreApi) {
        this._store = store;
        this._callbacks = {};
        this._productRequests = {};

        this._store.iOS!.Products.onProductRequestComplete.subscribe((id, result) => this.onProductRequestComplete(id, result));
        this._store.iOS!.Products.onProductRequestErrorNoProducts.subscribe((id) => this.onProductRequestErrorNoProducts(id));
        this._store.iOS!.Products.onProductRequestFailed.subscribe((id, error) => this.onProductRequestFailed(id, error));
    }

    public getProductInfo(productId: string): Promise<IAppleProduct> {
        const id = this._callbackId++;

        const promise = new Promise<IAppleProduct>((resolve, reject) => {
            this._callbacks[id] = new CallbackContainer(resolve, reject);
        });

        this._productRequests[id] = productId;

        this._store.iOS!.Products.requestProductInfos([productId], id);

        return promise;
    }

    private onProductRequestComplete(requestId: number, products: { [productId: string]: IAppleProduct }) {
        const productId = this._productRequests[requestId];

        if (productId && products[productId]) {
            this.finishProductRequest(true, requestId, products[productId]);
        }

        this.finishProductRequest(false, requestId);
    }

    private onProductRequestErrorNoProducts(requestId: number) {
        this.finishProductRequest(false, requestId);
    }

    private onProductRequestFailed(requestId: number, errorMessage: string) {
        this.finishProductRequest(false, requestId);
    }

    private finishProductRequest(success: boolean, requestId: number, result?: IAppleProduct) {
        const callback = this._callbacks[requestId];

        if (callback) {
            if (success) {
                callback.resolve(result);
            } else {
                callback.reject();
            }

            delete this._callbacks[requestId];
        }

        if (this._productRequests[requestId]) {
            delete this._productRequests[requestId];
        }
    }
}
