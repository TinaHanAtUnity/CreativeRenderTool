import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AnalyticsProtocol } from 'Analytics/AnalyticsProtocol';
import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { PurchasingFailureReason } from 'Promo/Models/PurchasingFailureReason';

// external fields
export interface IPurchaseCommon {
    store: string;
    productId: string;
    storeSpecificId: string;
    amount: number | undefined;
    currency: string | undefined;
    native: boolean;
}

// internal fields
interface IPurchase extends IPurchaseCommon {
    platform: string;
    appid: string;
    platformid: number;
    gameId: string;
    sdk_ver: string;
    ads_sdk_ver: string;
    gamerToken: string;
    game_ver: string;
    osv: string;
    orient: string;
    w: number;
    h: number;
    iap_ver: string;
    userid: string;
    sessionid: number;
    trackingOptOut: boolean; // gdpr opt out
    ppi: number | undefined;
    deviceid: string; // Not sure how to get this

    iapPromo: boolean;
    type: string;
    iap_service: boolean;
    purchase: string;
}

interface IPromoPurchase extends IPurchase {
    request: string;
}

interface IPurhcaseFailed {
    failureJSON: string;
}

interface IPurchaseSuccess {
    productType: string | undefined;
    receipt: {
        data: string;
    };
}

interface IPromoPurchaseFailed extends IPromoPurchase, IPurhcaseFailed {}

interface IPromoPurchaseSucceeded extends IPromoPurchase, IPurchaseSuccess {}

interface IOrganicPurchaseFailed extends IPurchase, IPurhcaseFailed {}

interface IOrganicPurchaseSuccess extends IPurchase, IPurchaseSuccess {}

interface IFailureJson {
    storeSpecificErrorCode: string;
    message: string;
    reason: string;
    productId: string;
}

/*
Events for iap should be sent to :
    - 'https://events.iap.unity3d.com/events/v1/purchase' : regular
    - 'https://events.iap.unity3d.com/events/v1/organic_purchase' : organic
*/
export class PromoEvents {

    public static purchasePathRegex = new RegExp('events\/v1\/purchase');
    public static purchaseHostnameRegex = new RegExp('events\.iap\.unity3d\.com');

    private _platform: Platform;
    private _core: ICoreApi;
    private _coreConfiguration: CoreConfiguration;
    private _adsConfiguration: AdsConfiguration;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _analyticsStorage: AnalyticsStorage;

    constructor(platform: Platform, core: ICoreApi, coreConfiguration: CoreConfiguration, adsConfiguration: AdsConfiguration, clientInfo: ClientInfo, deviceInfo: DeviceInfo, analyticsStorage: AnalyticsStorage) {
        this._platform = platform;
        this._core = core;
        this._coreConfiguration = coreConfiguration;
        this._adsConfiguration = adsConfiguration;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._analyticsStorage = analyticsStorage;
    }

    public getAppStoreFromReceipt(receipt: string | undefined): string {
        if (receipt) {
            try {
                const data = JSON.parse(receipt);
                if (data && data.Store) {
                    return data.Store;
                }
            } catch(error) {
                // log the error
                this._core.Sdk.logError('PromoEvents.getAppStoreFromReceipt failed to parse json');
            }
        }
        return 'unknown';
    }

    public onPurchaseFailed(body: IPurchaseCommon, failureJson: IFailureJson): Promise<IPromoPurchaseFailed> {
        return Promise.all([
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight(),
            this._analyticsStorage.getSessionId(this._clientInfo.isReinitialized()),
            this._analyticsStorage.getUserId()
        ]).then(([width, height, sessionId, userId]) => {
            return {
                ... body,
                appid: this._coreConfiguration.getUnityProjectId(),
                platform: this._platform === Platform.IOS ? 'Ios' : 'Android',
                platformid: this._platform === Platform.IOS ? 8 : 11,
                gameId: this._clientInfo.getGameId(),
                sdk_ver: '', // leaving this blank as there is no way to get the unity version
                ads_sdk_ver: this._clientInfo.getSdkVersionName(),
                gamerToken: this._coreConfiguration.getToken(),
                game_ver: this._clientInfo.getApplicationVersion(),
                osv: AnalyticsProtocol.getOsVersion(this._platform, this._deviceInfo),
                orient: this.getOrientation(width, height),
                w: width,
                h: height,
                iap_ver: 'ads sdk',
                sessionid: sessionId,
                userid: userId,
                trackingOptOut: this._adsConfiguration.isOptOutEnabled(),
                ppi: this.getPPI(),
                deviceid: this.getDeviceId(),
                request: 'purchase',
                iap_service: false,
                iapPromo: true,
                type: 'iap.purchasefailed',
                purchase: 'FAILED',
                failureJSON: JSON.stringify(failureJson)
            };
        });
    }

    public onPurchaseSuccess(body: IPurchaseCommon, productType: string | undefined, receipt: string): Promise<IPromoPurchaseSucceeded> {
        return Promise.all([
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight(),
            this._analyticsStorage.getSessionId(this._clientInfo.isReinitialized()),
            this._analyticsStorage.getUserId()
        ]).then(([width, height, sessionId, userId]) => {
            return {
                ... body,
                appid: this._coreConfiguration.getUnityProjectId(),
                platform: this._platform === Platform.IOS ? 'Ios' : 'Android',
                platformid: this._platform === Platform.IOS ? 8 : 11,
                gameId: this._clientInfo.getGameId(),
                sdk_ver: '', // leaving this blank as there is no way to get the unity version
                ads_sdk_ver: this._clientInfo.getSdkVersionName(),
                gamerToken: this._coreConfiguration.getToken(),
                game_ver: this._clientInfo.getApplicationVersion(),
                osv: AnalyticsProtocol.getOsVersion(this._platform, this._deviceInfo),
                orient: this.getOrientation(width, height),
                w: width,
                h: height,
                iap_ver: 'ads sdk',
                sessionid: sessionId,
                userid: userId,
                trackingOptOut: this._adsConfiguration.isOptOutEnabled(),
                ppi: this.getPPI(),
                deviceid: this.getDeviceId(),
                request: 'purchase',
                iap_service: false,
                iapPromo: true,
                type: 'iap.purchase',
                purchase: 'OK',
                productType: productType,
                receipt: {
                    data: receipt
                }
            };
        });
    }

    public onOrganicPurchaseFailed(body: IPurchaseCommon, failureJson: IFailureJson): Promise<IOrganicPurchaseFailed> {
        return Promise.all([
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight(),
            this._analyticsStorage.getSessionId(this._clientInfo.isReinitialized()),
            this._analyticsStorage.getUserId()
        ]).then(([width, height, sessionId, userId]) => {
            return {
                ... body,
                appid: this._coreConfiguration.getUnityProjectId(),
                platform: this._platform === Platform.IOS ? 'Ios' : 'Android',
                platformid: this._platform === Platform.IOS ? 8 : 11,
                gameId: this._clientInfo.getGameId(),
                sdk_ver: '', // leaving this blank as there is no way to get the unity version
                ads_sdk_ver: this._clientInfo.getSdkVersionName(),
                gamerToken: this._coreConfiguration.getToken(),
                game_ver: this._clientInfo.getApplicationVersion(),
                osv: AnalyticsProtocol.getOsVersion(this._platform, this._deviceInfo),
                orient: this.getOrientation(width, height),
                w: width,
                h: height,
                iap_ver: 'ads sdk',
                sessionid: sessionId,
                userid: userId,
                trackingOptOut: this._adsConfiguration.isOptOutEnabled(),
                ppi: this.getPPI(),
                deviceid: this.getDeviceId(),
                iap_service: false,
                iapPromo: false,
                type: 'iap.purchasefailed',
                purchase: 'FAILED',
                failureJSON: JSON.stringify(failureJson)
            };
        });
    }

    public onOrganicPurchaseSuccess(body: IPurchaseCommon, productType: string | undefined, receipt: string): Promise<IOrganicPurchaseSuccess> {
        return Promise.all([
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight(),
            this._analyticsStorage.getSessionId(this._clientInfo.isReinitialized()),
            this._analyticsStorage.getUserId()
        ]).then(([width, height, sessionId, userId]) => {
            return {
                ... body,
                appid: this._coreConfiguration.getUnityProjectId(),
                platform: this._platform === Platform.IOS ? 'Ios' : 'Android',
                platformid: this._platform === Platform.IOS ? 8 : 11,
                gameId: this._clientInfo.getGameId(),
                sdk_ver: '', // leaving this blank as there is no way to get the unity version
                ads_sdk_ver: this._clientInfo.getSdkVersionName(),
                gamerToken: this._coreConfiguration.getToken(),
                game_ver: this._clientInfo.getApplicationVersion(),
                osv: AnalyticsProtocol.getOsVersion(this._platform, this._deviceInfo),
                orient: this.getOrientation(width, height),
                w: width,
                h: height,
                iap_ver: 'ads sdk',
                sessionid: sessionId,
                userid: userId,
                trackingOptOut: this._adsConfiguration.isOptOutEnabled(),
                ppi: this.getPPI(),
                deviceid: this.getDeviceId(),
                iap_service: false,
                iapPromo: false,
                type: 'iap.purchase',
                purchase: 'OK',
                productType: productType,
                receipt: {
                    data: receipt
                }
            };
        });
    }

    public failureJson(storeSpecificErrorCode: string, message: string, reason: PurchasingFailureReason, productId: string): IFailureJson {
        return {
            storeSpecificErrorCode: storeSpecificErrorCode,
            message: message,
            reason: PurchasingFailureReason[reason],
            productId: productId
        };
    }

    private getPPI(): number {
        return this._platform === Platform.ANDROID ? (<AndroidDeviceInfo>this._deviceInfo).getScreenDensity() : (<IosDeviceInfo>this._deviceInfo).getScreenScale();
    }

    private getOrientation(width: number, height: number): string {
        return width / height < 1 ? 'Portrait' : 'Landscape';
    }

    private getDeviceId(): string {
        const gdprEnabled: boolean = this._adsConfiguration.isOptOutEnabled() && this._adsConfiguration.isGDPREnabled();
        if (gdprEnabled) {
            if (this._deviceInfo instanceof AndroidDeviceInfo) {
                return this._deviceInfo.getDevice();
            } else if (this._deviceInfo instanceof IosDeviceInfo) {
                const advertisingIdentifier = this._deviceInfo.getAdvertisingIdentifier();
                if (advertisingIdentifier) {
                    return advertisingIdentifier;
                }
            }
        }
        return '';
    }
}
