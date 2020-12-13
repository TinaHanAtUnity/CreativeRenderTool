import { Ads } from 'Ads/Ads';
import { Platform } from 'Core/Constants/Platform';
import { UnityAdsError } from 'Core/Constants/UnityAdsError';
import { ConfigError } from 'Core/Errors/ConfigError';
import { InitializationError } from 'Core/Errors/InitializationError';
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
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { UnityInfo } from 'Core/Models/UnityInfo';
import { BroadcastApi } from 'Core/Native/Android/Broadcast';
import { IntentApi } from 'Core/Native/Android/Intent';
import { LifecycleApi } from 'Core/Native/Android/Lifecycle';
import { AndroidPreferencesApi } from 'Core/Native/Android/Preferences';
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
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
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
import { SKAdNetworkApi } from 'Core/Native/iOS/SKAdNetwork';
export class Core {
    constructor(nativeBridge) {
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
                TrackingManager: new TrackingManagerApi(nativeBridge),
                SKAdNetwork: new SKAdNetworkApi(nativeBridge)
            } : undefined
        };
        this.FocusManager = new FocusManager(this.NativeBridge.getPlatform(), this.Api);
        this.WakeUpManager = new WakeUpManager(this.Api);
        this.CacheBookkeeping = new CacheBookkeepingManager(this.Api);
        this.ResolveManager = new ResolveManager(this.Api);
        this.MetaDataManager = new MetaDataManager(this.Api);
        this.StorageBridge = new StorageBridge(this.Api);
    }
    initialize() {
        SDKMetrics.initialize();
        let loadTime;
        if (performance && performance.now) {
            loadTime = performance.now();
        }
        const measurements = createStopwatch();
        return this.Api.Sdk.loadComplete().then((data) => {
            this.ClientInfo = new ClientInfo(data);
            if (!/^\d+$/.test(this.ClientInfo.getGameId())) {
                return Promise.reject(new InitializationError(InitErrorCode.InvalidArgument, `Unity Ads SDK fail to initialize due to provided Game ID '${this.ClientInfo.getGameId()}' is invalid. Game ID may contain only digits (0-9).`));
            }
            if (this.NativeBridge.getPlatform() === Platform.ANDROID) {
                this.DeviceInfo = new AndroidDeviceInfo(this.Api);
                this.RequestManager = new RequestManager(this.NativeBridge.getPlatform(), this.Api, this.WakeUpManager, this.DeviceInfo);
            }
            else if (this.NativeBridge.getPlatform() === Platform.IOS) {
                this.DeviceInfo = new IosDeviceInfo(this.Api);
                this.RequestManager = new RequestManager(this.NativeBridge.getPlatform(), this.Api, this.WakeUpManager);
            }
            if (CustomFeatures.isNoGzipGame(this.ClientInfo.getGameId())) {
                this.CacheManager = new NoGzipCacheManager(this.Api, this.WakeUpManager, this.RequestManager, this.CacheBookkeeping);
            }
            else {
                this.CacheManager = new CacheManager(this.Api, this.WakeUpManager, this.RequestManager, this.CacheBookkeeping);
            }
            this.UnityInfo = new UnityInfo(this.NativeBridge.getPlatform(), this.Api);
            this.JaegerManager = new JaegerManager(this.RequestManager);
            this.SdkDetectionInfo = new SdkDetectionInfo(this.NativeBridge.getPlatform(), this.Api);
            HttpKafka.setRequest(this.RequestManager);
            HttpKafka.setPlatform(this.NativeBridge.getPlatform());
            HttpKafka.setClientInfo(this.ClientInfo);
            if (this.NativeBridge.getPlatform() === Platform.ANDROID) {
                this.Api.Request.Android.setKeepAliveTime(10000);
            }
            this.Api.Request.setConcurrentRequestCount(8);
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
            measurements.stopAndSend(InitializationMetric.WebviewInitializationPhases, {
                'wel': 'undefined',
                'stg': 'device_info_collection'
            });
            HttpKafka.setDeviceInfo(this.DeviceInfo);
            this.WakeUpManager.setListenConnectivity(true);
            this.Api.Sdk.logInfo('mediation detection is:' + this.SdkDetectionInfo.getSdkDetectionJSON());
            if (this.NativeBridge.getPlatform() === Platform.IOS) {
                this.FocusManager.setListenAppForeground(true);
                this.FocusManager.setListenAppBackground(true);
            }
            else {
                this.FocusManager.setListenScreen(true);
                this.FocusManager.setListenAndroidLifecycle(true);
            }
            this.ConfigManager = new ConfigManager(this.NativeBridge.getPlatform(), this.Api, this.MetaDataManager, this.ClientInfo, this.DeviceInfo, this.UnityInfo, this.RequestManager);
            measurements.reset();
            measurements.start();
            let configPromise;
            if (TestEnvironment.get('creativeUrl')) {
                configPromise = Promise.resolve(CreativeUrlConfiguration);
            }
            else {
                configPromise = this.ConfigManager.getConfig();
            }
            configPromise = configPromise.then((configJson) => {
                measurements.stopAndSend(InitializationMetric.WebviewInitializationPhases, {
                    'wel': 'undefined',
                    'stg': 'config_request_received'
                });
                const coreConfig = CoreConfigurationParser.parse(configJson);
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
            return Promise.all([configPromise, cachePromise]);
        }).then(([[configJson, coreConfig]]) => {
            this.Config = coreConfig;
            if (this.DeviceInfo instanceof AndroidDeviceInfo && GooglePlayDetectionTest.isValid(this.Config.getAbGroup())) {
                this.DeviceInfo.set('isGoogleStoreInstalled', true);
            }
            SDKMetrics.setMetricInstance(createMetricInstance(this.NativeBridge.getPlatform(), this.RequestManager, this.ClientInfo, this.DeviceInfo, this.Config.getCountry()));
            // tslint:disable-next-line:no-any
            const nativeInitTime = window.initTimestamp - this.ClientInfo.getInitTimestamp();
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
        }).then((configJson) => {
            this.Ads = new Ads(configJson, this);
            return this.Ads.initialize().then(() => {
                SDKMetrics.sendBatchedEvents();
                IsMadeWithUnity.sendIsMadeWithUnity(this.Api.Storage, this.SdkDetectionInfo);
            });
        }).catch((error) => {
            this.handleInitializationError(error);
        });
    }
    handleInitializationError(err) {
        let message = 'Unity Ads SDK fail to initialize due to internal error';
        let errorCode = InitErrorCode.Unknown;
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
    setupTestEnvironment() {
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
                const value = TestEnvironment.get('forceAuthorization');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL0NvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUM5QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN0RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUV0RSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUNoRixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzVELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzVELE9BQU8sRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLHVCQUF1QixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDekYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDbEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBR3BELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFB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