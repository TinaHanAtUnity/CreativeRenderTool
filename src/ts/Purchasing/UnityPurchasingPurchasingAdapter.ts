import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { ICoreApi } from 'Core/ICore';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Observable1 } from 'Core/Utilities/Observable';
import { Url } from 'Core/Utilities/Url';
import { IPromoApi } from 'Promo/IPromo';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { IProduct, IPurchasingAdapter, ITransactionDetails } from 'Purchasing/PurchasingAdapter';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';

export enum IPromoRequest {
    SETIDS = 'setids',
    PURCHASE = 'purchase',
    CLOSE = 'close'
}

export interface IPromoPayload {
    gamerToken?: string;
    trackingOptOut?: boolean;
    gameId?: string;
    abGroup?: number;
    productId?: string;
    iapPromo: boolean;
    request: IPromoRequest;
    purchaseTrackingUrls: string[];
    native?: boolean;
}

export class UnityPurchasingPurchasingAdapter implements IPurchasingAdapter {

    public readonly onCatalogRefreshed = new Observable1<IProduct[]>();

    private _core: ICoreApi;
    private _promo: IPromoApi;
    private _coreConfiguration: CoreConfiguration;
    private _adsConfiguration: AdsConfiguration;
    private _clientInfo: ClientInfo;
    private _initPromise: Promise<void>;
    private _isInitialized = false;
    private _metaDataManager: MetaDataManager;

    constructor(core: ICoreApi, promo: IPromoApi, coreConfiguration: CoreConfiguration, adsConfiguration: AdsConfiguration, clientInfo: ClientInfo, metaDataManager: MetaDataManager) {
        this._core = core;
        this._promo = promo;
        this._adsConfiguration = adsConfiguration;
        this._coreConfiguration = coreConfiguration;
        this._clientInfo = clientInfo;
        this._metaDataManager = metaDataManager;
        promo.Purchasing.onIAPSendEvent.subscribe((eventJSON) => this.handleSendIAPEvent(eventJSON));
    }

    public initialize(): Promise<void> {
        if (this.configurationIncludesPromoPlacement()) {
            this._initPromise = this.checkMadeWithUnity()
            .then(() => this.initializeIAPPromo())
            .then(() => this.checkPromoVersion())
            .then(() => {
                return this.sendPurchasingCommand(this.getInitializationPayload());
            });
        } else {
            this._initPromise = Promise.resolve();
        }

        return this._initPromise;
    }

    public purchaseItem(thirdPartyEventManager: ThirdPartyEventManager, productId: string, campaign: PromoCampaign, placementId: string, isNative: boolean): Promise<ITransactionDetails> {
        const purchaseUrls = campaign.getTrackingUrlsForEvent('purchase');
        const modifiedPurchaseUrls = thirdPartyEventManager.replaceTemplateValuesAndEncodeUrls(purchaseUrls).map((value: string): string => {
            if (PromoEvents.purchaseHostnameRegex.test(value)) {
                return Url.addParameters(value, {'native': isNative, 'iap_service': true});
            }
            return value;
        });
        const iapPayload: IPromoPayload = {
            productId: campaign.getIapProductId(),
            iapPromo: true,
            request: IPromoRequest.PURCHASE,
            purchaseTrackingUrls: modifiedPurchaseUrls,
            native: isNative // tells iap if promo was shown as a native promo
        };
        this.sendPromoPayload(iapPayload);
        // Currently resolves with empty object until UnityPurchasing SDK sends us the relevant details
        return Promise.resolve(<ITransactionDetails>{});
    }

    public onPromoClosed(thirdPartyEventManager: ThirdPartyEventManager, campaign: PromoCampaign, placementId: string): void {
        const purchaseUrls = campaign.getTrackingUrlsForEvent('purchase');
        const modifiedPurchaseUrls = thirdPartyEventManager.replaceTemplateValuesAndEncodeUrls(purchaseUrls);
        const iapPayload: IPromoPayload = {
            gamerToken: this._coreConfiguration.getToken(),
            trackingOptOut: this._adsConfiguration.isOptOutEnabled(),
            iapPromo: true,
            gameId: this._clientInfo.getGameId() + '|' + this._coreConfiguration.getToken(),
            abGroup: this._coreConfiguration.getAbGroup(),
            request: IPromoRequest.CLOSE,
            purchaseTrackingUrls: modifiedPurchaseUrls
        };
        this.sendPromoPayload(iapPayload);
    }

    public refreshCatalog(): Promise<IProduct[]> {
        return new Promise<IProduct[]>((resolve, reject) => {
            const observer = this._promo.Purchasing.onGetPromoCatalog.subscribe((promoCatalogJSON) => {
                this._promo.Purchasing.onGetPromoCatalog.unsubscribe(observer);
                this.validatePromoJSON(promoCatalogJSON).then(() => {
                    try {
                        const products: IProduct[] = JSON.parse(promoCatalogJSON);
                        resolve(products);
                    } catch(err) {
                        reject(this.logIssue(`Promo catalog JSON failed to parse with the following string: ${promoCatalogJSON}`, 'catalog_json_malformatted'));
                    }
                }).catch((e) => {
                    reject(e);
                });
            });
            this._promo.Purchasing.getPromoCatalog().catch((e) => {
                this._promo.Purchasing.onGetPromoCatalog.unsubscribe(observer);
                reject(this.logIssue('Purchasing Catalog failed to refresh', 'catalog_refresh_failed'));
            });
        });
    }

    private validatePromoJSON(promoCatalogJSON: string): Promise<void> {
        if (promoCatalogJSON === 'NULL' || promoCatalogJSON === null || promoCatalogJSON === undefined) {
            return Promise.reject(this.logIssue('Promo catalog JSON is null', 'catalog_json_null'));
        } else if (promoCatalogJSON === '') {
            return Promise.reject(this.logIssue('Promo catalog JSON is empty', 'catalog_json_empty'));
        }

        return Promise.resolve();
    }

    private logIssue(errorMessage: string, errorType?: string): Error {
        if (errorType) {
            Diagnostics.trigger(errorType, { message: errorMessage });
        }
        this._core.Sdk.logError(errorMessage);
        return new Error(errorMessage);
    }

    private getInitializationPayload(): IPromoPayload {
        return <IPromoPayload>{
            iapPromo: true,
            abGroup: this._coreConfiguration.getAbGroup(),
            gameId: this._clientInfo.getGameId() + '|' + this._coreConfiguration.getToken(),
            trackingOptOut: this._adsConfiguration.isOptOutEnabled(),
            gamerToken: this._coreConfiguration.getToken(),
            request: IPromoRequest.SETIDS
        };
    }

    private configurationIncludesPromoPlacement(): boolean {
        if (this._coreConfiguration) {
            const placements = this._adsConfiguration.getPlacements();
            const placementIds = this._adsConfiguration.getPlacementIds();
            for (const placementId of placementIds) {
                const adTypes = placements[placementId].getAdTypes();
                if (adTypes && adTypes.indexOf('IAP') > -1) {
                    return true;
                }
            }
        }
        return false;
    }

    private handleSendIAPEvent(iapPayload: string): Promise<void> {
        const jsonPayload = JSON.parse(iapPayload);

        if (jsonPayload.type === 'CatalogUpdated') {
            return this.refreshCatalog().then((catalog) => this.onCatalogRefreshed.trigger(catalog));
        } else {
            return Promise.reject(this.logIssue('IAP Payload is incorrect', 'handle_send_event_failure'));
        }
    }

    private checkMadeWithUnity(): Promise<void> {
        return this._metaDataManager.fetch(FrameworkMetaData).then((framework) => {
            if (framework && framework.getName() === 'Unity') {
                return Promise.resolve();
            } else {
                return Promise.reject(this.logIssue('Game not made with Unity. You must use BYOP to use IAP Promo.'));
            }
        });
    }

    private initializeIAPPromo(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const observer = this._promo.Purchasing.onInitialize.subscribe((isReady) => {
                this._promo.Purchasing.onInitialize.unsubscribe(observer);
                if (isReady !== 'True') {
                    reject(this.logIssue('Purchasing SDK not detected. You have likely configured a promo placement but have not included the Unity Purchasing SDK in your game.'));
                } else {
                    resolve();
                }
            });
            this._promo.Purchasing.initializePurchasing().catch(() => {
                this._promo.Purchasing.onInitialize.unsubscribe(observer);
                reject(this.logIssue('Purchase initialization failed', 'purchase_initialization_failed'));
            });
        });
    }

    private checkPromoVersion(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const promoVersionObserver = this._promo.Purchasing.onGetPromoVersion.subscribe((promoVersion) => {
                this._promo.Purchasing.onGetPromoVersion.unsubscribe(promoVersionObserver);
                if(!this.isPromoVersionSupported(promoVersion)) {
                    reject(this.logIssue(`Promo version: ${promoVersion} is not supported. Initialize UnityPurchasing 1.16+ to ensure Promos are marked as ready`));
                } else {
                    resolve();
                }
            });
            this._promo.Purchasing.getPromoVersion().catch(() => {
                this._promo.Purchasing.onGetPromoVersion.unsubscribe(promoVersionObserver);
                reject(this.logIssue('Promo version check failed'));
            });
        });
    }

    private isPromoVersionSupported(version: string): boolean {
        const promoVersionSplit = version.split('.', 2);
        if (promoVersionSplit.length > 1) {
            return ((parseInt(promoVersionSplit[0], 10) >= 2) || ((parseInt(promoVersionSplit[0], 10) >= 1 && parseInt(promoVersionSplit[1], 10) >= 16)));
        }
        return false;
    }

    private sendPurchasingCommand(iapPayload: IPromoPayload): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const observer = this._promo.Purchasing.onCommandResult.subscribe((isCommandSuccessful) => {
                if (isCommandSuccessful === 'True') {
                    if (iapPayload.request === IPromoRequest.SETIDS) {
                        this._isInitialized = true;
                    }
                    resolve();
                } else {
                    reject(this.logIssue(`Purchase command attempt failed with command ${isCommandSuccessful}`, 'purchase_command_failed'));
                }
            });
            this._promo.Purchasing.initiatePurchasingCommand(JSON.stringify(iapPayload)).catch(() => {
                this._promo.Purchasing.onCommandResult.unsubscribe(observer);
                reject(this.logIssue('Purchase event failed to send', 'purchase_event_failed'));
            });
        });
    }

    private sendPromoPayload(iapPayload: IPromoPayload): Promise<void> {
        if (!this._isInitialized) {
            return this.initialize().then(() => {
                return this.sendPurchasingCommand(iapPayload);
            });
        } else {
            return this.sendPurchasingCommand(iapPayload);
        }
    }
}
