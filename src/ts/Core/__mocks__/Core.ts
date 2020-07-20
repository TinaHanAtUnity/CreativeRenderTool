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

import { ICore } from 'Core/ICore';

export const Core = jest.fn(() => {
    return <ICore>{
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
                TrackingManager: new TrackingManagerApi()
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
