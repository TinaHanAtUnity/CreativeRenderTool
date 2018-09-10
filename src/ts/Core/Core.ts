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

    public Api: ICoreApi;

    public CacheManager: CacheManager;
    public CacheBookkeeping: CacheBookkeeping;
    // public ConfigManager: ConfigManager;
    public FocusManager: FocusManager;
    public JaegerManager: JaegerManager;
    public MetaDataManager: MetaDataManager;
    public Request: Request;
    public Resolve: Resolve;
    public WakeUpManager: WakeUpManager;

    public load(nativeBridge: NativeBridge): void {
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
    }

    public initialize(nativeBridge: NativeBridge) {
        Logger.setSdk(this.Api.Sdk);
        this.FocusManager = new FocusManager(this.Api.Android!.Broadcast, this.Api.iOS!.Notification, this.Api.Android!.Lifecycle);
        this.MetaDataManager = new MetaDataManager(this.Api.Storage);
        this.WakeUpManager = new WakeUpManager(this.Api.Connectivity, this.FocusManager);
        this.Request = new Request(nativeBridge.getPlatform(), nativeBridge.getApiLevel(), this.Api.Request, this.WakeUpManager);
        this.CacheBookkeeping = new CacheBookkeeping(this.Api.Cache, this.Api.Storage);
        this.CacheManager = new CacheManager(this.Api.Cache, this.Api.Storage, this.WakeUpManager, this.Request, this.CacheBookkeeping);
        this.Resolve = new Resolve(this.Api.Resolve);
        this.MetaDataManager = new MetaDataManager(this.Api.Storage);
        this.JaegerManager = new JaegerManager(this.Request);
    }

}

export abstract class CoreModule {

    protected readonly core: Core;

    protected constructor(core: Core) {
        this.core = core;
    }

}
