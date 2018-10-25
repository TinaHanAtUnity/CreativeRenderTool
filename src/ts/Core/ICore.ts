import { IApiModule, IModuleApi } from './Modules/IApiModule';
import { CacheApi } from './Native/Cache';
import { ConnectivityApi } from './Native/Connectivity';
import { DeviceInfoApi } from './Native/DeviceInfo';
import { ListenerApi } from './Native/Listener';
import { PermissionsApi } from './Native/Permissions';
import { RequestApi } from './Native/Request';
import { ResolveApi } from './Native/Resolve';
import { SdkApi } from './Native/Sdk';
import { SensorInfoApi } from './Native/SensorInfo';
import { StorageApi } from './Native/Storage';
import { BroadcastApi } from './Native/Android/Broadcast';
import { IntentApi } from './Native/Android/Intent';
import { LifecycleApi } from './Native/Android/Lifecycle';
import { AndroidPreferencesApi } from './Native/Android/Preferences';
import { MainBundleApi } from './Native/iOS/MainBundle';
import { NotificationApi } from './Native/iOS/Notification';
import { IosPreferencesApi } from './Native/iOS/Preferences';
import { UrlSchemeApi } from './Native/iOS/UrlScheme';
import { NativeBridge } from './Native/Bridge/NativeBridge';
import { CacheBookkeepingManager } from './Managers/CacheBookkeepingManager';
import { FocusManager } from './Managers/FocusManager';
import { MetaDataManager } from './Managers/MetaDataManager';
import { ResolveManager } from './Managers/ResolveManager';
import { WakeUpManager } from './Managers/WakeUpManager';
import { StorageBridge } from './Utilities/StorageBridge';
import { ConfigManager } from './Managers/ConfigManager';
import { RequestManager } from './Managers/RequestManager';
import { CacheManager } from './Managers/CacheManager';
import { JaegerManager } from './Managers/JaegerManager';
import { ClientInfo } from './Models/ClientInfo';
import { DeviceInfo } from './Models/DeviceInfo';
import { CoreConfiguration } from './Models/CoreConfiguration';
import { IAds } from '../Ads/IAds';
import { IAnalytics } from '../Analytics/IAnalytics';
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
