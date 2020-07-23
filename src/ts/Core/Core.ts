import { Ads } from 'Ads/Ads';
import { Platform } from 'Core/Constants/Platform';
import { UnityAdsError } from 'Core/Constants/UnityAdsError';
import { ConfigError } from 'Core/Errors/ConfigError';
import { InitializationError } from 'Core/Errors/InitializationError';
import { ICore, ICoreApi } from 'Core/ICore';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager } from 'Core/Managers/CacheManager';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { JaegerManager } from 'Core/Managers/JaegerManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ResolveManager } from 'Core/Managers/ResolveManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { toAbGroup, FilteredABTest, GooglePlayDetectionTest } from 'Core/Models/ABGroup';
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
import { SdkApi, InitErrorCode } from 'Core/Native/Sdk';
import { SensorInfoApi } from 'Core/Native/SensorInfo';
import { StorageApi } from 'Core/Native/Storage';
import { CoreConfigurationParser, IRawCoreConfiguration } from 'Core/Parsers/CoreConfigurationParser';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { HttpKafka } from 'Core/Utilities/HttpKafka';
import { MetaData } from 'Core/Utilities/MetaData';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import CreativeUrlConfiguration from 'json/CreativeUrlConfiguration.json';
import { NativeErrorApi } from 'Core/Api/NativeErrorApi';
import { SDKMetrics, InitializationMetric, MiscellaneousMetric, InitializationFailureMetric } from 'Ads/Utilities/SDKMetrics';
import { SdkDetectionInfo } from 'Core/Models/SdkDetectionInfo';
import { ClassDetectionApi } from 'Core/Native/ClassDetection';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { NoGzipCacheManager } from 'Core/Managers/NoGzipCacheManager';
import { createMetricInstance } from 'Ads/Networking/MetricInstance';
import { createStopwatch } from 'Core/Utilities/Stopwatch';
import { IsMadeWithUnity } from 'Ads/Utilities/IsMadeWithUnity';
import { TrackingManagerApi } from 'Core/Native/iOS/TrackingManager';

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
    public ClientInfo: ClientInfo;
    public DeviceInfo: DeviceInfo;
    public SdkDetectionInfo: SdkDetectionInfo;
    public UnityInfo: UnityInfo;
    public Config: CoreConfiguration;

    public Ads: Ads;

    constructor(nativeBridge: NativeBridge) {
        this.NativeBridge = nativeBridge;

        const platform = nativeBridge.getPlatform();
        this.Api = {
            Cache: new CacheApi(nativeBridge),
            Connectivity: new ConnectivityApi(nativeBridge),
            DeviceInfo: new DeviceInfoApi(nativeBridge),
            ClassDetection: new ClassDetectionApi(nativeBridge),
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
                UrlScheme: new UrlSchemeApi(nativeBridge),
                TrackingManager: new TrackingManagerApi(nativeBridge)
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
        SDKMetrics.initialize();

        let loadTime: number;
        if (performance && performance.now) {
            loadTime = performance.now();
        }
        const measurements = createStopwatch();
        return this.Api.Sdk.loadComplete().then((data) => {
            this.ClientInfo = new ClientInfo(data);

            if (!/^\d+$/.test(this.ClientInfo.getGameId())) {
                return Promise.reject(new InitializationError(InitErrorCode.InvalidArgument, `Unity Ads SDK fail to initialize due to provided Game ID '${this.ClientInfo.getGameId() }' is invalid. Game ID may contain only digits (0-9).`));
            }

            if (this.NativeBridge.getPlatform() === Platform.ANDROID) {
                this.DeviceInfo = new AndroidDeviceInfo(this.Api);
                this.RequestManager = new RequestManager(this.NativeBridge.getPlatform(), this.Api, this.WakeUpManager, <AndroidDeviceInfo> this.DeviceInfo);
            } else if (this.NativeBridge.getPlatform() === Platform.IOS) {
                this.DeviceInfo = new IosDeviceInfo(this.Api);
                this.RequestManager = new RequestManager(this.NativeBridge.getPlatform(), this.Api, this.WakeUpManager);
            }
            if (CustomFeatures.isNoGzipGame(this.ClientInfo.getGameId())) {
                this.CacheManager = new NoGzipCacheManager(this.Api, this.WakeUpManager, this.RequestManager, this.CacheBookkeeping);
            } else {
                this.CacheManager = new CacheManager(this.Api, this.WakeUpManager, this.RequestManager, this.CacheBookkeeping);
            }
            this.UnityInfo = new UnityInfo(this.NativeBridge.getPlatform(), this.Api);
            this.JaegerManager = new JaegerManager(this.RequestManager);
            this.SdkDetectionInfo = new SdkDetectionInfo(this.NativeBridge.getPlatform(), this.Api);

            HttpKafka.setRequest(this.RequestManager);
            HttpKafka.setPlatform(this.NativeBridge.getPlatform());
            HttpKafka.setClientInfo(this.ClientInfo);

            if (this.NativeBridge.getPlatform() === Platform.ANDROID) {
                this.Api.Request.Android!.setKeepAliveTime(10000);
            }

            this.Api.Request.setConcurrentRequestCount(8);

            if (this.NativeBridge.getPlatform() === Platform.IOS) {
                Promise.all([
                    this.Api.DeviceInfo.Ios!.getDeviceName(),
                    this.Api.DeviceInfo.Ios!.getVendorIdentifier(),
                    this.Api.DeviceInfo.Ios!.getLocaleList(),
                    this.Api.DeviceInfo.Ios!.getCurrentUITheme(),
                    this.Api.DeviceInfo.Ios!.getAdNetworkIdsPlist(),
                    this.Api.DeviceInfo.Ios!.getSystemBootTime()
                ]).then(([deviceName, vendorIdentifer, localeList, currentTheme, adNetworks, systemBootTime]) => {
                    this.Api.Sdk.logInfo(`[Test] Device name: ${deviceName}`);
                    this.Api.Sdk.logInfo(`[Test] Vendor identifier: ${vendorIdentifer}`);
                    this.Api.Sdk.logInfo(`[Test] Locale list: ${localeList.join(', ')}`);
                    this.Api.Sdk.logInfo(`[Test] Current theme: ${currentTheme}`);
                    this.Api.Sdk.logInfo(`[Test] Ad Networks: ${adNetworks}`);
                    this.Api.Sdk.logInfo(`[Test] System boot time: ${systemBootTime}`);
                }).catch(err => {
                    this.Api.Sdk.logError(`[Test] Failed to get one of the new fields. Error: ${err}`);
                });
            }

            measurements.reset();
            measurements.start();

            return Promise.all([this.DeviceInfo.fetch(), this.SdkDetectionInfo.detectSdks(), this.UnityInfo.fetch(this.ClientInfo.getApplicationName()), this.setupTestEnvironment()]);
        }).then(() => {

            // Temporary for GAID Investigation. Do not apply above 3.4.0
            if (this.DeviceInfo instanceof AndroidDeviceInfo) {
                SDKMetrics.reportMetricEventWithTags(MiscellaneousMetric.GAIDInvestigation, {
                    'gaid': `${!!this.DeviceInfo.get('advertisingIdentifier')}`,
                    'pkg': `${!!this.DeviceInfo.get('isGoogleStoreInstalled')}`
                });
            }

            measurements.stopAndSend(
                InitializationMetric.WebviewInitializationPhases, {
                'wel': 'undefined',
                'stg': 'device_info_collection'
            });
            HttpKafka.setDeviceInfo(this.DeviceInfo);
            this.WakeUpManager.setListenConnectivity(true);
            this.Api.Sdk.logInfo('mediation detection is:' + this.SdkDetectionInfo.getSdkDetectionJSON());
            if (this.NativeBridge.getPlatform() === Platform.IOS) {
                this.FocusManager.setListenAppForeground(true);
                this.FocusManager.setListenAppBackground(true);
            } else {
                this.FocusManager.setListenScreen(true);
                this.FocusManager.setListenAndroidLifecycle(true);
            }

            this.ConfigManager = new ConfigManager(this.NativeBridge.getPlatform(), this.Api, this.MetaDataManager, this.ClientInfo, this.DeviceInfo, this.UnityInfo, this.RequestManager);

            measurements.reset();
            measurements.start();

            let configPromise: Promise<unknown>;
            if (TestEnvironment.get('creativeUrl')) {
                configPromise = Promise.resolve(CreativeUrlConfiguration);
            } else {
                configPromise = this.ConfigManager.getConfig();
            }

            configPromise = configPromise.then((configJson: unknown): [unknown, CoreConfiguration] => {
                measurements.stopAndSend(
                    InitializationMetric.WebviewInitializationPhases, {
                    'wel': 'undefined',
                    'stg': 'config_request_received'
                });
                const coreConfig = CoreConfigurationParser.parse(<IRawCoreConfiguration>configJson);
                this.Api.Sdk.logInfo('Received configuration for token ' + coreConfig.getToken() + ' (A/B group ' + JSON.stringify(coreConfig.getAbGroup()) + ')');
                if (this.NativeBridge.getPlatform() === Platform.IOS && this.DeviceInfo.getLimitAdTracking()) {
                    this.ConfigManager.storeGamerToken(coreConfig.getToken());
                }

                FilteredABTest.setup(this.ClientInfo.getGameId(), coreConfig.getOrganizationId());

                return [configJson, coreConfig];
            });

            const cachePromise = this.CacheBookkeeping.cleanCache().catch(error => {
                // don't fail init due to cache cleaning issues, instead just log and report diagnostics
                this.Api.Sdk.logError('Unity Ads cleaning cache failed: ' + error);
                Diagnostics.trigger('cleaning_cache_failed', error);
            });

            return Promise.all([<Promise<[unknown, CoreConfiguration]>>configPromise, cachePromise]);
        }).then(([[configJson, coreConfig]]) => {
            this.Config = coreConfig;

            if (this.DeviceInfo instanceof AndroidDeviceInfo && GooglePlayDetectionTest.isValid(this.Config.getAbGroup())) {
                this.DeviceInfo.set('isGoogleStoreInstalled', true);
            }

            SDKMetrics.setMetricInstance(createMetricInstance(this.NativeBridge.getPlatform(), this.RequestManager, this.ClientInfo, this.DeviceInfo, this.Config.getCountry()));

            // tslint:disable-next-line:no-any
            const nativeInitTime = (<number>(<any>window).initTimestamp) - this.ClientInfo.getInitTimestamp();

            if (nativeInitTime > 0 && nativeInitTime <= 30000) {
                SDKMetrics.reportTimingEvent(InitializationMetric.NativeInitialization, nativeInitTime);
            }

            if (loadTime) {
                SDKMetrics.reportTimingEvent(InitializationMetric.WebviewLoad, loadTime);
            }

            HttpKafka.setConfiguration(this.Config);
            this.JaegerManager.setJaegerTracingEnabled(this.Config.isJaegerTracingEnabled());

            if (!this.Config.isEnabled()) {
                throw new InitializationError(InitErrorCode.GameIdDisabled, 'Unity Ads SDK fail to initialize due to game with ID ' + this.ClientInfo.getGameId() + ' is not enabled');
            }

            return configJson;
        }).then((configJson: unknown) => {
            this.Ads = new Ads(configJson, this);

            return this.Ads.initialize().then(() => {
                SDKMetrics.sendBatchedEvents();
                IsMadeWithUnity.sendIsMadeWithUnity(this.Api.Storage, this.SdkDetectionInfo);
            });
        }).catch((error: unknown) => {
            this.handleInitializationError(error);
        });
    }

    private handleInitializationError(err: unknown) {
        let message: string = 'Unity Ads SDK fail to initialize due to internal error';
        let errorCode: InitErrorCode = InitErrorCode.Unknown;

        if (err instanceof InitializationError) {
            errorCode = err.errorCode;
            message = err.message;
        }

        if (err instanceof ConfigError) {
            errorCode = InitErrorCode.ConfigurationError;
            message = 'Unity Ads SDK fail to initialize due to configuration error';
        }

        this.Api.Sdk.initError(message, errorCode);
        this.Api.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.INITIALIZE_FAILED], message);
        this.Api.Sdk.logError(`Initialization error: ${message}`);
        SDKMetrics.reportMetricEventWithTags(InitializationFailureMetric.InitializeFailed, { 'rsn': InitErrorCode[errorCode] });
    }

    private setupTestEnvironment(): Promise<void> {
        return TestEnvironment.setup(new MetaData(this.Api)).then(() => {
            if (TestEnvironment.get('serverUrl')) {
                ConfigManager.setTestBaseUrl(TestEnvironment.get('serverUrl'));
            }

            if (TestEnvironment.get('configUrl')) {
                ConfigManager.setTestBaseUrl(TestEnvironment.get('configUrl'));
            }

            if (TestEnvironment.get('kafkaUrl')) {
                HttpKafka.setTestBaseUrl(TestEnvironment.get('kafkaUrl'));
            }

            if (TestEnvironment.get('country')) {
                ConfigManager.setCountry(TestEnvironment.get('country'));
            }

            const abGroupNumber = parseInt(TestEnvironment.get('abGroup'), 10);
            if (!isNaN(abGroupNumber)) { // if it is a number get the group
                const abGroup = toAbGroup(abGroupNumber);
                ConfigManager.setAbGroup(abGroup);
            }

            if (TestEnvironment.get('forceAuthorization')) {
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
