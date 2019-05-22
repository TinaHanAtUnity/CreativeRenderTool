import { Ads } from 'Ads/Ads';
import { Analytics } from 'Analytics/Analytics';
import { Platform } from 'Core/Constants/Platform';
import { UnityAdsError } from 'Core/Constants/UnityAdsError';
import { ConfigError } from 'Core/Errors/ConfigError';
import { ICore, ICoreApi } from 'Core/ICore';
import { JaegerSpan, JaegerTags } from 'Core/Jaeger/JaegerSpan';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager } from 'Core/Managers/CacheManager';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { JaegerManager } from 'Core/Managers/JaegerManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ResolveManager } from 'Core/Managers/ResolveManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { toAbGroup, FilteredABTest } from 'Core/Models/ABGroup';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { UnityInfo } from 'Core/Models/UnityInfo';
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
import { CoreConfigurationParser, IRawCoreConfiguration } from 'Core/Parsers/CoreConfigurationParser';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { HttpKafka } from 'Core/Utilities/HttpKafka';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { MetaData } from 'Core/Utilities/MetaData';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { Store } from 'Store/Store';
import CreativeUrlConfiguration from 'json/CreativeUrlConfiguration.json';
import { Purchasing } from 'Purchasing/Purchasing';
import { NativeErrorApi } from 'Core/Api/NativeErrorApi';
import { DeviceIdManager } from 'Core/Managers/DeviceIdManager';

export class Core implements ICore {

    public readonly NativeBridge: NativeBridge;

    public readonly Api: Readonly<ICoreApi>;

    public readonly CacheBookkeeping: CacheBookkeepingManager;
    public readonly FocusManager: FocusManager;
    public readonly MetaDataManager: MetaDataManager;
    public readonly ResolveManager: ResolveManager;
    public readonly WakeUpManager: WakeUpManager;
    public readonly StorageBridge: StorageBridge;

    public ConfigManager: ConfigManager;
    public RequestManager: RequestManager;
    public CacheManager: CacheManager;
    public JaegerManager: JaegerManager;
    public DeviceIdManager: DeviceIdManager;
    public ClientInfo: ClientInfo;
    public DeviceInfo: DeviceInfo;
    public UnityInfo: UnityInfo;
    public Config: CoreConfiguration;

    public Analytics: Analytics;
    public Ads: Ads;
    public Purchasing: Purchasing;
    public Store: Store;

    private _initialized = false;
    private _initializedAt: number;

    constructor(nativeBridge: NativeBridge) {
        this.NativeBridge = nativeBridge;

        const platform = nativeBridge.getPlatform();
        this.Api = {
            Cache: new CacheApi(nativeBridge),
            Connectivity: new ConnectivityApi(nativeBridge),
            DeviceInfo: new DeviceInfoApi(nativeBridge),
            Listener: new ListenerApi(nativeBridge),
            Permissions: new PermissionsApi(nativeBridge),
            Request: new RequestApi(nativeBridge),
            Resolve: new ResolveApi(nativeBridge),
            Sdk: new SdkApi(nativeBridge),
            SensorInfo: new SensorInfoApi(nativeBridge),
            Storage: new StorageApi(nativeBridge),
            NativeError: new NativeErrorApi(nativeBridge),
            Android: platform === Platform.ANDROID ? {
                Broadcast: new BroadcastApi(nativeBridge),
                Intent: new IntentApi(nativeBridge),
                Lifecycle: new LifecycleApi(nativeBridge),
                Preferences: new AndroidPreferencesApi(nativeBridge)
            } : undefined,
            iOS: platform === Platform.IOS ? {
                MainBundle: new MainBundleApi(nativeBridge),
                Notification: new NotificationApi(nativeBridge),
                Preferences: new IosPreferencesApi(nativeBridge),
                UrlScheme: new UrlSchemeApi(nativeBridge)
            } : undefined
        };

        this.FocusManager = new FocusManager(this.NativeBridge.getPlatform(), this.Api);
        this.WakeUpManager = new WakeUpManager(this.Api);
        this.CacheBookkeeping = new CacheBookkeepingManager(this.Api);
        this.ResolveManager = new ResolveManager(this.Api);
        this.MetaDataManager = new MetaDataManager(this.Api);
        this.StorageBridge = new StorageBridge(this.Api);
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
                this.DeviceInfo = new AndroidDeviceInfo(this.Api);
                this.RequestManager = new RequestManager(this.NativeBridge.getPlatform(), this.Api, this.WakeUpManager, <AndroidDeviceInfo>this.DeviceInfo);
                this.DeviceIdManager = new DeviceIdManager(this.Api, <AndroidDeviceInfo>this.DeviceInfo);
            } else if(this.NativeBridge.getPlatform() === Platform.IOS) {
                this.DeviceInfo = new IosDeviceInfo(this.Api);
                this.RequestManager = new RequestManager(this.NativeBridge.getPlatform(), this.Api, this.WakeUpManager);
            }
            this.CacheManager = new CacheManager(this.Api, this.WakeUpManager, this.RequestManager, this.CacheBookkeeping);
            this.UnityInfo = new UnityInfo(this.NativeBridge.getPlatform(), this.Api);
            this.JaegerManager = new JaegerManager(this.RequestManager);
            this.JaegerManager.addOpenSpan(jaegerInitSpan);

            HttpKafka.setRequest(this.RequestManager);
            HttpKafka.setPlatform(this.NativeBridge.getPlatform());
            HttpKafka.setClientInfo(this.ClientInfo);

            if(this.NativeBridge.getPlatform() === Platform.ANDROID) {
                this.Api.Request.Android!.setKeepAliveTime(10000);
            }

            this.Api.Request.setConcurrentRequestCount(8);

            return Promise.all([this.DeviceInfo.fetch(), this.UnityInfo.fetch(this.ClientInfo.getApplicationName()), this.setupTestEnvironment()]);
        }).then(() => {
            HttpKafka.setDeviceInfo(this.DeviceInfo);
            this._initialized = true;
            this._initializedAt = Date.now();
            this.Api.Sdk.initComplete();

            this.WakeUpManager.setListenConnectivity(true);
            if(this.NativeBridge.getPlatform() === Platform.IOS) {
                this.FocusManager.setListenAppForeground(true);
                this.FocusManager.setListenAppBackground(true);
            } else {
                this.FocusManager.setListenScreen(true);
                this.FocusManager.setListenAndroidLifecycle(true);
            }

            const configSpan = this.JaegerManager.startSpan('FetchConfiguration', jaegerInitSpan.id, jaegerInitSpan.traceId);
            this.ConfigManager = new ConfigManager(this.NativeBridge.getPlatform(), this.Api, this.MetaDataManager, this.ClientInfo, this.DeviceInfo, this.UnityInfo, this.RequestManager);

            let configPromise: Promise<unknown>;
            if(TestEnvironment.get('creativeUrl')) {
                configPromise = Promise.resolve(JsonParser.parse(CreativeUrlConfiguration));
            } else {
                configPromise = this.ConfigManager.getConfig(configSpan);
            }

            configPromise.then(() => {
                this.JaegerManager.stop(configSpan);
            }).catch(() => {
                this.JaegerManager.stop(configSpan);
            });

            configPromise = configPromise.then((configJson: unknown): [unknown, CoreConfiguration] => {
                const coreConfig = CoreConfigurationParser.parse(<IRawCoreConfiguration>configJson);
                this.Api.Sdk.logInfo('Received configuration for token ' + coreConfig.getToken() + ' (A/B group ' + JSON.stringify(coreConfig.getAbGroup()) + ')');
                if(this.NativeBridge.getPlatform() === Platform.IOS && this.DeviceInfo.getLimitAdTracking()) {
                    this.ConfigManager.storeGamerToken(coreConfig.getToken());
                }

                FilteredABTest.setup(this.ClientInfo.getGameId(), coreConfig.getOrganizationId());

                return [configJson, coreConfig];
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

            return Promise.all([<Promise<[unknown, CoreConfiguration]>>configPromise, cachePromise]);
        }).then(([[configJson, coreConfig]]) => {
            this.Config = coreConfig;

            HttpKafka.setConfiguration(this.Config);
            this.JaegerManager.setJaegerTracingEnabled(this.Config.isJaegerTracingEnabled());

            if(!this.Config.isEnabled()) {
                const error = new Error('Game with ID ' + this.ClientInfo.getGameId() + ' is not enabled');
                error.name = 'DisabledGame';
                throw error;
            }

            this.Analytics = new Analytics(this);
            return Promise.all([configJson, this.Analytics.initialize()]);
        }).then(([configJson, gameSessionId]: [unknown, number]) => {
            this.Store = new Store(this);
            this.Ads = new Ads(configJson, this, this.Store);
            this.Ads.SessionManager.setGameSessionId(gameSessionId);
            this.Purchasing = new Purchasing(this);

            return this.Ads.initialize(jaegerInitSpan);
        }).then(() => {
            this.JaegerManager.stop(jaegerInitSpan);
        }).catch((error: { message: string; name: unknown }) => {
            jaegerInitSpan.addAnnotation(error.message);
            jaegerInitSpan.addTag(JaegerTags.Error, 'true');
            jaegerInitSpan.addTag(JaegerTags.ErrorMessage, error.message);
            if (this.JaegerManager) {
                this.JaegerManager.stop(jaegerInitSpan);
            }

            if(error instanceof ConfigError) {
                // tslint:disable-next-line
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
        return TestEnvironment.setup(new MetaData(this.Api)).then(() => {
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
                    const abGroup = toAbGroup(abGroupNumber);
                    ConfigManager.setAbGroup(abGroup);
                }
            }

            if(TestEnvironment.get('forceAuthorization')) {
                const value = TestEnvironment.get<string>('forceAuthorization');
                const params = value.split('|');

                if (params.length % 2 === 0) {
                    for (let i = 0; i < params.length; i += 2) {
                        RequestManager.setAuthorizationHeaderForHost(params[i], params[i + 1]);
                    }
                }
            }
        });
    }

}
