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

export interface ICoreAndroidApi extends IApi {
    Broadcast: BroadcastApi;
    Intent: IntentApi;
    Lifecycle: LifecycleApi;
}

export interface ICoreIosApi extends IApi {
    MainBundle: MainBundleApi;
    Notification: NotificationApi;
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
                Intent: new IntentApi(nativeBridge),
                Lifecycle: new LifecycleApi(nativeBridge)
            };
        } else if(platform === Platform.IOS) {
            api.iOS = {
                MainBundle: new MainBundleApi(nativeBridge),
                Notification: new NotificationApi(nativeBridge),
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
