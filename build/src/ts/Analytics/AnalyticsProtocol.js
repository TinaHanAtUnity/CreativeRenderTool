import { Platform } from 'Core/Constants/Platform';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';
export class AnalyticsProtocol {
    static getCommonObject(platform, adsAnalyticsSessionId, analyticsUserId, analyticsSessionId, clientInfo, deviceInfo, configuration, privacySDK) {
        const limitAdTracking = deviceInfo.getLimitAdTracking() ? true : false;
        const maybeOrganizationId = configuration.getOrganizationId();
        const organizationId = maybeOrganizationId ? maybeOrganizationId : '';
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
    static createAppStartEvent() {
        const startEvent = {
            ts: Date.now()
        };
        return {
            type: 'ads.analytics.appStart.v1',
            msg: startEvent
        };
    }
    static createAppInstallEvent(clientInfo, appStartTime) {
        const currentTime = Date.now();
        const installEvent = {
            ts: currentTime,
            appVersion: clientInfo.getApplicationVersion(),
            timeSinceStart: currentTime - appStartTime
        };
        return {
            type: 'ads.analytics.appInstall.v1',
            msg: installEvent
        };
    }
    static createAppUpdateEvent(clientInfo, appStartTime) {
        const currentTime = Date.now();
        const updateEvent = {
            ts: currentTime,
            appVersion: clientInfo.getApplicationVersion(),
            timeSinceStart: currentTime - appStartTime
        };
        return {
            type: 'ads.analytics.appUpdate.v1',
            msg: updateEvent
        };
    }
    static createAppRunningEvent(appStartTime) {
        const currentTime = Date.now();
        const appRunningEvent = {
            ts: currentTime,
            timeSinceStart: currentTime - appStartTime,
            localTimeOffset: new Date().getTimezoneOffset() * -1 * 60 * 1000
        };
        return {
            type: 'ads.analytics.appRunning.v1',
            msg: appRunningEvent
        };
    }
    static createTransactionEvent(transaction, platform) {
        const currentTime = Date.now();
        const transactionEvent = {
            ts: currentTime,
            productId: transaction.getProductId(),
            price: transaction.getPrice(),
            currencyCode: transaction.getCurrency(),
            eventId: JaegerUtilities.uuidv4(),
            receipt: {
                appStore: platform === Platform.ANDROID ? 'GooglePlay' : 'AppleAppStore',
                transactionId: transaction.getTransactionId(),
                payload: transaction.getReceipt()
            }
        };
        return {
            type: 'ads.analytics.transactionSuccess.v1',
            msg: transactionEvent
        };
    }
    static getOsVersion(platform, deviceInfo) {
        if (platform === Platform.IOS) {
            return 'iOS ' + deviceInfo.getOsVersion();
        }
        else if (platform === Platform.ANDROID && deviceInfo instanceof AndroidDeviceInfo) {
            return 'Android OS ' + deviceInfo.getOsVersion() + ' / API-' + deviceInfo.getApiLevel();
        }
        else {
            return '';
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl0aWNzUHJvdG9jb2wuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdHMvQW5hbHl0aWNzL0FuYWx5dGljc1Byb3RvY29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUtsRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFnRTlELE1BQU0sT0FBTyxpQkFBaUI7SUFDbkIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxRQUFrQixFQUFFLHFCQUE2QixFQUFFLGVBQXVCLEVBQUUsa0JBQTBCLEVBQUUsVUFBc0IsRUFBRSxVQUFzQixFQUFFLGFBQWdDLEVBQUUsVUFBc0I7UUFDMU8sTUFBTSxlQUFlLEdBQVksVUFBVSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ2hGLE1BQU0sbUJBQW1CLEdBQUcsYUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDOUQsTUFBTSxjQUFjLEdBQVcsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDOUUsT0FBTztZQUNILE1BQU0sRUFBRTtnQkFDSixNQUFNLEVBQUUsVUFBVSxDQUFDLFNBQVMsRUFBRTtnQkFDOUIsY0FBYyxFQUFFLGNBQWM7Z0JBQzlCLGVBQWUsRUFBRSxlQUFlO2dCQUNoQyxrQkFBa0IsRUFBRSxHQUFHLGtCQUFrQixFQUFFO2dCQUMzQyxTQUFTLEVBQUUscUJBQXFCO2dCQUNoQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQztnQkFDNUIsYUFBYSxFQUFFLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRTtnQkFDN0MsVUFBVSxFQUFFLGFBQWEsQ0FBQyxRQUFRLEVB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