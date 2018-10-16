import { IPurchasingAdapter, IProduct, ITransactionDetails } from 'Purchasing/PurchasingAdapter';
import { Observable1 } from 'Core/Utilities/Observable';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';

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
}

export class UnityPurchasingPurchasingAdapter implements IPurchasingAdapter {

    public readonly onCatalogRefreshed = new Observable1<IProduct[]>();

    private _nativeBridge: NativeBridge;
    private _coreConfiguration: CoreConfiguration;
    private _adsConfiguration: AdsConfiguration;
    private _clientInfo: ClientInfo;
    private _initPromise: Promise<void>;
    private _isInitialized = false;

    constructor(nativeBridge: NativeBridge, coreConfiguration: CoreConfiguration, adsConfiguration: AdsConfiguration, clientInfo: ClientInfo) {
        this._nativeBridge = nativeBridge;
        this._adsConfiguration = adsConfiguration;
        this._coreConfiguration = coreConfiguration;
        this._clientInfo = clientInfo;
        nativeBridge.Purchasing.onIAPSendEvent.subscribe((eventJSON) => this.handleSendIAPEvent(eventJSON));
    }

    public initialize(): Promise<void> {
        if (this.configurationIncludesPromoPlacement()) {
            this._initPromise = this.initializeIAPPromo()
            .then(() => this.checkPromoVersion())
            .then(() => {
                return this.sendPurchasingCommand(this.getInitializationPayload());
            });
        } else {
            this._initPromise = Promise.resolve();
        }

        return this._initPromise;
    }

    public purchaseItem(productId: string, campaign: PromoCampaign, placementId: string, isNative: boolean): Promise<ITransactionDetails> {
        const purchaseUrls = campaign.getTrackingUrlsForEvent('purchase');
        const modifiedPurchaseUrls = ThirdPartyEventManager.replaceUrlTemplateValues(purchaseUrls, {'%ZONE%': placementId});
        const iapPayload: IPromoPayload = {
            productId: campaign.getIapProductId(),
            iapPromo: true,
            request: IPromoRequest.PURCHASE,
            purchaseTrackingUrls: modifiedPurchaseUrls
        };
        this.sendPromoPayload(iapPayload);
        // Currently resolves with empty object until UnityPurchasing SDK sends us the relevant details
        return Promise.resolve(<ITransactionDetails>{});
    }

    public onPromoClosed(campaign: PromoCampaign, placementId: string): void {
        const purchaseUrls = campaign.getTrackingUrlsForEvent('purchase');
        const modifiedPurchaseUrls = ThirdPartyEventManager.replaceUrlTemplateValues(purchaseUrls, {'%ZONE%': placementId});
        const iapPayload: IPromoPayload = {
            gamerToken: this._coreConfiguration.getToken(),
            trackingOptOut: this._adsConfiguration.isOptOutEnabled(),
            iapPromo: true,
            gameId: this._clientInfo.getGameId() + '|' + this._coreConfiguration.getToken(),
            abGroup: this._coreConfiguration.getAbGroup().toNumber(),
            request: IPromoRequest.CLOSE,
            purchaseTrackingUrls: modifiedPurchaseUrls
        };
        this.sendPromoPayload(iapPayload);
    }

    public refreshCatalog(): Promise<IProduct[]> {
        return new Promise<IProduct[]>((resolve, reject) => {
            const observer = this._nativeBridge.Purchasing.onGetPromoCatalog.subscribe((promoCatalogJSON) => {
                this._nativeBridge.Purchasing.onGetPromoCatalog.unsubscribe(observer);
                if(promoCatalogJSON === '') {
                    reject(this.logIssue('catalog_json_empty', 'Promo catalog JSON is empty'));
                }
                try {
                    const products: IProduct[] = JSON.parse(promoCatalogJSON);
                    resolve(products);
                } catch(err) {
                    reject(this.logIssue('catalog_json_parse_failure', `Promo catalog JSON failed to parse with the following string: ${promoCatalogJSON}`));
                }
            });
            this._nativeBridge.Purchasing.getPromoCatalog().catch((e) => {
                this._nativeBridge.Purchasing.onGetPromoCatalog.unsubscribe(observer);
                reject(this.logIssue('catalog_refresh_failed', 'Purchasing Catalog failed to refresh'));
            });
        });
    }

    private logIssue(errorType: string, errorMessage: string): Error {
        this._nativeBridge.Sdk.logError(errorMessage);
        Diagnostics.trigger(errorType, { message: errorMessage });
        return new Error(errorMessage);
    }

    private getInitializationPayload(): IPromoPayload {
        return <IPromoPayload>{
            iapPromo: true,
            abGroup: this._coreConfiguration.getAbGroup().toNumber(),
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
            return Promise.reject(this.logIssue('handle_send_event_failure', 'IAP Payload is incorrect'));
        }
    }

    private initializeIAPPromo(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const observer = this._nativeBridge.Purchasing.onInitialize.subscribe((isReady) => {
                this._nativeBridge.Purchasing.onInitialize.unsubscribe(observer);
                if (isReady !== 'True') {
                    reject(this.logIssue('purchasingsdk_not_detected', 'Purchasing SDK not detected. You have likely configured a promo placement but have not included the Unity Purchasing SDK in your game.'));
                } else {
                    resolve();
                }
            });
            this._nativeBridge.Purchasing.initializePurchasing().catch(() => {
                this._nativeBridge.Purchasing.onInitialize.unsubscribe(observer);
                reject(this.logIssue('purchase_initialization_failed', 'Purchase initialization failed'));
            });
        });
    }

    private checkPromoVersion(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const promoVersionObserver = this._nativeBridge.Purchasing.onGetPromoVersion.subscribe((promoVersion) => {
                this._nativeBridge.Purchasing.onGetPromoVersion.unsubscribe(promoVersionObserver);
                if(!this.isPromoVersionSupported(promoVersion)) {
                    reject(this.logIssue('promo_version_not_supported', `Promo version: ${promoVersion} is not supported. Initialize UnityPurchasing 1.16+ to ensure Promos are marked as ready`));
                } else {
                    resolve();
                }
            });
            this._nativeBridge.Purchasing.getPromoVersion().catch(() => {
                this._nativeBridge.Purchasing.onGetPromoVersion.unsubscribe(promoVersionObserver);
                reject(this.logIssue('promo_version_check_failed', 'Promo version check failed'));
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
            const observer = this._nativeBridge.Purchasing.onCommandResult.subscribe((isCommandSuccessful) => {
                if (isCommandSuccessful === 'True') {
                    if (iapPayload.request === IPromoRequest.SETIDS) {
                        this._isInitialized = true;
                    }
                    resolve();
                } else {
                    reject(this.logIssue('purchase_command_attempt_failed', `Purchase command attempt failed with command ${isCommandSuccessful}`));
                }
            });
            this._nativeBridge.Purchasing.initiatePurchasingCommand(JSON.stringify(iapPayload)).catch(() => {
                this._nativeBridge.Purchasing.onCommandResult.unsubscribe(observer);
                reject(this.logIssue('send_purchase_event_failed', 'Purchase event failed to send'));
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
