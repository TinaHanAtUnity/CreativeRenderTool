import { Ads } from 'Ads/__mocks__/Ads';
import { CacheBookkeepingManager } from 'Core/Managers/__mocks__/CacheBookkeepingManager';
import { CacheManager } from 'Core/Managers/__mocks__/CacheManager';
import { ConfigManager } from 'Core/Managers/__mocks__/ConfigManager';
import { FocusManager } from 'Core/Managers/__mocks__/FocusManager';
import { JaegerManager } from 'Core/Managers/__mocks__/JaegerManager';
import { MetaDataManager } from 'Core/Managers/__mocks__/MetaDataManager';
import { RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { ResolveManager } from 'Core/Managers/__mocks__/ResolveManager';
import { WakeUpManager } from 'Core/Managers/__mocks__/WakeUpManager';
import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { AndroidPreferencesApi } from 'Core/Native/Android/__mocks__/AndroidPreferencesApi';
import { BroadcastApi } from 'Core/Native/Android/__mocks__/BroadcastApi';
import { IntentApi } from 'Core/Native/Android/__mocks__/IntentApi';
import { LifecycleApi } from 'Core/Native/Android/__mocks__/LifecycleApi';
import { NativeBridge } from 'Core/Native/Bridge/__mocks__/NativeBridge';
import { IosPreferencesApi } from 'Core/Native/iOS/__mocks__/IosPreferencesApi';
import { MainBundleApi } from 'Core/Native/iOS/__mocks__/MainBundleApi';
import { NotificationApi } from 'Core/Native/iOS/__mocks__/NotificationApi';
import { UrlSchemeApi } from 'Core/Native/iOS/__mocks__/UrlSchemeApi';
import { TrackingManagerApi } from 'Core/Native/iOS/__mocks__/TrackingManagerApi';
import { CacheApi } from 'Core/Native/__mocks__/CacheApi';
import { ClassDetectionApi } from 'Core/Native/__mocks__/ClassDetectionApi';
import { ConnectivityApi } from 'Core/Native/__mocks__/ConnectivityApi';
import { DeviceInfoApi } from 'Core/Native/__mocks__/DeviceInfoApi';
import { ListenerApi } from 'Core/Native/__mocks__/ListenerApi';
import { PermissionsApi } from 'Core/Native/__mocks__/PermissionsApi';
import { RequestApi } from 'Core/Native/__mocks__/RequestApi';
import { ResolveApi } from 'Core/Native/__mocks__/ResolveApi';
import { SdkApi } from 'Core/Native/__mocks__/SdkApi';
import { SensorInfoApi } from 'Core/Native/__mocks__/SensorInfo';
import { StorageApi } from 'Core/Native/__mocks__/StorageApi';
import { StorageBridge } from 'Core/Utilities/__mocks__/StorageBridge';
import { NativeErrorApi } from 'Core/__mocks__/NativeErrorApi';
import { SdkDetectionInfo } from 'Core/Models/__mocks__/SdkDetectionInfo';
import { SKAdNetworkApi } from 'Core/Native/iOS/__mocks__/SKAdNetworkApi';
export const Core = jest.fn(() => {
    return {
        Api: {
            Cache: new CacheApi(),
            Connectivity: new ConnectivityApi(),
            DeviceInfo: new DeviceInfoApi(),
            Listener: new ListenerApi(),
            Permissions: new PermissionsApi(),
            Request: new RequestApi(),
            Resolve: new ResolveApi(),
            Sdk: new SdkApi(),
            SensorInfo: new SensorInfoApi(),
            Storage: new StorageApi(),
            NativeError: new NativeErrorApi(),
            ClassDetection: new ClassDetectionApi(),
            Android: {
                Broadcast: new BroadcastApi(),
                Intent: new IntentApi(),
                Lifecycle: new LifecycleApi(),
                Preferences: new AndroidPreferencesApi()
            },
            iOS: {
                MainBundle: new MainBundleApi(),
                Notification: new NotificationApi(),
                Preferences: new IosPreferencesApi(),
                UrlScheme: new UrlSchemeApi(),
                TrackingManager: new TrackingManagerApi(),
                SKAdNetwork: new SKAdNetworkApi()
            }
        },
        NativeBridge: new NativeBridge(),
        CacheBookkeeping: new CacheBookkeepingManager(),
        FocusManager: new FocusManager(),
        MetaDataManager: new MetaDataManager(),
        ResolveManager: new ResolveManager(),
        WakeUpManager: new WakeUpManager(),
        StorageBridge: new StorageBridge(),
        ConfigManager: new ConfigManager(),
        RequestManager: new RequestManager(),
        CacheManager: new CacheManager(),
        JaegerManager: new JaegerManager(),
        ClientInfo: new ClientInfo(),
        DeviceInfo: new DeviceInfo(),
        Config: new CoreConfiguration(),
        Ads: new Ads(),
        SdkDetectionInfo: new SdkDetectionInfo()
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL19fbW9ja3NfXy9Db3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUN4QyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxpREFBaUQsQ0FBQztBQUMxRixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDcEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQ3RFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNwRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDdEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUN4RSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDeEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQ3RFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUM5RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDOUQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0scURBQXFELENBQUM7QUFDNUYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBQzFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUNwRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFDMUUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDJDQUEy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