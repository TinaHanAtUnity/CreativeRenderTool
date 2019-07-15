import { ICore } from 'Core/ICore';
import { IApiModule } from 'Core/Modules/IApiModule';
import { IChinaApi, IChina } from 'China/IChina';
import { AndroidDownloadApi } from 'China/Native/Android/Download';
import { AndroidInstallListenerApi } from 'China/Native/Android/InstallListener';
import { DownloadManager } from 'China/Managers/DownloadManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';

import { Diagnostics } from 'Core/Utilities/Diagnostics';

export class China implements IApiModule, IChina {

    public readonly Api: Readonly<IChinaApi>;

    public DownloadManager: DownloadManager;

    private _core: ICore;

    constructor(core: ICore) {
        this._core = core;

        this.Api = {
            Android: {
                Download: new AndroidDownloadApi(core.NativeBridge),
                InstallListener: new AndroidInstallListenerApi(core.NativeBridge)
            }
        };
    }

    public initialize() {
        this.DownloadManager = new DownloadManager(this._core.Api, this.Api, (<AndroidDeviceInfo> this._core.DeviceInfo).getApiLevel());
        this.DownloadManager.restoreStoredDownloadIds().catch((error) => {
            Diagnostics.trigger('download_storage', error);
        });

        this.DownloadManager.listenInstallEvent();
    }
}
