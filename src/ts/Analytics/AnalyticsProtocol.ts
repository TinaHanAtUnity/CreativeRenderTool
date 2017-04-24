import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Platform } from 'Constants/Platform';

export interface IAnalyticsObject {
    type: string;
    msg: any;
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
    deviceid: string;
    sdkver: string;
    debug_device?: boolean;
}

interface IAnalyticsDeviceInfoEvent {
    ts: number;
    app_ver?: string;
    adsid?: string;
    ads_tracking?: boolean;
    os_ver?: string;
    model?: string;
    make?: string;
    app_name?: string; // bundle id
    gfx_name?: string;
    gfx_vendor?: string;
    gfx_ver?: string;
    gfx_driver?: string;
    gfx_shader?: number;
    gfx_api?: number;
    gfx_tex?: number;
    gfx_rt?: number;
    gfx_flags?: number;
    cpu?: string;
    cpu_count?: number;
    cpu_freq?: number;
    ram?: number;
    vram?: number;
    screen?: string;
    dpi?: number;
    lang?: string;
    sensors?: number;
    flags?: number;
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

interface IAnalyticsStopEvent {
    ts: number;
}

interface IAnalyticsAppRunningEvent {
    ts: number;
    duration: number;
}

export class AnalyticsProtocol {
    public static getCommonObject(platform: Platform, userId: string, sessionId: number, clientInfo: ClientInfo, deviceInfo: DeviceInfo): IAnalyticsCommonObject {
        const common: IAnalyticsCommonObjectInternal = {
            appid: 'gameid.' + clientInfo.getGameId(),
            userid: userId,
            sessionid: sessionId,
            platform: platform === Platform.IOS ? 'IPhonePlayer' : 'Android',
            platformid: platform === Platform.IOS ? 8 : 11,
            deviceid: deviceInfo.getAdvertisingIdentifier(), // todo: ios 10 limit ad tracking?
            sdkver: clientInfo.getSdkVersionName(),
            debug_device: clientInfo.getTestMode() // todo: is it ok to use testmode for this?
        };
        return {
            common: common
        };
    }

    public static getDeviceInfoObject(clientInfo: ClientInfo, deviceInfo: DeviceInfo): IAnalyticsObject {
        let screenWidth: number = deviceInfo.getScreenWidth();
        let screenHeight: number = deviceInfo.getScreenHeight();
        if(deviceInfo.getScreenHeight() > deviceInfo.getScreenWidth()) {
            screenWidth = deviceInfo.getScreenHeight();
            screenHeight = deviceInfo.getScreenWidth();
        }

        const event: IAnalyticsDeviceInfoEvent = {
            ts: Date.now(),
            app_ver: clientInfo.getApplicationVersion(),
            adsid: deviceInfo.getAdvertisingIdentifier(),
            ads_tracking: !deviceInfo.getLimitAdTracking(),
            os_ver: deviceInfo.getOsVersion(),
            model: deviceInfo.getModel(),
            make: deviceInfo.getManufacturer(), // empty for iOS
            app_name: clientInfo.getApplicationName(),
            // gfx_name?: string;
            // gfx_vendor?: string;
            // gfx_ver?: string;
            // gfx_driver?: string;
            // gfx_shader?: number;
            // gfx_api?: number;
            // gfx_tex?: number;
            // gfx_rt?: number;
            // gfx_flags?: number;
            // cpu?: string;
            // cpu_count?: number;
            // cpu_freq?: number;
            ram: deviceInfo.getTotalMemory() / (1024 * 1024),
            // vram?: number;
            screen: screenWidth + ' x ' + screenHeight,
            // dpi?: number; TODO: should be possible to get from device info but maybe not directly
            lang: deviceInfo.getLanguage(), // todo: ads probably has stuff like 'en_US', analytics has 'en'
            // sensors?: number;
            // flags?: number;
            rooted_jailbroken: deviceInfo.isRooted() ? true : undefined
        };
        return {
            type: 'analytics.deviceInfo.v1',
            msg: event
        };
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

    public static getStopObject(): IAnalyticsObject {
        const stopEvent: IAnalyticsStopEvent = {
            ts: Date.now()
        };
        return {
            type: 'analytics.appStop.v1',
            msg: stopEvent
        };
    }

    public static getRunningObject(durationInSeconds: number): IAnalyticsObject {
        const appRunningEvent: IAnalyticsAppRunningEvent = {
            ts: Date.now(),
            duration: durationInSeconds
        };
        return {
            type: 'analytics.appRunning.v1',
            msg: appRunningEvent
        };
    }
}
