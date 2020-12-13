import { EventCategory } from 'Core/Constants/EventCategory';
import { Platform } from 'Core/Constants/Platform';
import { AndroidCacheApi } from 'Core/Native/Android/Cache';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { IosCacheApi } from 'Core/Native/iOS/Cache';
import { Observable3, Observable5, Observable6 } from 'Core/Utilities/Observable';
export var CacheError;
(function (CacheError) {
    CacheError[CacheError["FILE_IO_ERROR"] = 0] = "FILE_IO_ERROR";
    CacheError[CacheError["FILE_NOT_FOUND"] = 1] = "FILE_NOT_FOUND";
    CacheError[CacheError["FILE_ALREADY_CACHING"] = 2] = "FILE_ALREADY_CACHING";
    CacheError[CacheError["NOT_CACHING"] = 3] = "NOT_CACHING";
    CacheError[CacheError["JSON_ERROR"] = 4] = "JSON_ERROR";
    CacheError[CacheError["NO_INTERNET"] = 5] = "NO_INTERNET";
    CacheError[CacheError["MALFORMED_URL"] = 6] = "MALFORMED_URL";
    CacheError[CacheError["NETWORK_ERROR"] = 7] = "NETWORK_ERROR";
    CacheError[CacheError["ILLEGAL_STATE"] = 8] = "ILLEGAL_STATE";
    CacheError[CacheError["INVALID_ARGUMENT"] = 9] = "INVALID_ARGUMENT";
    CacheError[CacheError["UNKNOWN_ERROR"] = 10] = "UNKNOWN_ERROR";
})(CacheError || (CacheError = {}));
export var CacheEvent;
(function (CacheEvent) {
    CacheEvent[CacheEvent["DOWNLOAD_STARTED"] = 0] = "DOWNLOAD_STARTED";
    CacheEvent[CacheEvent["DOWNLOAD_PROGRESS"] = 1] = "DOWNLOAD_PROGRESS";
    CacheEvent[CacheEvent["DOWNLOAD_END"] = 2] = "DOWNLOAD_END";
    CacheEvent[CacheEvent["DOWNLOAD_STOPPED"] = 3] = "DOWNLOAD_STOPPED";
    CacheEvent[CacheEvent["DOWNLOAD_ERROR"] = 4] = "DOWNLOAD_ERROR";
})(CacheEvent || (CacheEvent = {}));
export class CacheApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Cache', ApiPackage.CORE, EventCategory.CACHE);
        this.onDownloadStarted = new Observable5();
        this.onDownloadProgress = new Observable3();
        this.onDownloadEnd = new Observable6();
        this.onDownloadStopped = new Observable6();
        this.onDownloadError = new Observable3();
        if (nativeBridge.getPlatform() === Platform.IOS) {
            this.iOS = new IosCacheApi(nativeBridge);
        }
        else {
            this.Android = new AndroidCacheApi(nativeBridge);
        }
    }
    download(url, fileId, headers, append) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'download', [url, fileId, headers, append]);
    }
    stop() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'stop');
    }
    isCaching() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'isCaching');
    }
    getFiles() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getFiles');
    }
    getFileInfo(fileId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getFileInfo', [fileId]);
    }
    getFilePath(fileId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getFilePath', [fileId]);
    }
    getHash(value) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getHash', [value]);
    }
    deleteFile(fileId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'deleteFile', [fileId]);
    }
    setProgressInterval(interval) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setProgressInterval', [interval]);
    }
    // This is broken on all released iOS versions
    // public getProgressInterval(): Promise<number> {
    //     return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getProgressInterval');
    // }
    setTimeouts(connectTimeout, readTimeout) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setTimeouts', [connectTimeout, readTimeout]);
    }
    getTimeouts() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getTimeouts');
    }
    getFreeSpace() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getFreeSpace');
    }
    getTotalSpace() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getTotalSpace');
    }
    getFileContent(fileId, encoding) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getFileContent', [fileId, encoding]);
    }
    setFileContent(fileId, encoding, content) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setFileContent', [fileId, encoding, content]);
    }
    handleEvent(event, parameters) {
        switch (event) {
            case CacheEvent[CacheEvent.DOWNLOAD_STARTED]:
                this.onDownloadStarted.trigger(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4]);
                break;
            case CacheEvent[CacheEvent.DOWNLOAD_PROGRESS]:
                this.onDownloadProgress.trigger(parameters[0], parameters[1], parameters[2]);
                break;
            case CacheEvent[CacheEvent.DOWNLOAD_END]:
                this.onDownloadEnd.trigger(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], parameters[5]);
                break;
            case CacheEvent[CacheEvent.DOWNLOAD_STOPPED]:
                this.onDownloadStopped.trigger(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], parameters[5]);
                break;
            case CacheEvent[CacheEvent.DOWNLOAD_ERROR]:
                this.onDownloadError.trigger(parameters[0], parameters[1], parameters[2]);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FjaGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9OYXRpdmUvQ2FjaGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDNUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUVyRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDcEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFbEYsTUFBTSxDQUFOLElBQVksVUFZWDtBQVpELFdBQVksVUFBVTtJQUNsQiw2REFBYSxDQUFBO0lBQ2IsK0RBQWMsQ0FBQTtJQUNkLDJFQUFvQixDQUFBO0lBQ3BCLHlEQUFXLENBQUE7SUFDWCx1REFBVSxDQUFBO0lBQ1YseURBQVcsQ0FBQTtJQUNYLDZEQUFhLENBQUE7SUFDYiw2REFBYSxDQUFBO0lBQ2IsNkRBQWEsQ0FBQTtJQUNiLG1FQUFnQixDQUFBO0lBQ2hCLDhEQUFhLENBQUE7QUFDakIsQ0FBQyxFQVpXLFVBQVUsS0FBVixVQUFVLFFBWXJCO0FBRUQsTUFBTSxDQUFOLElBQVksVUFNWDtBQU5ELFdBQVksVUFBVTtJQUNsQixtRUFBZ0IsQ0FBQTtJQUNoQixxRUFBaUIsQ0FBQTtJQUNqQiwyREFBWSxDQUFBO0lBQ1osbUVBQWdCLENBQUE7SUFDaEIsK0RBQWMsQ0FBQTtBQUNsQixDQUFDLEVBTlcsVUFBVSxLQUFWLFVBQVUsUUFNckI7QUFTRCxNQUFNLE9BQU8sUUFBUyxTQUFRLFNBQVM7SUFVbkMsWUFBWSxZQUEwQjtRQUNsQyxLQUFLLENBQUMs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