import { Platform } from 'Core/Constants/Platform';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';

// tslint:disable-next-line
export interface IAnalyticsMessage {}
/*
TODO: IAnalyticsMessage should be refactored in following PRs.

Looking at the code all analytic messages share the same field `ts`.
Therefore this interface can be refactored to:

export interface IAnalyticsMessage {
    ts: number;
}
*/

export interface IAnalyticsMonetizationExtras {
    gamer_token: string;
    game_id: string;
}

export interface IAnalyticsCustomParams {
    unity_monetization_extras: string;
}

export interface IAnalyticsEvent<T extends IAnalyticsMessage> {
    type: string;
    msg: T;
}

interface IAnalyticsLevelUpEvent extends IAnalyticsCustomParams {
    new_level_index: string;
}

interface IAnalyticsLevelFailedEvent extends IAnalyticsCustomParams {
    level_index: string;
}

interface IAnalyticsItemEvent extends IAnalyticsCustomParams {
    currency_type: string;
    transaction_context: string;
    amount: number;
    item_id: string;
    balance: number;
    item_type: string;
    level: string;
    transaction_id: string;
}

interface IAnalyticsAdCompleteEvent extends IAnalyticsCustomParams {
    rewarded: boolean;
    network: string;
    placement_id: string;
}

interface IIapTransactionEvent extends IAnalyticsMessage {
    ts: number;
    productid: string;
    amount: number;
    currency: string;
    transactionid: number;
    iap_service: boolean;
    promo: boolean;
    receipt: string;
    unity_monetization_extras: string;
}

interface IIapPurchaseFailedEvent extends IAnalyticsCustomParams {
    productID: string;
    reason: string;
    price: number;
    currency: string;
}

interface IAnalyticsCustomEvent<G extends IAnalyticsCustomParams> extends IAnalyticsMessage {
    ts: number;
    t_since_start: number; // appended by webview
    name: string;
    custom_params: G;
}

export type AnalyticsItemAcquiredEvent = IAnalyticsEvent<IAnalyticsCustomEvent<IAnalyticsItemEvent>>;
export type AnalyticsItemSpentEvent = IAnalyticsEvent<IAnalyticsCustomEvent<IAnalyticsItemEvent>>;
export type AnalyticsLevelUpEvent = IAnalyticsEvent<IAnalyticsCustomEvent<IAnalyticsLevelUpEvent>>;
export type AnalyticsLevelFailedEvent = IAnalyticsEvent<IAnalyticsCustomEvent<IAnalyticsLevelFailedEvent>>;
export type AnalyticsGenericEvent = IAnalyticsEvent<IAnalyticsMessage>;
export type AnalyticsAdCompleteEvent = IAnalyticsEvent<IAnalyticsCustomEvent<IAnalyticsAdCompleteEvent>>;
export type AnalyticsIapTransactionEvent = IAnalyticsEvent<IIapTransactionEvent>;
export type AnalyticsIapPurchaseFailedEvent = IAnalyticsEvent<IAnalyticsCustomEvent<IIapPurchaseFailedEvent>>;

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

export class AnalyticsProtocol {
    public static getCommonObject(platform: Platform, adsAnalyticsSessionId: string, analyticsUserId: string, analyticsSessionId: number, clientInfo: ClientInfo, deviceInfo: DeviceInfo, configuration: CoreConfiguration, adsConfiguration: AdsConfiguration): IAnalyticsCommonObjectV1 {
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
                gdprEnabled: adsConfiguration.isGDPREnabled(),
                optOutRecorded: adsConfiguration.isOptOutRecorded(),
                optOutEnabled: adsConfiguration.isOptOutEnabled()
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
            timeSinceStart: appStartTime - currentTime,
            localTimeOffset: new Date().getTimezoneOffset() * -1 * 60 * 1000
        };
        return {
            type: 'ads.analytics.appRunning.v1',
            msg: appRunningEvent
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
