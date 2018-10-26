import { IAds } from 'Ads/IAds';
import { IAnalytics } from 'Analytics/IAnalytics';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager } from 'Core/Managers/CacheManager';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { JaegerManager } from 'Core/Managers/JaegerManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ResolveManager } from 'Core/Managers/ResolveManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IApiModule, IModuleApi } from 'Core/Modules/IApiModule';
import { BroadcastApi } from 'Core/Native/Android/Broadcast';
import { IntentApi } from 'Core/Native/Android/Intent';
import { LifecycleApi } from 'Core/Native/Android/Lifecycle';
import { AndroidPreferencesApi } from 'Core/Native/Android/Preferences';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CacheApi } from 'Core/Native/Cache';
import { ConnectivityApi } from 'Core/Native/Connectivity';
import { DeviceInfoApi } from 'Core/Native/DeviceInfo';
import { MainBundleApi } from 'Core/Native/iOS/MainBundle';
import { NotificationApi } from 'Core/Native/iOS/Notification';
import { IosPreferencesApi } from 'Core/Native/iOS/Preferences';
import { UrlSchemeApi } from 'Core/Native/iOS/UrlScheme';
import { ListenerApi } from 'Core/Native/Listener';
import { PermissionsApi } from 'Core/Native/Permissions';
import { RequestApi } from 'Core/Native/Request';
import { ResolveApi } from 'Core/Native/Resolve';
import { SdkApi } from 'Core/Native/Sdk';
import { SensorInfoApi } from 'Core/Native/SensorInfo';
import { StorageApi } from 'Core/Native/Storage';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { IPurchasing } from 'Purchasing/IPurchasing';

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
    Android?: {
        Broadcast: BroadcastApi;
        Intent: IntentApi;
        Lifecycle: LifecycleApi;
        Preferences: AndroidPreferencesApi;
    };
    iOS?: {
        MainBundle: MainBundleApi;
        Notification: NotificationApi;
        Preferences: IosPreferencesApi;
        UrlScheme: UrlSchemeApi;
    };
}

export interface ICore extends IApiModule {
    NativeBridge: NativeBridge;
    Api: Readonly<ICoreApi>;
    CacheBookkeeping: CacheBookkeepingManager;
    FocusManager: FocusManager;
    MetaDataManager: MetaDataManager;
    ResolveManager: ResolveManager;
    WakeUpManager: WakeUpManager;
    StorageBridge: StorageBridge;
    ConfigManager: ConfigManager;
    RequestManager: RequestManager;
    CacheManager: CacheManager;
    JaegerManager: JaegerManager;
    ClientInfo: ClientInfo;
    DeviceInfo: DeviceInfo;
    Config: CoreConfiguration;
    Ads: IAds;
    Analytics: IAnalytics;
    Purchasing: IPurchasing;
}
