import { ICore } from 'Core/ICore';
import { SensorInfoApi } from 'Core/Native/__mocks__/SensorInfo';
import { CacheApi } from 'Core/Native/__mocks__/CacheApi';
import { ConnectivityApi } from 'Core/Native/__mocks__/ConnectivityApi';
import { DeviceInfoApi } from 'Core/Native/__mocks__/DeviceInfoApi';
import { ListenerApi } from 'Core/Native/__mocks__/ListenerApi';
import { PermissionsApi } from 'Core/Native/__mocks__/PermissionsApi';
import { RequestApi } from 'Core/Native/__mocks__/RequestApi';
import { ResolveApi } from 'Core/Native/__mocks__/ResolveApi';
import { SdkApi } from 'Core/Native/__mocks__/SdkApi';
import { StorageApi } from 'Core/Native/__mocks__/StorageApi';
import { NativeErrorApi } from 'Core/__mocks__/NativeErrorApi';
import { NativeBridge } from 'Core/Native/Bridge/__mocks__/NativeBridge';
import { CacheBookkeepingManager } from 'Core/Managers/__mocks__/CacheBookkeepingManager';
import { FocusManager } from 'Core/Managers/__mocks__/FocusManager';
import { MetaDataManager } from 'Core/Managers/__mocks__/MetaDataManager';
import { ResolveManager } from 'Core/Managers/__mocks__/ResolveManager';
import { WakeUpManager } from 'Core/Managers/__mocks__/WakeUpManager';
import { StorageBridge } from 'Core/Utilities/__mocks__/StorageBridge';
import { ConfigManager } from 'Core/Managers/__mocks__/ConfigManager';
import { RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { CacheManager } from 'Core/Managers/__mocks__/CacheManager';
import { JaegerManager } from 'Core/Managers/__mocks__/JaegerManager';
import { DeviceIdManager } from 'Core/Managers/__mocks__/DeviceIdManager';
import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { Ads } from 'Ads/__mocks__/Ads';
import { Purchasing } from 'Purchasing/__mocks__/Purchasing';
import { ProgrammaticTrackingService } from 'Ads/Utilities/__mocks__/ProgrammaticTrackingService';

export const Core = jest.fn(() => {
    return <ICore><unknown>{ // todo remove unknown
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
            Android: {
                Broadcast: {},
                Intent: {},
                Lifecycle: {},
                Preferences: {}
            },
            iOS: {
                MainBundle: {},
                Notification: {},
                Preferences: {},
                UrlScheme: {}
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
        DeviceIdManager: new DeviceIdManager(),
        ClientInfo: new ClientInfo(),
        DeviceInfo: new DeviceInfo(),
        Config: new CoreConfiguration(),
        Ads: new Ads(),
        Purchasing: new Purchasing(),
        ProgrammaticTrackingService: new ProgrammaticTrackingService()
    };
});
