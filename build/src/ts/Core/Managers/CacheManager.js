import { RequestManager } from 'Core/Managers/RequestManager';
import { CacheError } from 'Core/Native/Cache';
import { StorageType } from 'Core/Native/Storage';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { FileId } from 'Core/Utilities/FileId';
import { FileInfo } from 'Core/Utilities/FileInfo';
import { Observable0, Observable1, Observable2, Observable3, Observable5 } from 'Core/Utilities/Observable';
import { SDKMetrics, GeneralTimingMetric } from 'Ads/Utilities/SDKMetrics';
export var CacheStatus;
(function (CacheStatus) {
    CacheStatus[CacheStatus["OK"] = 0] = "OK";
    CacheStatus[CacheStatus["STOPPED"] = 1] = "STOPPED";
    CacheStatus[CacheStatus["FAILED"] = 2] = "FAILED";
})(CacheStatus || (CacheStatus = {}));
export class CacheManager {
    constructor(core, wakeUpManager, request, cacheBookkeeping, options) {
        this.onFastConnectionDetected = new Observable0();
        this.onStart = new Observable2();
        this.onRedirect = new Observable1();
        this.onFinish = new Observable1();
        this.onStop = new Observable1();
        this.onError = new Observable3();
        this.onFinishError = new Observable5();
        this.onTooLargeFile = new Observable5();
        this._callbacks = {};
        this._maxRetries = 5;
        this._retryDelay = 10000;
        this._maxFileSize = 20971520;
        this._currentDownloadPosition = -1;
        this._fastConnectionDetected = false;
        this._core = core;
        this._wakeUpManager = wakeUpManager;
        this._request = request;
        this._cacheBookkeeping = cacheBookkeeping;
        if (options) {
            this._maxRetries = options.retries;
            this._retryDelay = options.retryDelay;
        }
        this._paused = false;
        this._wakeUpManager.onNetworkConnected.subscribe(() => this.onNetworkConnected());
        this._core.Cache.setProgressInterval(250);
        this._core.Cache.onDownloadStarted.subscribe((url, size, totalSize, responseCode, headers) => this.onDownloadStarted(url, size, totalSize, responseCode, headers));
        this._core.Cache.onDownloadProgress.subscribe((url, size, totalSize) => this.onDownloadProgress(url, size, totalSize));
        this._core.Cache.onDownloadEnd.subscribe((url, size, totalSize, duration, responseCode, headers) => this.onDownloadEnd(url, size, totalSize, duration, responseCode, headers));
        this._core.Cache.onDownloadStopped.subscribe((url, size, totalSize, duration, responseCode, headers) => this.onDownloadStopped(url, size, totalSize, duration, responseCode, headers));
        this._core.Cache.onDownloadError.subscribe((error, url, message) => this.onDownloadError(error, url, message));
        this._core.Storage.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, data));
        this._core.Storage.get(StorageType.PUBLIC, 'caching.pause.value').then(paused => {
            this._paused = paused;
            this._core.Storage.delete(StorageType.PUBLIC, 'caching.pause');
            this._core.Storage.write(StorageType.PUBLIC);
        }).catch(() => {
            // ignore errors, assume caching not paused
        });
    }
    cache(url) {
        return Promise.all([
            FileInfo.isCached(this._core.Cache, this._cacheBookkeeping, url),
            FileId.getFileId(url, this._core.Cache)
        ]).then(([isCached, fileId]) => {
            if (isCached) {
                return Promise.resolve([CacheStatus.OK, fileId]);
            }
            const promise = this.registerCallback(url, fileId, this._paused);
            if (!this._paused) {
                this.downloadFile(url, fileId);
            }
            return promise;
        }).then(([status, fileId]) => {
            if (status === CacheStatus.OK) {
                return FileId.getFileUrl(fileId, this._core.Cache).then(fileUrl => {
                    return [fileId, fileUrl];
                });
            }
            throw status;
        }).catch(error => {
            throw error;
        });
    }
    stop() {
        let activeDownload = false;
        for (const url in this._callbacks) {
            if (this._callbacks.hasOwnProperty(url)) {
                const callback = this._callbacks[url];
                if (callback.networkRetry || callback.paused) {
                    this.fulfillCallback(url, CacheStatus.STOPPED);
                }
                else {
                    activeDownload = true;
                }
            }
        }
        if (activeDownload) {
            this._core.Cache.stop();
        }
    }
    isPaused() {
        return this._paused;
    }
    getFreeSpace() {
        return this._core.Cache.getFreeSpace().then(freeSpace => {
            return freeSpace;
        });
    }
    getHeaders(fileInfo) {
        const headers = [];
        if (fileInfo && fileInfo.found && fileInfo.size > 0) {
            headers.push(['Range', 'bytes=' + fileInfo.size + '-']);
        }
        return headers;
    }
    downloadFile(url, fileId) {
        this._currentUrl = url;
        FileInfo.getFileInfo(this._core.Cache, fileId).then(fileInfo => {
            let append = false;
            const headers = this.getHeaders(fileInfo);
            if (fileInfo && fileInfo.found && fileInfo.size > 0) {
                append = true;
            }
            // note: Emergency hack to prevent file URLs from crashing Android native SDK.
            // File URLs should not get this far and they should be rejected earlier.
            // Once validation is fixed, this hack should probably be removed.
            if (url.substring(0, 7) === 'file://') {
                Diagnostics.trigger('rejected_cache_file_url', {
                    url: url,
                    fileId: fileId
                });
                this.fulfillCallback(url, CacheStatus.FAILED);
                return;
            }
            this._core.Cache.download(url, fileId, headers, append).catch(error => {
                const callback = this._callbacks[url];
                if (callback) {
                    switch (error) {
                        case CacheError[CacheError.FILE_ALREADY_CACHING]:
                            this._core.Sdk.logError('Unity Ads cache error: attempted to add second download from ' + url + ' to ' + fileId);
                            this.fulfillCallback(url, CacheStatus.FAILED);
                            return;
                        case CacheError[CacheError.NO_INTERNET]:
                            this.handleRetry(callback, url, CacheError[CacheError.NO_INTERNET]);
                            return;
                        default:
                            this.fulfillCallback(url, CacheStatus.FAILED);
                            return;
                    }
                }
            });
        });
    }
    registerCallback(url, fileId, paused, originalUrl) {
        return new Promise((resolve, reject) => {
            const callbackObject = {
                fileId: fileId,
                networkRetry: false,
                retryCount: 0,
                networkRetryCount: 0,
                paused: paused,
                startTimestamp: 0,
                contentLength: 0,
                resolve: resolve,
                reject: reject,
                originalUrl: originalUrl
            };
            this._callbacks[url] = callbackObject;
        });
    }
    fulfillCallback(url, cacheStatus) {
        const callback = this._callbacks[url];
        const originalCallback = callback.originalUrl ? this._callbacks[callback.originalUrl] : undefined;
        if (cacheStatus === CacheStatus.FAILED) {
            callback.reject(CacheStatus.FAILED);
            if (originalCallback) {
                originalCallback.reject(CacheStatus.FAILED);
            }
        }
        else {
            callback.resolve([cacheStatus, callback.fileId]);
            if (originalCallback) {
                originalCallback.resolve([cacheStatus, originalCallback.fileId]);
            }
        }
        if (callback.originalUrl) {
            delete this._callbacks[callback.originalUrl];
        }
        delete this._callbacks[url];
    }
    onDownloadStarted(url, size, totalSize, responseCode, headers) {
        this.updateProgress(0, false);
        const callback = this._callbacks[url];
        if (callback) {
            callback.startTimestamp = Date.now();
            callback.contentLength = totalSize;
            this.onStart.trigger(CacheManager.getCacheEvent(callback), size);
            if (size === 0) {
                this._cacheBookkeeping.writeFileEntry(callback.fileId, this._cacheBookkeeping.createFileInfo(false, size, totalSize, FileId.getFileIdExtension(callback.fileId)));
            }
            // reject all files larger than 20 megabytes
            if (totalSize > this._maxFileSize) {
                this._core.Cache.stop();
                this.onTooLargeFile.trigger(CacheManager.getCacheEvent(callback), size, totalSize, responseCode, headers);
            }
        }
        else {
            Diagnostics.trigger('cache_callback_error', {
                url: url,
                currentUrl: this._currentUrl,
                callbacks: JSON.stringify(this._callbacks),
                size: size,
                totalSize: totalSize,
                responseCode: responseCode,
                headers: headers
            });
        }
    }
    onDownloadProgress(url, size, totalSize) {
        this.updateProgress(size, false);
        this._core.Sdk.logDebug('Cache progress for "' + url + '": ' + Math.round(size / totalSize * 100) + '%');
    }
    onDownloadEnd(url, size, totalSize, duration, responseCode, headers) {
        this.updateProgress(size, true);
        if (duration > 0) {
            // Send caching speed in KB/sec
            SDKMetrics.reportTimingEvent(GeneralTimingMetric.CacheSpeed, size / duration / 1024);
        }
        const callback = this._callbacks[url];
        if (callback) {
            if (RequestManager.AllowedResponseCodes.exec(responseCode.toString())) {
                this._cacheBookkeeping.writeFileEntry(callback.fileId, this._cacheBookkeeping.createFileInfo(true, size, totalSize, FileId.getFileIdExtension(callback.fileId)));
                this.fulfillCallback(url, CacheStatus.OK);
                this.onFinish.trigger(CacheManager.getCacheEvent(callback));
                return;
            }
            else if (RequestManager.RedirectResponseCodes.exec(responseCode.toString())) {
                this.onRedirect.trigger(CacheManager.getCacheEvent(callback));
                this._cacheBookkeeping.removeFileEntry(callback.fileId);
                this._core.Cache.deleteFile(callback.fileId);
                const location = RequestManager.getHeader(headers, 'location');
                if (location) {
                    let fileId = callback.fileId;
                    let originalUrl = url;
                    if (callback.originalUrl) {
                        fileId = this._callbacks[callback.originalUrl].fileId;
                        originalUrl = callback.originalUrl;
                    }
                    this.registerCallback(location, fileId, false, originalUrl);
                    this.downloadFile(location, fileId);
                    return;
                }
            }
            else if (responseCode === 416) {
                this.onFinishError.trigger(CacheManager.getCacheEvent(callback), size, totalSize, responseCode, headers);
                this.handleRequestRangeError(callback, url);
                return;
            }
            this.onFinishError.trigger(CacheManager.getCacheEvent(callback), size, totalSize, responseCode, headers);
            this._cacheBookkeeping.removeFileEntry(callback.fileId);
            if (size > 0) {
                this._core.Cache.deleteFile(callback.fileId);
            }
            this.fulfillCallback(url, CacheStatus.FAILED);
        }
    }
    onDownloadStopped(url, size, totalSize, duration, responseCode, headers) {
        this.updateProgress(size, true);
        const callback = this._callbacks[url];
        if (callback) {
            this._cacheBookkeeping.writeFileEntry(callback.fileId, this._cacheBookkeeping.createFileInfo(false, size, totalSize, FileId.getFileIdExtension(callback.fileId)));
            this.onStop.trigger(CacheManager.getCacheEvent(callback));
            if (callback.contentLength > this._maxFileSize) {
                // files larger than 20 megabytes should be handled as failures
                this.fulfillCallback(url, CacheStatus.FAILED);
            }
            else if (!callback.paused) {
                this.fulfillCallback(url, CacheStatus.STOPPED);
            }
        }
    }
    onDownloadError(error, url, message) {
        const callback = this._callbacks[url];
        if (callback) {
            this.onError.trigger(CacheManager.getCacheEvent(callback), url, message);
            switch (error) {
                case CacheError[CacheError.NETWORK_ERROR]:
                    this.handleRetry(callback, url, error);
                    return;
                case CacheError[CacheError.NO_INTERNET]:
                    this.handleRetry(callback, url, error);
                    return;
                case CacheError[CacheError.UNKNOWN_ERROR]:
                    Diagnostics.trigger('CacheError.UNKNOWN_ERROR', new Error('CacheError.UNKNOWN_ERROR'));
                    this.fulfillCallback(url, CacheStatus.FAILED);
                    return;
                default:
                    this.fulfillCallback(url, CacheStatus.FAILED);
                    return;
            }
        }
    }
    handleRetry(callback, url, error) {
        if (callback.retryCount < this._maxRetries) {
            callback.retryCount++;
            callback.networkRetry = true;
            // note: this timeout may never trigger since timeouts are unreliable when ad unit is not active
            // therefore this method should not assume any previous state and work the same way as system event handlers
            // if this never triggers, retrying will still be triggered from connection events
            setTimeout(() => {
                const retryCallback = this._callbacks[url];
                if (retryCallback && retryCallback.networkRetry) {
                    retryCallback.networkRetry = false;
                    this.downloadFile(url, retryCallback.fileId);
                }
            }, this._retryDelay);
        }
        else if (callback.networkRetryCount < this._maxRetries) {
            callback.networkRetryCount++;
            callback.networkRetry = true;
        }
        else {
            this.fulfillCallback(url, CacheStatus.FAILED);
        }
    }
    handleRequestRangeError(callback, url) {
        Promise.all([this._core.Cache.getFileInfo(callback.fileId), this._request.head(url)]).then(([fileInfo, response]) => {
            const contentLength = RequestManager.getHeader(response.headers, 'Content-Length');
            if (response.responseCode === 200 && fileInfo.found && contentLength && fileInfo.size === parseInt(contentLength, 10) && fileInfo.size > 0) {
                this._cacheBookkeeping.writeFileEntry(callback.fileId, this._cacheBookkeeping.createFileInfo(true, fileInfo.size, fileInfo.size, FileId.getFileIdExtension(callback.fileId)));
                this.fulfillCallback(url, CacheStatus.OK);
            }
            else {
                this._cacheBookkeeping.removeFileEntry(callback.fileId);
                if (fileInfo.found) {
                    this._core.Cache.deleteFile(callback.fileId);
                }
                this.fulfillCallback(url, CacheStatus.FAILED);
            }
        }).catch((error) => {
            this._cacheBookkeeping.removeFileEntry(callback.fileId);
            this.fulfillCallback(url, CacheStatus.FAILED);
        });
    }
    onNetworkConnected() {
        for (const url in this._callbacks) {
            if (this._callbacks.hasOwnProperty(url)) {
                const callback = this._callbacks[url];
                if (callback.networkRetry) {
                    callback.networkRetry = false;
                    this.downloadFile(url, callback.fileId);
                }
            }
        }
    }
    pause(paused) {
        if (paused === this._paused) {
            return;
        }
        this._paused = paused;
        if (paused) {
            let activeDownload = false;
            for (const url in this._callbacks) {
                if (this._callbacks.hasOwnProperty(url)) {
                    const callback = this._callbacks[url];
                    callback.paused = true;
                    if (!callback.networkRetry) {
                        activeDownload = true;
                    }
                }
            }
            if (activeDownload) {
                this._core.Cache.stop();
            }
        }
        else {
            for (const url in this._callbacks) {
                if (this._callbacks.hasOwnProperty(url)) {
                    const callback = this._callbacks[url];
                    if (callback.paused) {
                        callback.paused = false;
                        this.downloadFile(url, callback.fileId);
                    }
                }
            }
        }
    }
    onStorageSet(eventType, data) {
        let deleteValue = false;
        if (data && data.caching && data.caching.pause && 'value' in data.caching.pause) {
            this.pause(data.caching.pause.value);
            deleteValue = true;
        }
        if (deleteValue) {
            this._core.Storage.delete(StorageType.PUBLIC, 'caching.pause');
            this._core.Storage.write(StorageType.PUBLIC);
        }
    }
    updateProgress(position, finished) {
        const deltaPosition = position - this._currentDownloadPosition;
        const deltaTime = Date.now() - (this._lastProgressEvent || 0);
        if (position > 0 && deltaPosition > 102400) { // sample size must be at least 100 kilobytes
            // speed in kilobytes per second (same as bytes per millisecond)
            const speed = deltaPosition / deltaTime;
            // if speed is over 0,5 megabytes per second (4mbps), the connection is fast enough for streaming
            if (speed > 512 && !this._fastConnectionDetected) {
                this._fastConnectionDetected = true;
                this.onFastConnectionDetected.trigger();
            }
        }
        if (finished) {
            this._currentDownloadPosition = 0;
            this._fastConnectionDetected = false;
        }
        else {
            this._currentDownloadPosition = position;
            this._lastProgressEvent = Date.now();
        }
    }
    static getCacheEvent(callback) {
        return {
            fileId: callback.fileId,
            startTimestamp: callback.startTimestamp,
            contentLength: callback.contentLength
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FjaGVNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvTWFuYWdlcnMvQ2FjaGVNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUU5RCxPQUFPLEVBQUUsVUFBVSxFQUFhLE1BQU0sbUJBQW1CLENBQUM7QUFDMUQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDNUcsT0FBTyxFQUFFLFVBQVUsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRTNFLE1BQU0sQ0FBTixJQUFZLFdBSVg7QUFKRCxXQUFZLFdBQVc7SUFDbkIseUNBQUUsQ0FBQTtJQUNGLG1EQUFPLENBQUE7SUFDUCxpREFBTSxDQUFBO0FBQ1YsQ0FBQyxFQUpXLFdBQVcsS0FBWCxXQUFXLFFBSXRCO0FBK0NELE1BQU0sT0FBTyxZQUFZO0lBZ0NyQixZQUFZLElBQWMsRUFBRSxhQUE0QixFQUFFLE9BQXVCLEVBQUUsZ0JBQXlDLEVBQUUsT0FBdUI7UUE5QnJJLDZCQUF3QixHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7UUFFN0MsWUFBTyxHQUFHLElBQUksV0FBVyxFQUF1QixDQUFDO1FBQ2pELGVBQVUsR0FBRyxJQUFJLFdBQVcsRUFBZSxDQUFDO1FBQzVDLGFBQVEsR0FBRyxJQUFJLFdBQVcsRUFBZSxDQUFDO1FBQzFD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