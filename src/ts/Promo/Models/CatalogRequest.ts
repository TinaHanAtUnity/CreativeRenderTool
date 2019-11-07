import { IProduct } from 'Purchasing/PurchasingAdapter';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { RequestManager, INativeResponse } from 'Core/Managers/RequestManager';

interface ICatalogPayload {
    country: string;
    gameId: string;
    version: string;
    products: IProductItem[];
    ts: number;
}

interface IProductItem {
    productId: string;
    productType: string | undefined;
    isoCurrencyCode: string | undefined;
    localizedPrice: number | undefined;
}

const IAPCatalogEndpoint: {[key: string]: string} = {
    ENDPOINT_PRD : 'https://events.iap.unity3d.com/v1/catalog'
};

export class CatalogRequest {
    private _request: RequestManager;
    private _coreConfiguration: CoreConfiguration;
    private _clientInfo: ClientInfo;
    private _products: IProductItem[];
    private _gameVersion: string;

    constructor(clientInfo: ClientInfo, coreConfig: CoreConfiguration, request: RequestManager, products: IProduct[]) {
        this._clientInfo = clientInfo;
        this._coreConfiguration = coreConfig;
        this._request = request;
        this._products = this.updateProducts(products);
        this._gameVersion = clientInfo.getApplicationVersion();
    }
    public sendCatalogPayload(): Promise<INativeResponse | void> {
        if (this._products.length === 0) {
            return Promise.resolve();
        }
        const catalogPayload = JSON.stringify(this.constructCatalog());
        return this._request.post(IAPCatalogEndpoint.ENDPOINT_PRD, catalogPayload);
    }

    private updateProducts(products: IProduct[]): IProductItem[] {
        return products.map((product) => {
            return {
                productId: product.productId,
                productType: product.productType,
                isoCurrencyCode: product.isoCurrencyCode,
                localizedPrice: product.localizedPrice
            };
        });
    }
    private constructCatalog(): ICatalogPayload {
        return {
                country: this._coreConfiguration.getCountry(),
                gameId: this._clientInfo.getGameId(),
                version: this._gameVersion,
                products: this._products,
                ts: Date.now()
            };
    }
}
