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
import { JaegerSpan, JaegerTags } from 'Core/Jaeger/JaegerSpan';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { UnityAdsError } from 'Core/Constants/UnityAdsError';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { HttpKafka } from 'Core/Utilities/HttpKafka';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { ABGroupBuilder } from 'Core/Models/ABGroup';
import { ConfigError } from 'Core/Errors/ConfigError';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { MetaData } from 'Core/Utilities/MetaData';

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

    public readonly NativeBridge: NativeBridge;

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

    public ClientInfo: ClientInfo;
    public DeviceInfo: DeviceInfo;
    public Config: CoreConfiguration;

    private _initialized = false;
    private _initializedAt: number;

    constructor(nativeBridge: NativeBridge) {
        this.NativeBridge = nativeBridge;

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

        this.FocusManager = new FocusManager(this);
        this.MetaDataManager = new MetaDataManager(this);
        this.WakeUpManager = new WakeUpManager(this);
        this.Request = new Request(this);
        this.CacheBookkeeping = new CacheBookkeeping(this);
        this.CacheManager = new CacheManager(this);
        this.Resolve = new Resolve(this);
        this.MetaDataManager = new MetaDataManager(this);
        this.JaegerManager = new JaegerManager(this);
    }

    public initialize(): Promise<void> {
        const jaegerInitSpan = new JaegerSpan('Initialize'); // start a span
        return this.Api.Sdk.loadComplete().then((data) => {
            jaegerInitSpan.addAnnotation('nativeBridge loadComplete');
            this.ClientInfo = new ClientInfo(data);

            if(!/^\d+$/.test(this.ClientInfo.getGameId())) {
                const message = `Provided Game ID '${this.ClientInfo.getGameId()}' is invalid. Game ID may contain only digits (0-9).`;
                this.Api.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.INVALID_ARGUMENT], message);
                return Promise.reject(message);
            }

            if(this.NativeBridge.getPlatform() === Platform.ANDROID) {
                this.DeviceInfo = new AndroidDeviceInfo(this);
            } else if(this.NativeBridge.getPlatform() === Platform.IOS) {
                this.DeviceInfo = new IosDeviceInfo(this);
            }

            this.JaegerManager.addOpenSpan(jaegerInitSpan);

            HttpKafka.setRequest(this.Request);
            HttpKafka.setClientInfo(this.ClientInfo);

            if(this.NativeBridge.getPlatform() === Platform.ANDROID) {
                this.Api.Android!.Request.setMaximumPoolSize(8);
                this.Api.Android!.Request.setKeepAliveTime(10000);
            } else {
                this.Api.Request.setConcurrentRequestCount(8);
            }

            return Promise.all([this.DeviceInfo.fetch(), this.setupTestEnvironment()]);
        }).then(() => {
            HttpKafka.setDeviceInfo(this.DeviceInfo);

            this.WakeUpManager.setListenConnectivity(true);
            if(this.NativeBridge.getPlatform() === Platform.IOS) {
                this.FocusManager.setListenAppForeground(true);
                this.FocusManager.setListenAppBackground(true);
            } else {
                this.FocusManager.setListenScreen(true);
                this.FocusManager.setListenAndroidLifecycle(true);
            }

            const configSpan = this.JaegerManager.startSpan('FetchConfiguration', jaegerInitSpan.id, jaegerInitSpan.traceId);
            let configPromise = ConfigManager.fetch(this, configSpan);

            configPromise.then(() => {
                this.JaegerManager.stop(configSpan);
            }).catch(() => {
                this.JaegerManager.stop(configSpan);
            });

            configPromise = configPromise.then((configJson): [CoreConfiguration] => {
                const coreConfig = CoreConfigurationParser.parse(configJson);
                this.Api.Sdk.logInfo('Received configuration token ' + coreConfig.getToken() + ' (A/B group ' + coreConfig.getAbGroup() + ')');
                if(this.NativeBridge.getPlatform() === Platform.IOS && this.DeviceInfo.getLimitAdTracking()) {
                    ConfigManager.storeGamerToken(this, configJson.token);
                }
                return [coreConfig];
            }).catch((error) => {
                configSpan.addTag(JaegerTags.Error, 'true');
                configSpan.addTag(JaegerTags.ErrorMessage, error.message);
                configSpan.addAnnotation(error.message);
                throw new Error(error);
            });

            const cachePromise = this.CacheBookkeeping.cleanCache().catch(error => {
                // don't fail init due to cache cleaning issues, instead just log and report diagnostics
                this.Api.Sdk.logError('Unity Ads cleaning cache failed: ' + error);
                Diagnostics.trigger('cleaning_cache_failed', error);
            });

            return Promise.all([configPromise, cachePromise]);
        }).then(([[coreConfig, adsConfig]]) => {
            this.Config = coreConfig;

            HttpKafka.setConfiguration(this.Config);
            this.JaegerManager.setJaegerTracingEnabled(this.Config.isJaegerTracingEnabled());

            if (!this.Config.isEnabled()) {
                const error = new Error('Game with ID ' + this.ClientInfo.getGameId() +  ' is not enabled');
                error.name = 'DisabledGame';
                throw error;
            }
        }).then(() => {
            this._initialized = true;
            this._initializedAt = Date.now();
            this.Api.Sdk.initComplete();
            this.JaegerManager.stop(jaegerInitSpan);

            if(this.NativeBridge.getPlatform() === Platform.ANDROID) {
                this.Api.Android!.Request.setMaximumPoolSize(1);
            } else {
                this.Api.Request.setConcurrentRequestCount(1);
            }
        }).catch(error => {
            jaegerInitSpan.addAnnotation(error.message);
            jaegerInitSpan.addTag(JaegerTags.Error, 'true');
            jaegerInitSpan.addTag(JaegerTags.ErrorMessage, error.message);
            if (this.JaegerManager) {
                this.JaegerManager.stop(jaegerInitSpan);
            }

            if(error instanceof ConfigError) {
                error = { 'message': error.message, 'name': error.name };
                this.Api.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.INITIALIZE_FAILED], error.message);
            } else if(error instanceof Error && error.name === 'DisabledGame') {
                return;
            }

            this.Api.Sdk.logError(JSON.stringify(error));
            Diagnostics.trigger('initialization_error', error);
        });
    }

    private setupTestEnvironment(): Promise<void> {
        return TestEnvironment.setup(new MetaData(this)).then(() => {
            if(TestEnvironment.get('serverUrl')) {
                ConfigManager.setTestBaseUrl(TestEnvironment.get('serverUrl'));
            }

            if(TestEnvironment.get('configUrl')) {
                ConfigManager.setTestBaseUrl(TestEnvironment.get('configUrl'));
            }

            if(TestEnvironment.get('kafkaUrl')) {
                HttpKafka.setTestBaseUrl(TestEnvironment.get('kafkaUrl'));
            }

            if(TestEnvironment.get('abGroup')) {
                // needed in both due to placement level control support
                const abGroupNumber: number = Number(TestEnvironment.get('abGroup'));
                if (!isNaN(abGroupNumber)) { // if it is a number get the group
                    const abGroup = ABGroupBuilder.getAbGroup(abGroupNumber);
                    ConfigManager.setAbGroup(abGroup);
                }
            }
        });
    }

}

export abstract class CoreModule {

    protected readonly core: Core;

    protected constructor(core: Core) {
        this.core = core;
    }

}
