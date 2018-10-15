
import { PurchasingFailureReason } from 'Promo/Models/PurchasingFailureReason';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { AnalyticsProtocol } from 'Analytics/AnalyticsProtocol';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo as DeviceInfoBackend } from 'Backend/Api/DeviceInfo';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';

// external fields
export interface IPurchaseCommon {
    store: string;
    productId: string;
    storeSpecificId: string;
    amount: number | undefined;
    currency: string | undefined;
}

// internal fields
interface IPurchase extends IPurchaseCommon {
    platform: string;
    appid: string;
    platformid: number;
    gameId: string;
    sdk_ver: string;
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
    ppi: number;
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

    private coreConfiguration: CoreConfiguration;
    private adsConfiguration: AdsConfiguration;
    private nativeBridge: NativeBridge;
    private clientInfo: ClientInfo;
    private deviceInfo: DeviceInfo;
    private analyticsStorage: AnalyticsStorage;

    constructor(coreConfiguration: CoreConfiguration, adsConfiguration: AdsConfiguration, nativeBridge: NativeBridge, clientInfo: ClientInfo, deviceInfo: DeviceInfo) {
        this.coreConfiguration = coreConfiguration;
        this.adsConfiguration = adsConfiguration;
        this.nativeBridge = nativeBridge;
        this.clientInfo = clientInfo;
        this.deviceInfo = deviceInfo;
        this.analyticsStorage = new AnalyticsStorage(nativeBridge);
    }

    public onPurchaseFailed(url: string, body: IPurchaseCommon, failureJson: IFailureJson): Promise<IPromoPurchaseFailed> {
        return Promise.all([
            this.deviceInfo.getScreenWidth(),
            this.deviceInfo.getScreenHeight(),
            this.analyticsStorage.getSessionId(this.clientInfo.isReinitialized()),
            this.analyticsStorage.getUserId()
        ]).then(([width, height, sessionId, userId]) => {
            return {
                ... body,
                appid: this.coreConfiguration.getUnityProjectId(),
                platform: this.nativeBridge.getPlatform() === Platform.IOS ? 'Ios' : 'Android',
                platformid: this.nativeBridge.getPlatform() === Platform.IOS ? 8 : 11,
                gameId: this.clientInfo.getGameId(),
                sdk_ver: this.clientInfo.getSdkVersionName(),
                gamerToken: this.coreConfiguration.getToken(),
                game_ver: this.clientInfo.getApplicationVersion(),
                osv: AnalyticsProtocol.getOsVersion(this.nativeBridge, this.deviceInfo),
                orient: this.getOrientation(width, height),
                w: width,
                h: height,
                iap_ver: 'ads sdk',
                sessionid: sessionId,
                userid: userId,
                trackingOptOut: this.adsConfiguration.isOptOutEnabled(),
                ppi: DeviceInfoBackend.getScreenDensity(),
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

    public onPurchaseSuccess(url: string, body: IPurchaseCommon, productType: string | undefined, receipt: string): Promise<IPromoPurchaseSucceeded> {
        return Promise.all([
            this.deviceInfo.getScreenWidth(),
            this.deviceInfo.getScreenHeight(),
            this.analyticsStorage.getSessionId(this.clientInfo.isReinitialized()),
            this.analyticsStorage.getUserId()
        ]).then(([width, height, sessionId, userId]) => {
            return {
                ... body,
                appid: this.coreConfiguration.getUnityProjectId(),
                platform: this.nativeBridge.getPlatform() === Platform.IOS ? 'Ios' : 'Android',
                platformid: this.nativeBridge.getPlatform() === Platform.IOS ? 8 : 11,
                gameId: this.clientInfo.getGameId(),
                sdk_ver: this.clientInfo.getSdkVersionName(),
                gamerToken: this.coreConfiguration.getToken(),
                game_ver: this.clientInfo.getApplicationVersion(),
                osv: AnalyticsProtocol.getOsVersion(this.nativeBridge, this.deviceInfo),
                orient: this.getOrientation(width, height),
                w: width,
                h: height,
                iap_ver: 'ads sdk',
                sessionid: sessionId,
                userid: userId,
                trackingOptOut: this.adsConfiguration.isOptOutEnabled(),
                ppi: DeviceInfoBackend.getScreenDensity(),
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
            this.deviceInfo.getScreenWidth(),
            this.deviceInfo.getScreenHeight(),
            this.analyticsStorage.getSessionId(this.clientInfo.isReinitialized()),
            this.analyticsStorage.getUserId()
        ]).then(([width, height, sessionId, userId]) => {
            return {
                ... body,
                appid: this.coreConfiguration.getUnityProjectId(),
                platform: this.nativeBridge.getPlatform() === Platform.IOS ? 'Ios' : 'Android',
                platformid: this.nativeBridge.getPlatform() === Platform.IOS ? 8 : 11,
                gameId: this.clientInfo.getGameId(),
                sdk_ver: this.clientInfo.getSdkVersionName(),
                gamerToken: this.coreConfiguration.getToken(),
                game_ver: this.clientInfo.getApplicationVersion(),
                osv: AnalyticsProtocol.getOsVersion(this.nativeBridge, this.deviceInfo),
                orient: this.getOrientation(width, height),
                w: width,
                h: height,
                iap_ver: 'ads sdk',
                sessionid: sessionId,
                userid: userId,
                trackingOptOut: this.adsConfiguration.isOptOutEnabled(),
                ppi: DeviceInfoBackend.getScreenDensity(),
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
            this.deviceInfo.getScreenWidth(),
            this.deviceInfo.getScreenHeight(),
            this.analyticsStorage.getSessionId(this.clientInfo.isReinitialized()),
            this.analyticsStorage.getUserId()
        ]).then(([width, height, sessionId, userId]) => {
            return {
                ... body,
                appid: this.coreConfiguration.getUnityProjectId(),
                platform: this.nativeBridge.getPlatform() === Platform.IOS ? 'Ios' : 'Android',
                platformid: this.nativeBridge.getPlatform() === Platform.IOS ? 8 : 11,
                gameId: this.clientInfo.getGameId(),
                sdk_ver: this.clientInfo.getSdkVersionName(),
                gamerToken: this.coreConfiguration.getToken(),
                game_ver: this.clientInfo.getApplicationVersion(),
                osv: AnalyticsProtocol.getOsVersion(this.nativeBridge, this.deviceInfo),
                orient: this.getOrientation(width, height),
                w: width,
                h: height,
                iap_ver: 'ads sdk',
                sessionid: sessionId,
                userid: userId,
                trackingOptOut: this.adsConfiguration.isOptOutEnabled(),
                ppi: DeviceInfoBackend.getScreenDensity(),
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

    private getOrientation(width: number, height: number): string {
        return width / height < 1 ? 'Portrait' : 'Landscape';
    }

    private getDeviceId(): string {
        const gdprEnabled: boolean = this.adsConfiguration.isOptOutEnabled() && this.adsConfiguration.isGDPREnabled();
        if (gdprEnabled) {
            if (this.deviceInfo instanceof AndroidDeviceInfo) {
                return this.deviceInfo.getDevice();
            } else if (this.deviceInfo instanceof IosDeviceInfo) {
                const advertisingIdentifier = this.deviceInfo.getAdvertisingIdentifier();
                if (advertisingIdentifier) {
                    return advertisingIdentifier;
                }
            }
        }
        return '';
    }
}
