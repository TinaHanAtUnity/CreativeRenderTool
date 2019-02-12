import { IApiModule, IModuleApi } from 'Core/Modules/IApiModule';
import { AndroidDownloadApi } from 'China/Native/Android/Download';
import { AndroidInstallListenerApi } from 'China/Native/Android/InstallListener';
import { DownloadManager } from 'China/Managers/DownloadManager';
import { DeviceIdManager } from 'China/Managers/DeviceIdManager';
import { ChinaAndroidDeviceInfoApi } from 'China/Native/Android/DeviceInfo';

export interface IChinaApi extends IModuleApi {
    Android : {
        Download: AndroidDownloadApi;
        InstallListener: AndroidInstallListenerApi;
        DeviceInfo: ChinaAndroidDeviceInfoApi;
    };
}

export interface IChina extends IApiModule {
    readonly Api: Readonly<IChinaApi>;
    readonly DownloadManager: DownloadManager;
    readonly DeviceIdManager: DeviceIdManager;
}
