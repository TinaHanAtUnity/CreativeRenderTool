import { Platform } from 'Core/Constants/Platform';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { ICoreApi } from 'Core/ICore';

export interface IAnalyticsObject {
    type: string;
    msg: IAnalyticsDeviceInfoEvent | IAnalyticsStartEvent | IAnalyticsInstallEvent | IAnalyticsUpdateEvent | IAnalyticsAppRunningEvent;
}

export interface IAnalyticsCommonObject {
    common: IAnalyticsCommonObjectInternal;
}

interface IAnalyticsCommonObjectInternal {
    appid: string;
    userid: string;
    sessionid: number;
    platform: string;
    platformid: number;
    sdk_ver: string;
    adsid: string | undefined | null;
    ads_tracking: boolean;
    ads_coppa: boolean;
    ads_gameid: string;
    ads_sdk: boolean;
}

interface IAnalyticsDeviceInfoEvent {
    ts: number;
    app_ver: string;
    adsid: string | undefined | null;
    ads_tracking: boolean;
    os_ver: string;
    model: string;
    app_name: string;
    ram: number;
    screen: string;
    lang: string;
    rooted_jailbroken?: boolean;
}

interface IAnalyticsStartEvent {
    ts: number;
}

interface IAnalyticsInstallEvent {
    ts: number;
    app_ver: string;
}

interface IAnalyticsUpdateEvent {
    ts: number;
    app_ver: string;
}

interface IAnalyticsAppRunningEvent {
    ts: number;
    duration: number;
    local_time_offset: number;
}

export class AnalyticsProtocol {
    public static getCommonObject(platform: Platform, userId: string, sessionId: number, clientInfo: ClientInfo, deviceInfo: DeviceInfo, configuration: CoreConfiguration): IAnalyticsCommonObject {
        const common: IAnalyticsCommonObjectInternal = {
            appid: configuration.getUnityProjectId(),
            userid: userId,
            sessionid: sessionId,
            platform: platform === Platform.IOS ? 'IPhonePlayer' : 'AndroidPlayer',
            platformid: platform === Platform.IOS ? 8 : 11,
            sdk_ver: clientInfo.getSdkVersionName(),
            adsid: AnalyticsProtocol.getAdvertisingIdentifier(deviceInfo),
            ads_tracking: deviceInfo.getLimitAdTracking() ? false : true, // intentionally inverted value
            ads_coppa: configuration.isCoppaCompliant(),
            ads_gameid: clientInfo.getGameId(),
            ads_sdk: true
        };
        return {
            common: common
        };
    }

    public static getDeviceInfoObject(platform: Platform, core: ICoreApi, clientInfo: ClientInfo, deviceInfo: DeviceInfo): Promise<IAnalyticsObject> {
        return Promise.all([
            AnalyticsProtocol.getScreen(platform, core, deviceInfo),
            AnalyticsProtocol.getDeviceModel(platform, core, deviceInfo)
        ]).then(([screen, model]) => {
            const event: IAnalyticsDeviceInfoEvent = {
                ts: Date.now(),
                app_ver: clientInfo.getApplicationVersion(),
                adsid: deviceInfo.getAdvertisingIdentifier(),
                ads_tracking: deviceInfo.getLimitAdTracking() ? false : true, // intentionally inverted value
                os_ver: AnalyticsProtocol.getOsVersion(platform, deviceInfo),
                model: model,
                app_name: clientInfo.getApplicationName(),
                ram: Math.round(deviceInfo.getTotalMemory() / 1024), // convert DeviceInfo kilobytes to analytics megabytes
                screen: screen,
                lang: deviceInfo.getLanguage().split('_')[0],
                rooted_jailbroken: deviceInfo.isRooted() ? true : false
            };

            return {
                type: 'analytics.deviceInfo.v1',
                msg: event
            };
        });
    }

    public static getStartObject(): IAnalyticsObject {
        const startEvent: IAnalyticsStartEvent = {
            ts: Date.now()
        };
        return {
            type: 'analytics.appStart.v1',
            msg: startEvent
        };
    }

    public static getInstallObject(clientInfo: ClientInfo): IAnalyticsObject {
        const installEvent: IAnalyticsInstallEvent = {
            ts: Date.now(),
            app_ver: clientInfo.getApplicationVersion()
        };
        return {
            type: 'analytics.appInstall.v1',
            msg: installEvent
        };
    }

    public static getUpdateObject(clientInfo: ClientInfo): IAnalyticsObject {
        const updateEvent: IAnalyticsUpdateEvent = {
            ts: Date.now(),
            app_ver: clientInfo.getApplicationVersion()
        };
        return {
            type: 'analytics.appUpdate.v1',
            msg: updateEvent
        };
    }

    public static getRunningObject(durationInSeconds: number): IAnalyticsObject {
        const appRunningEvent: IAnalyticsAppRunningEvent = {
            ts: Date.now(),
            duration: durationInSeconds,
            local_time_offset: new Date().getTimezoneOffset() * -1 * 60 * 1000
        };
        return {
            type: 'analytics.appRunning.v1',
            msg: appRunningEvent
        };
    }

    private static getAdvertisingIdentifier(deviceInfo: DeviceInfo): string | undefined {
        const adsid: string | undefined | null = deviceInfo.getAdvertisingIdentifier();

        if(adsid) {
            return adsid.toLowerCase();
        } else {
            return undefined;
        }
    }

    private static getScreen(platform: Platform, core: ICoreApi, deviceInfo: DeviceInfo): Promise<string> {
        if(platform === Platform.IOS) {
            return Promise.all([
                deviceInfo.getScreenWidth(),
                deviceInfo.getScreenHeight(),
                core.DeviceInfo.Ios!.isStatusBarHidden(),
                core.DeviceInfo.Ios!.getStatusBarHeight()
            ]).then(([width, height, statusBarHidden, statusBarHeight]) => {
                let screenWidth = width;
                let screenHeight = height;

                if(!statusBarHidden) {
                    screenHeight = screenHeight + statusBarHeight;
                }

                if (screenHeight > screenWidth) {
                    screenWidth = height;
                    screenHeight = width;
                }

                if(deviceInfo instanceof IosDeviceInfo) {
                    screenWidth = screenWidth * deviceInfo.getScreenScale();
                    screenHeight = screenHeight * deviceInfo.getScreenScale();
                }

                return Promise.resolve(screenWidth + ' x ' + screenHeight);
            });
        } else {
            return Promise.all([
                deviceInfo.getScreenWidth(),
                deviceInfo.getScreenHeight()
            ]).then(([width, height]) => {
                let screenWidth = width;
                let screenHeight = height;
                if (screenHeight > screenWidth) {
                    screenWidth = height;
                    screenHeight = width;
                }

                return Promise.resolve(screenWidth + ' x ' + screenHeight);
            });
        }
    }

    private static getDeviceModel(platform: Platform, core: ICoreApi, deviceInfo: DeviceInfo): Promise<string> {
        if(platform === Platform.IOS) {
            return Promise.resolve(deviceInfo.getModel());
        } else if (platform === Platform.ANDROID && deviceInfo instanceof AndroidDeviceInfo) {
            return core.DeviceInfo.Android!.getDevice().then(device => {
                return deviceInfo.getManufacturer() + '/' + deviceInfo.getModel() + '/' + device;
            });
        } else {
            return Promise.resolve('');
        }
    }

    private static getOsVersion(platform: Platform, deviceInfo: DeviceInfo): string {
        if(platform === Platform.IOS) {
            return 'iOS ' + deviceInfo.getOsVersion();
        } else if (platform === Platform.ANDROID && deviceInfo instanceof AndroidDeviceInfo) {
            return 'Android OS ' + deviceInfo.getOsVersion() + ' / API-' + deviceInfo.getApiLevel();
        } else {
            return '';
        }
    }
}
