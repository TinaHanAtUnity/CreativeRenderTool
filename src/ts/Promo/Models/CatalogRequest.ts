import { IProduct } from 'Purchasing/PurchasingAdapter';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ICoreApi } from 'Core/ICore';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';

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
    ENDPOINT_STG : 'https://events-iap.staging.unityads.unity3d.com/v1/catalog',
    ENDPOINT_PRD : 'https://events.iap.unity3d.com/v1/catalog'
};

export class CatalogRequest {
    private _request: RequestManager;
    private _coreConfiguration: CoreConfiguration;
    private _clientInfo: ClientInfo;
    private _products: IProductItem[] | [];
    private _time: number;
    private _core: ICoreApi;
    private _gameVersion: string;
    private _devMode: boolean;
    constructor(core: ICoreApi, clientInfo: ClientInfo, coreConfig: CoreConfiguration, products: IProduct[]) {
        this._core = core;
        this._clientInfo = clientInfo;
        this._coreConfiguration = coreConfig;
        this._time = Date.now();
        this._products = this.updateProducts(products);
        this._gameVersion = clientInfo.getApplicationVersion();
        this._devMode = true;
    }
    public sendCatalogPayload() {
        const sampleSize = this._devMode ? 2 : 100;
        const iapEndPoint = this._devMode ? IAPCatalogEndpoint.ENDPOINT_STG : IAPCatalogEndpoint.ENDPOINT_PRD;
        if (CustomFeatures.sampleAtGivenPercent(sampleSize)) {
            const catalogPayload = JSON.stringify(this.constructCatalog());
            this._core.Sdk.logDebug('Sending catalogPayload to IAP-Events: ' + catalogPayload);
            this._request.post(iapEndPoint, catalogPayload)
                .catch((err) => {
                    this._core.Sdk.logError('Error, cannot send CatalogPayload to IAP-Events: ' + JSON.stringify(err));
                });
        }
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
                ts: this._time
            };
    }
}
