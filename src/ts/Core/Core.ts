import { Platform } from 'Core/Constants/Platform';
import { CacheBookkeeping } from 'Core/Managers/CacheBookkeeping';
import { CacheManager } from 'Core/Managers/CacheManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { JaegerManager } from 'Core/Managers/JaegerManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { Request } from 'Core/Managers/Request';
import { Resolve } from 'Core/Managers/Resolve';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { IApi, IApiModule, IModuleApi } from 'Core/Modules/ApiModule';
import { BroadcastApi } from 'Core/Native/Android/Broadcast';
import { IntentApi } from 'Core/Native/Android/Intent';
import { LifecycleApi } from 'Core/Native/Android/Lifecycle';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CacheApi } from 'Core/Native/Cache';
import { ConnectivityApi } from 'Core/Native/Connectivity';
import { DeviceInfoApi } from 'Core/Native/DeviceInfo';
import { MainBundleApi } from 'Core/Native/iOS/MainBundle';
import { NotificationApi } from 'Core/Native/iOS/Notification';
import { UrlSchemeApi } from 'Core/Native/iOS/UrlScheme';
import { ListenerApi } from 'Core/Native/Listener';
import { PermissionsApi } from 'Core/Native/Permissions';
import { RequestApi } from 'Core/Native/Request';
import { ResolveApi } from 'Core/Native/Resolve';
import { SdkApi } from 'Core/Native/Sdk';
import { SensorInfoApi } from 'Core/Native/SensorInfo';
import { StorageApi } from 'Core/Native/Storage';
import { Logger } from 'Core/Utilities/Logger';
import { AndroidCacheApi } from 'Core/Native/Android/Cache';
import { AndroidDeviceInfoApi } from 'Core/Native/Android/DeviceInfo';
import { AndroidPermissionsApi } from 'Core/Native/Android/Permissions';
import { AndroidPreferencesApi } from 'Core/Native/Android/Preferences';
import { AndroidRequestApi } from 'Core/Native/Android/Request';
import { AndroidSensorInfoApi } from 'Core/Native/Android/SensorInfo';
import { IosCacheApi } from 'Core/Native/iOS/Cache';
import { IosDeviceInfoApi } from 'Core/Native/iOS/DeviceInfo';
import { IosPermissionsApi } from 'Core/Native/iOS/Permissions';
import { IosPreferencesApi } from 'Core/Native/iOS/Preferences';
import { IosSensorInfoApi } from 'Core/Native/iOS/SensorInfo';

export interface ICoreAndroidApi extends IApi {
    Broadcast: BroadcastApi;
    Cache: AndroidCacheApi;
    DeviceInfo: AndroidDeviceInfoApi;
    Intent: IntentApi;
    Lifecycle: LifecycleApi;
    Permissions: AndroidPermissionsApi;
    Preferences: AndroidPreferencesApi;
    Request: AndroidRequestApi;
    SensorInfo: AndroidSensorInfoApi;
}

export interface ICoreIosApi extends IApi {
    Cache: IosCacheApi;
    DeviceInfo: IosDeviceInfoApi;
    MainBundle: MainBundleApi;
    Notification: NotificationApi;
    Permissions: IosPermissionsApi;
    Preferences: IosPreferencesApi;
    SensorInfo: IosSensorInfoApi;
    UrlScheme: UrlSchemeApi;
}

export interface ICoreApi extends IModuleApi {
    Cache: CacheApi;
    Connectivity: ConnectivityApi;
    DeviceInfo: DeviceInfoApi;
    Listener: ListenerApi;
    Permissions: PermissionsApi;
    Request: RequestApi;
    Resolve: ResolveApi;
    Sdk: SdkApi;
    SensorInfo: SensorInfoApi;
    Storage: StorageApi;
    Android?: ICoreAndroidApi;
    iOS?: ICoreIosApi;
}

export class Core implements IApiModule<ICoreApi> {

    public readonly Api: ICoreApi;

    public readonly CacheManager: CacheManager;
    public readonly CacheBookkeeping: CacheBookkeeping;
    // public ConfigManager: ConfigManager;
    public readonly FocusManager: FocusManager;
    public readonly JaegerManager: JaegerManager;
    public readonly MetaDataManager: MetaDataManager;
    public readonly Request: Request;
    public readonly Resolve: Resolve;
    public readonly WakeUpManager: WakeUpManager;

    private readonly _platform: Platform;
    private _apiLevel?: number;

    constructor(nativeBridge: NativeBridge) {
        const api: ICoreApi = {
            Cache: new CacheApi(nativeBridge),
            Connectivity: new ConnectivityApi(nativeBridge),
            DeviceInfo: new DeviceInfoApi(nativeBridge),
            Listener: new ListenerApi(nativeBridge),
            Permissions: new PermissionsApi(nativeBridge),
            Request: new RequestApi(nativeBridge),
            Resolve: new ResolveApi(nativeBridge),
            Sdk: new SdkApi(nativeBridge),
            SensorInfo: new SensorInfoApi(nativeBridge),
            Storage: new StorageApi(nativeBridge)
        };

        const platform = nativeBridge.getPlatform();
        if(platform === Platform.ANDROID) {
            api.Android = {
                Broadcast: new BroadcastApi(nativeBridge),
                Cache: new AndroidCacheApi(nativeBridge),
                DeviceInfo: new AndroidDeviceInfoApi(nativeBridge),
                Intent: new IntentApi(nativeBridge),
                Lifecycle: new LifecycleApi(nativeBridge),
                Permissions: new AndroidPermissionsApi(nativeBridge),
                Preferences: new AndroidPreferencesApi(nativeBridge),
                Request: new AndroidRequestApi(nativeBridge),
                SensorInfo: new AndroidSensorInfoApi(nativeBridge)
            };
        } else if(platform === Platform.IOS) {
            api.iOS = {
                Cache: new IosCacheApi(nativeBridge),
                DeviceInfo: new IosDeviceInfoApi(nativeBridge),
                MainBundle: new MainBundleApi(nativeBridge),
                Notification: new NotificationApi(nativeBridge),
                Permissions: new IosPermissionsApi(nativeBridge),
                Preferences: new IosPreferencesApi(nativeBridge),
                SensorInfo: new IosSensorInfoApi(nativeBridge),
                UrlScheme: new UrlSchemeApi(nativeBridge)
            };
        }

        this.Api = api;

        Logger.setSdk(this.Api.Sdk);

        this.FocusManager = new FocusManager(this);
        this.MetaDataManager = new MetaDataManager(this);
        this.WakeUpManager = new WakeUpManager(this);
        this.Request = new Request(this, this.WakeUpManager);
        this.CacheBookkeeping = new CacheBookkeeping(this);
        this.CacheManager = new CacheManager(this);
        this.Resolve = new Resolve(this);
        this.MetaDataManager = new MetaDataManager(this);
        this.JaegerManager = new JaegerManager(this);
    }

    public setApiLevel(apiLevel: number) {
        this._apiLevel = apiLevel;
    }

    public getApiLevel(): number | undefined {
        return this._apiLevel;
    }

    public getPlatform(): Platform {
        return this._platform;
    }

}

export abstract class CoreModule {

    protected readonly core: Core;

    protected constructor(core: Core) {
        this.core = core;
    }

}
