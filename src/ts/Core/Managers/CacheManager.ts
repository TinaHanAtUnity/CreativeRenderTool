import { ICoreApi } from 'Core/ICore';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { CacheError, IFileInfo } from 'Core/Native/Cache';
import { StorageType } from 'Core/Native/Storage';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { FileId } from 'Core/Utilities/FileId';
import { FileInfo } from 'Core/Utilities/FileInfo';
import { Observable0, Observable1, Observable2, Observable3, Observable5 } from 'Core/Utilities/Observable';
import { SDKMetrics, GeneralTimingMetric } from 'Ads/Utilities/SDKMetrics';

export enum CacheStatus {
    OK,
    STOPPED,
    FAILED
}

export interface ICacheOptions {
    retries: number;
    retryDelay: number;
}

export interface ICacheCampaignResponse {
    extension: string;
}

export interface ICacheCampaignsResponse {
    [id: string]: ICacheCampaignResponse;
}

type ICallbackResolveFunction = (value?: [CacheStatus, string]) => void;
type ICallbackRejectFunction = (reason?: unknown) => void;

export type HeadersType = [string, string][];

interface ICallbackObject {
    fileId: string;
    networkRetry: boolean;
    retryCount: number;
    networkRetryCount: number;
    paused: boolean;
    startTimestamp: number;
    contentLength: number;
    resolve: ICallbackResolveFunction;
    reject: ICallbackRejectFunction;
    originalUrl?: string;
}

export interface ICacheEvent {
    fileId: string;
    startTimestamp: number;
    contentLength: number;
}

export interface ICachePauseStorageType {
    caching: {
        pause: {
            value: boolean;
        };
    };
}

export class CacheManager {

    public readonly onFastConnectionDetected = new Observable0();

    public readonly onStart = new Observable2<ICacheEvent, number>();
    public readonly onRedirect = new Observable1<ICacheEvent>();
    public readonly onFinish = new Observable1<ICacheEvent>();
    public readonly onStop = new Observable1<ICacheEvent>();
    public readonly onError = new Observable3<ICacheEvent, string, string>();
    public readonly onFinishError = new Observable5<ICacheEvent, number, number, number, HeadersType>();

    public readonly onTooLargeFile = new Observable5<ICacheEvent, number, number, number, HeadersType>();

    private _core: ICoreApi;
    private _wakeUpManager: WakeUpManager;
    private _request: RequestManager;
    private _cacheBookkeeping: CacheBookkeepingManager;

    private _callbacks: { [url: string]: ICallbackObject } = {};

    private _currentUrl?: string;
    private _paused: boolean;

    private _maxRetries: number = 5;
    private _retryDelay: number = 10000;

    private readonly _maxFileSize = 20971520;

    private _currentDownloadPosition: number = -1;
    private _lastProgressEvent?: number;
    private _fastConnectionDetected: boolean = false;

    constructor(core: ICoreApi, wakeUpManager: WakeUpManager, request: RequestManager, cacheBookkeeping: CacheBookkeepingManager, options?: ICacheOptions) {
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
        this._core.Storage.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, <ICachePauseStorageType>data));

        this._core.Storage.get<boolean>(StorageType.PUBLIC, 'caching.pause.value').then(paused => {
            this._paused = paused;
            this._core.Storage.delete(StorageType.PUBLIC, 'caching.pause');
            this._core.Storage.write(StorageType.PUBLIC);
        }).catch(() => {
            // ignore errors, assume caching not paused
        });
    }

    public cache(url: string): Promise<string[]> {
        return Promise.all<boolean, string>([
            FileInfo.isCached(this._core.Cache, this._cacheBookkeeping, url),
            FileId.getFileId(url, this._core.Cache)
        ]).then(([isCached, fileId]) => {
            if (isCached) {
                return Promise.resolve<[CacheStatus, string]>([CacheStatus.OK, fileId]);
            }
            const promise = this.registerCallback(url, fileId, this._paused);
            if (!this._paused) {
                this.downloadFile(url, fileId);
            }
            return promise;
        }).then(([status, fileId]: [CacheStatus, string]) => {
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

    public stop(): void {
        let activeDownload: boolean = false;

        for (const url in this._callbacks) {
            if (this._callbacks.hasOwnProperty(url)) {
                const callback: ICallbackObject = this._callbacks[url];
                if (callback.networkRetry || callback.paused) {
                    this.fulfillCallback(url, CacheStatus.STOPPED);
                } else {
                    activeDownload = true;
                }
            }
        }

        if (activeDownload) {
            this._core.Cache.stop();
        }
    }

    public isPaused(): boolean {
        return this._paused;
    }

    public getFreeSpace(): Promise<number> {
        return this._core.Cache.getFreeSpace().then(freeSpace => {
            return freeSpace;
        });
    }

    protected getHeaders(fileInfo: IFileInfo | undefined): HeadersType {
        const headers: HeadersType = [];

        if (fileInfo && fileInfo.found && fileInfo.size > 0) {
            headers.push(['Range', 'bytes=' + fileInfo.size + '-']);
        }
        return headers;
    }

    private downloadFile(url: string, fileId: string): void {
        this._currentUrl = url;

        FileInfo.getFileInfo(this._core.Cache, fileId).then(fileInfo => {
            let append = false;
            const headers: HeadersType = this.getHeaders(fileInfo);

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

    private registerCallback(url: string, fileId: string, paused: boolean, originalUrl?: string): Promise<[CacheStatus, string]> {
        return new Promise<[CacheStatus, string]>((resolve, reject) => {
            const callbackObject: ICallbackObject = {
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

    private fulfillCallback(url: string, cacheStatus: CacheStatus) {
        const callback = this._callbacks[url];
        const originalCallback = callback.originalUrl ? this._callbacks[callback.originalUrl] : undefined;
        if (cacheStatus === CacheStatus.FAILED) {
            callback.reject(CacheStatus.FAILED);
            if (originalCallback) {
                originalCallback.reject(CacheStatus.FAILED);
            }
        } else {
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

    private onDownloadStarted(url: string, size: number, totalSize: number, responseCode: number, headers: HeadersType): void {
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
        } else {
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

    private onDownloadProgress(url: string, size: number, totalSize: number): void {
        this.updateProgress(size, false);

        this._core.Sdk.logDebug('Cache progress for "' + url + '": ' + Math.round(size / totalSize * 100) + '%');
    }

    private onDownloadEnd(url: string, size: number, totalSize: number, duration: number, responseCode: number, headers: HeadersType): void {
        this.updateProgress(size, true);

        // Send caching speed in KB/sec
        SDKMetrics.reportTimingEvent(GeneralTimingMetric.CacheSpeed, size / duration / 1024);

        const callback = this._callbacks[url];
        if (callback) {
            if (RequestManager.AllowedResponseCodes.exec(responseCode.toString())) {
                this._cacheBookkeeping.writeFileEntry(callback.fileId, this._cacheBookkeeping.createFileInfo(true, size, totalSize, FileId.getFileIdExtension(callback.fileId)));
                this.fulfillCallback(url, CacheStatus.OK);
                this.onFinish.trigger(CacheManager.getCacheEvent(callback));
                return;
            } else if (RequestManager.RedirectResponseCodes.exec(responseCode.toString())) {
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
            } else if (responseCode === 416) {
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

    private onDownloadStopped(url: string, size: number, totalSize: number, duration: number, responseCode: number, headers: HeadersType): void {
        this.updateProgress(size, true);

        const callback = this._callbacks[url];
        if (callback) {
            this._cacheBookkeeping.writeFileEntry(callback.fileId, this._cacheBookkeeping.createFileInfo(false, size, totalSize, FileId.getFileIdExtension(callback.fileId)));
            this.onStop.trigger(CacheManager.getCacheEvent(callback));
            if (callback.contentLength > this._maxFileSize) {
                // files larger than 20 megabytes should be handled as failures
                this.fulfillCallback(url, CacheStatus.FAILED);
            } else if (!callback.paused) {
                this.fulfillCallback(url, CacheStatus.STOPPED);
            }
        }
    }

    private onDownloadError(error: string, url: string, message: string): void {
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

    private handleRetry(callback: ICallbackObject, url: string, error: string): void {
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
        } else if (callback.networkRetryCount < this._maxRetries) {
            callback.networkRetryCount++;
            callback.networkRetry = true;
        } else {
            this.fulfillCallback(url, CacheStatus.FAILED);
        }
    }

    private handleRequestRangeError(callback: ICallbackObject, url: string): void {
        Promise.all([this._core.Cache.getFileInfo(callback.fileId), this._request.head(url)]).then(([fileInfo, response]) => {
            const contentLength = RequestManager.getHeader(response.headers, 'Content-Length');

            if (response.responseCode === 200 && fileInfo.found && contentLength && fileInfo.size === parseInt(contentLength, 10) && fileInfo.size > 0) {
                this._cacheBookkeeping.writeFileEntry(callback.fileId, this._cacheBookkeeping.createFileInfo(true, fileInfo.size, fileInfo.size, FileId.getFileIdExtension(callback.fileId)));
                this.fulfillCallback(url, CacheStatus.OK);
            } else {
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

    private onNetworkConnected(): void {
        for (const url in this._callbacks) {
            if (this._callbacks.hasOwnProperty(url)) {
                const callback: ICallbackObject = this._callbacks[url];
                if (callback.networkRetry) {
                    callback.networkRetry = false;
                    this.downloadFile(url, callback.fileId);
                }
            }
        }
    }

    private pause(paused: boolean): void {
        if (paused === this._paused) {
            return;
        }
        this._paused = paused;

        if (paused) {
            let activeDownload: boolean = false;

            for (const url in this._callbacks) {
                if (this._callbacks.hasOwnProperty(url)) {
                    const callback: ICallbackObject = this._callbacks[url];
                    callback.paused = true;
                    if (!callback.networkRetry) {
                        activeDownload = true;
                    }
                }
            }

            if (activeDownload) {
                this._core.Cache.stop();
            }
        } else {
            for (const url in this._callbacks) {
                if (this._callbacks.hasOwnProperty(url)) {
                    const callback: ICallbackObject = this._callbacks[url];
                    if (callback.paused) {
                        callback.paused = false;
                        this.downloadFile(url, callback.fileId);
                    }
                }
            }
        }
    }

    private onStorageSet(eventType: string, data: ICachePauseStorageType) {
        let deleteValue: boolean = false;

        if (data && data.caching && data.caching.pause && 'value' in data.caching.pause) {
            this.pause(data.caching.pause.value);
            deleteValue = true;
        }

        if (deleteValue) {
            this._core.Storage.delete(StorageType.PUBLIC, 'caching.pause');
            this._core.Storage.write(StorageType.PUBLIC);
        }
    }

    private updateProgress(position: number, finished: boolean) {
        const deltaPosition: number = position - this._currentDownloadPosition;
        const deltaTime: number = Date.now() - (this._lastProgressEvent || 0);

        if (position > 0 && deltaPosition > 102400) { // sample size must be at least 100 kilobytes
            // speed in kilobytes per second (same as bytes per millisecond)
            const speed: number = deltaPosition / deltaTime;

            // if speed is over 0,5 megabytes per second (4mbps), the connection is fast enough for streaming
            if (speed > 512 && !this._fastConnectionDetected) {
                this._fastConnectionDetected = true;
                this.onFastConnectionDetected.trigger();
            }
        }

        if (finished) {
            this._currentDownloadPosition = 0;
            this._fastConnectionDetected = false;
        } else {
            this._currentDownloadPosition = position;
            this._lastProgressEvent = Date.now();
        }
    }

    private static getCacheEvent(callback: ICallbackObject) {
        return {
            fileId: callback.fileId,
            startTimestamp: callback.startTimestamp,
            contentLength: callback.contentLength
        };
    }

}
