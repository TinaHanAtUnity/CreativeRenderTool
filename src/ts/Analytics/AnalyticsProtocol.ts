import { Platform } from 'Core/Constants/Platform';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { ITransactionDetails } from 'Purchasing/PurchasingAdapter';
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';

export interface IAnalyticsMonetizationExtras {
    gamer_token: string;
    game_id: string;
}

export interface IAnalyticsObject<T> {
    type: string;
    msg:  T;
}

// Ads Analytics classes

export interface IAnalyticsCommonObjectV1 {
    common: {
        gameId: string; // from config
        organizationId: string; // from config
        analyticsUserId: string; // Get a user id from analytics; May not exist; Default ""
        analyticsSessionId: string; // Get a session id from analytics; May not exist; Default ""
        sessionId: string; // Ads Session Id; Ads SDK generates this
        platform: string; // ANDROID | IOS
        adsSdkVersion: string;
        gamerToken: string;
        limitAdTracking: boolean;
        coppaFlagged: boolean;
        projectId: string; // from config
        gdprEnabled: boolean;
        optOutRecorded: boolean;
        optOutEnabled: boolean;
    };
}

export interface IAnalyticsAppStartEventV1 {
    ts: number;
}

export interface IAnalyticsAppRunningEventV1 {
    ts: number;
    timeSinceStart: number;
    localTimeOffset: number;
}

export interface IAnalyticsAppInstallEventV1 {
    ts: number;
    appVersion: string; // from sdk api
    timeSinceStart: number;
}

export interface IAnalyticsAppUpdateEventV1 {
    ts: number;
    appVersion: string; // from sdk api
    timeSinceStart: number;
}

export interface IAnalyticsTransactionEventV1 {
    ts: number;
    productId: string;
    price: number;
    currencyCode: string;
    eventId: string;
    receipt: {
        appStore: string;
        transactionId: string;
        payload: string;
    };
}

export class AnalyticsProtocol {
    public static getCommonObject(platform: Platform, adsAnalyticsSessionId: string, analyticsUserId: string, analyticsSessionId: number, clientInfo: ClientInfo, deviceInfo: DeviceInfo, configuration: CoreConfiguration, privacySDK: PrivacySDK): IAnalyticsCommonObjectV1 {
        const limitAdTracking: boolean = deviceInfo.getLimitAdTracking() ? true : false;
        const maybeOrganizationId = configuration.getOrganizationId();
        const organizationId: string = maybeOrganizationId ? maybeOrganizationId : '';
        return {
            common: {
                gameId: clientInfo.getGameId(),
                organizationId: organizationId,
                analyticsUserId: analyticsUserId,
                analyticsSessionId: `${analyticsSessionId}`,
                sessionId: adsAnalyticsSessionId,
                platform: Platform[platform],
                adsSdkVersion: clientInfo.getSdkVersionName(),
                gamerToken: configuration.getToken(),
                limitAdTracking: limitAdTracking,
                coppaFlagged: configuration.isCoppaCompliant(),
                projectId: configuration.getUnityProjectId(),
                gdprEnabled: privacySDK.isGDPREnabled(),
                optOutRecorded: privacySDK.isOptOutRecorded(),
                optOutEnabled: privacySDK.isOptOutEnabled()
            }
        };
    }

    public static createAppStartEvent(): IAnalyticsObject<IAnalyticsAppStartEventV1> {
        const startEvent: IAnalyticsAppStartEventV1 = {
            ts: Date.now()
        };
        return {
            type: 'ads.analytics.appStart.v1',
            msg: startEvent
        };
    }

    public static createAppInstallEvent(clientInfo: ClientInfo, appStartTime: number): IAnalyticsObject<IAnalyticsAppInstallEventV1> {
        const currentTime = Date.now();
        const installEvent: IAnalyticsAppInstallEventV1 = {
            ts: currentTime,
            appVersion: clientInfo.getApplicationVersion(),
            timeSinceStart: currentTime - appStartTime
        };
        return {
            type: 'ads.analytics.appInstall.v1',
            msg: installEvent
        };
    }

    public static createAppUpdateEvent(clientInfo: ClientInfo, appStartTime: number): IAnalyticsObject<IAnalyticsAppUpdateEventV1> {
        const currentTime = Date.now();
        const updateEvent: IAnalyticsAppUpdateEventV1 = {
            ts: currentTime,
            appVersion: clientInfo.getApplicationVersion(),
            timeSinceStart: currentTime - appStartTime
        };
        return {
            type: 'ads.analytics.appUpdate.v1',
            msg: updateEvent
        };
    }

    public static createAppRunningEvent(appStartTime: number): IAnalyticsObject<IAnalyticsAppRunningEventV1> {
        const currentTime = Date.now();
        const appRunningEvent: IAnalyticsAppRunningEventV1 = {
            ts: currentTime,
            timeSinceStart: currentTime - appStartTime,
            localTimeOffset: new Date().getTimezoneOffset() * -1 * 60 * 1000
        };
        return {
            type: 'ads.analytics.appRunning.v1',
            msg: appRunningEvent
        };
    }

    public static createTransactionEvent(transaction: ITransactionDetails, platform: Platform): IAnalyticsObject<IAnalyticsTransactionEventV1> {
        const currentTime = Date.now();
        const transactionEvent: IAnalyticsTransactionEventV1 = {
            ts: currentTime,
            productId: transaction.productId,
            price: transaction.price,
            currencyCode: transaction.currency,
            eventId: JaegerUtilities.uuidv4(),
            receipt: {
                appStore: platform === Platform.ANDROID ? 'GooglePlay' : 'AppleAppStore',
                transactionId: transaction.transactionId,
                payload: transaction.receipt
            }
        };
        return {
            type: 'ads.analytics.transaction.v1',
            msg: transactionEvent
        };
    }

    public static getOsVersion(platform: Platform, deviceInfo: DeviceInfo): string {
        if (platform === Platform.IOS) {
            return 'iOS ' + deviceInfo.getOsVersion();
        } else if (platform === Platform.ANDROID && deviceInfo instanceof AndroidDeviceInfo) {
            return 'Android OS ' + deviceInfo.getOsVersion() + ' / API-' + deviceInfo.getApiLevel();
        } else {
            return '';
        }
    }

}
