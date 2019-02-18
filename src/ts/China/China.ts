import { ICore } from 'Core/ICore';
import { IApiModule } from 'Core/Modules/IApiModule';
import { IChinaApi, IChina } from 'China/IChina';
import { AndroidDownloadApi } from 'China/Native/Android/Download';
import { AndroidInstallListenerApi } from 'China/Native/Android/InstallListener';
import { ChinaAndroidDeviceInfoApi } from 'China/Native/Android/DeviceInfo';
import { DownloadManager } from 'China/Managers/DownloadManager';
import { DeviceIdManager } from 'China/Managers/DeviceIdManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';

import { Diagnostics } from 'Core/Utilities/Diagnostics';

export class China implements IApiModule, IChina {

    public readonly Api: Readonly<IChinaApi>;

    public DownloadManager: DownloadManager;
    public DeviceIdManager: DeviceIdManager;

    private _core: ICore;

    constructor(core: ICore) {
        this._core = core;

        this.Api = {
            Android: {
                Download: new AndroidDownloadApi(core.NativeBridge),
                InstallListener: new AndroidInstallListenerApi(core.NativeBridge),
                DeviceInfo: new ChinaAndroidDeviceInfoApi(core.NativeBridge)
            }
        };
    }

    public initialize() {
        this.DownloadManager = new DownloadManager(this._core.Api, this.Api, (<AndroidDeviceInfo>this._core.DeviceInfo).getApiLevel());
        this.DownloadManager.restoreStoredDownloadIds().catch((error) => {
            Diagnostics.trigger('download_storage', error);
        });

        this.DownloadManager.listenInstallEvent();
        this.DeviceIdManager = new DeviceIdManager(this._core.Api, this.Api, this._core.DeviceInfo);
        return this.DeviceIdManager.loadStoredDeviceIds().catch(() => {
            return this.DeviceIdManager.getDeviceIds();
        });
    }
}
