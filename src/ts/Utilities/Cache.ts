import { NativeBridge } from 'Native/NativeBridge';
import { CacheError } from 'Native/Api/Cache';
import { StorageType } from 'Native/Api/Storage';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { Request } from 'Utilities/Request';
import { HttpKafka, KafkaCommonObject } from 'Utilities/HttpKafka';
import { Observable0 } from 'Utilities/Observable';
import { FileInfo } from 'Utilities/FileInfo';
import { Campaign } from 'Models/Campaign';
import { SdkStats } from 'Utilities/SdkStats';
import { Session } from 'Models/Session';
import { FileId } from 'Utilities/FileId';
import { CacheBookkeeping } from 'Utilities/CacheBookkeeping';

export enum CacheStatus {
    OK,
    STOPPED,
    FAILED
}

enum CacheDiagnosticEvent {
    STARTED,
    RESUMED,
    STOPPED,
    FINISHED,
    REDIRECTED,
    ERROR
}

export interface ICacheOptions {
    retries: number;
    retryDelay: number;
}

export interface ICacheDiagnostics {
    creativeType: string;
    targetGameId: number;
    targetCampaignId: string;
}

export interface ICacheCampaignResponse {
    extension: string;
}

export interface ICacheCampaignsResponse {
    [id: string]: ICacheCampaignResponse;
}

interface ICallbackObject {
    fileId: string;
    networkRetry: boolean;
    retryCount: number;
    networkRetryCount: number;
    paused: boolean;
    startTimestamp: number;
    contentLength: number;
    diagnostics: ICacheDiagnostics;
    session: Session;
    resolve: (value?: [CacheStatus, string]) => void;
    reject: (reason?: any) => void;
    originalUrl?: string;
}

export class Cache {
    public onFastConnectionDetected: Observable0 = new Observable0();

    private _nativeBridge: NativeBridge;
    private _wakeUpManager: WakeUpManager;
    private _request: Request;
    private _cacheBookkeeping: CacheBookkeeping;

    private _callbacks: { [url: string]: ICallbackObject } = {};

    private _currentUrl: string;
    private _paused: boolean;

    private _maxRetries: number = 5;
    private _retryDelay: number = 10000;

    private readonly _maxFileSize = 20971520;

    private _currentDownloadPosition: number = -1;
    private _lastProgressEvent: number;
    private _fastConnectionDetected: boolean = false;

    private _sendDiagnosticEvents = false;

    constructor(nativeBridge: NativeBridge, wakeUpManager: WakeUpManager, request: Request, cacheBookkeeping: CacheBookkeeping, options?: ICacheOptions) {
        this._nativeBridge = nativeBridge;
        this._cacheBookkeeping = cacheBookkeeping;
        this._wakeUpManager = wakeUpManager;
        this._request = request;

        if(options) {
            this._maxRetries = options.retries;
            this._retryDelay = options.retryDelay;
        }

        this._paused = false;

        this._wakeUpManager.onNetworkConnected.subscribe(() => this.onNetworkConnected());

        this._nativeBridge.Cache.setProgressInterval(250);
        this._nativeBridge.Cache.onDownloadStarted.subscribe((url, size, totalSize, responseCode, headers) => this.onDownloadStarted(url, size, totalSize, responseCode, headers));
        this._nativeBridge.Cache.onDownloadProgress.subscribe((url, size, totalSize) => this.onDownloadProgress(url, size, totalSize));
        this._nativeBridge.Cache.onDownloadEnd.subscribe((url, size, totalSize, duration, responseCode, headers) => this.onDownloadEnd(url, size, totalSize, duration, responseCode, headers));
        this._nativeBridge.Cache.onDownloadStopped.subscribe((url, size, totalSize, duration, responseCode, headers) => this.onDownloadStopped(url, size, totalSize, duration, responseCode, headers));
        this._nativeBridge.Cache.onDownloadError.subscribe((error, url, message) => this.onDownloadError(error, url, message));
        this._nativeBridge.Storage.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, data));

        this._nativeBridge.Storage.get<boolean>(StorageType.PUBLIC, 'caching.pause.value').then(paused => {
            this._paused = paused;
            this._nativeBridge.Storage.delete(StorageType.PUBLIC, 'caching.pause');
            this._nativeBridge.Storage.write(StorageType.PUBLIC);
        }).catch(() => {
            // ignore errors, assume caching not paused
        });
    }

    public cache(url: string, diagnostics: ICacheDiagnostics, campaign: Campaign): Promise<string[]> {
        return Promise.all<boolean, string>([
            FileInfo.isCached(this._nativeBridge, this._cacheBookkeeping, url),
            FileId.getFileId(url, this._nativeBridge)
        ]).then(([isCached, fileId]) => {
            if(isCached) {
                return Promise.resolve<[CacheStatus, string]>([CacheStatus.OK, fileId]);
            }
            const promise = this.registerCallback(url, fileId, this._paused, diagnostics, campaign.getSession());
            if(!this._paused) {
                this.downloadFile(url, fileId);
            }
            return promise;
        }).then(([status, fileId]: [CacheStatus, string]) => {
            if(status === CacheStatus.OK) {
                return FileId.getFileUrl(fileId, this._nativeBridge).then(fileUrl => {
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

        for(const url in this._callbacks) {
            if(this._callbacks.hasOwnProperty(url)) {
                const callback: ICallbackObject = this._callbacks[url];
                if(callback.networkRetry || callback.paused) {
                    this.fulfillCallback(url, CacheStatus.STOPPED);
                } else {
                    activeDownload = true;
                }
            }
        }

        if(activeDownload) {
            this._nativeBridge.Cache.stop();
        }
    }

    public isPaused(): boolean {
        return this._paused;
    }

    public setDiagnostics(value: boolean) {
        this._sendDiagnosticEvents = value;
    }

    public getFreeSpace(): Promise<number> {
        return this._nativeBridge.Cache.getFreeSpace().then(freeSpace => {
            return freeSpace;
        });
    }

    private downloadFile(url: string, fileId: string): void {
        this._currentUrl = url;

        FileInfo.getFileInfo(this._nativeBridge, fileId).then(fileInfo => {
            let append = false;
            let headers: Array<[string, string]> = [];

            if(fileInfo && fileInfo.found && fileInfo.size > 0) {
                append = true;
                headers = [['Range', 'bytes=' + fileInfo.size + '-']];
            }

            this._nativeBridge.Cache.download(url, fileId, headers, append).catch(error => {
                const callback = this._callbacks[url];
                if(callback) {
                    switch(error) {
                        case CacheError[CacheError.FILE_ALREADY_CACHING]:
                            this._nativeBridge.Sdk.logError('Unity Ads cache error: attempted to add second download from ' + url + ' to ' + fileId);
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

    private registerCallback(url: string, fileId: string, paused: boolean, diagnostics: ICacheDiagnostics, session: Session, originalUrl?: string): Promise<[CacheStatus, string]> {
        return new Promise<[CacheStatus, string]>((resolve, reject) => {
            const callbackObject: ICallbackObject = {
                fileId: fileId,
                networkRetry: false,
                retryCount: 0,
                networkRetryCount: 0,
                paused: paused,
                startTimestamp: 0,
                contentLength: 0,
                diagnostics: diagnostics,
                session: session,
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
        if(cacheStatus === CacheStatus.FAILED) {
            callback.reject(CacheStatus.FAILED);
            if(originalCallback) {
                originalCallback.reject(CacheStatus.FAILED);
            }
        } else {
            callback.resolve([cacheStatus, callback.fileId]);
            if(originalCallback) {
                originalCallback.resolve([cacheStatus, originalCallback.fileId]);
            }
        }
        if(callback.originalUrl) {
            delete this._callbacks[callback.originalUrl];
        }
        delete this._callbacks[url];
    }

    private onDownloadStarted(url: string, size: number, totalSize: number, responseCode: number, headers: Array<[string, string]>): void {
        this.updateProgress(0, false);

        const callback = this._callbacks[url];

        if(callback) {
            callback.startTimestamp = Date.now();
            callback.contentLength = totalSize;
            if(size === 0) {
                this._cacheBookkeeping.writeFileEntry(callback.fileId, this._cacheBookkeeping.createFileInfo(false, size, totalSize, FileId.getFileIdExtension(callback.fileId)));
                this.sendDiagnostic(CacheDiagnosticEvent.STARTED, callback);
                SdkStats.setCachingStartTimestamp(callback.fileId);
            } else {
                this.sendDiagnostic(CacheDiagnosticEvent.RESUMED, callback);
            }
            // reject all files larger than 20 megabytes
            if(totalSize > this._maxFileSize) {
                this._nativeBridge.Cache.stop();
                Diagnostics.trigger('too_large_file', {
                    url: url,
                    size: size,
                    totalSize: totalSize,
                    responseCode: responseCode,
                    headers: headers
                }, callback.session);
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

        this._nativeBridge.Sdk.logDebug('Cache progress for "' + url + '": ' + Math.round(size / totalSize * 100) + '%');
    }

    private onDownloadEnd(url: string, size: number, totalSize: number, duration: number, responseCode: number, headers: Array<[string, string]>): void {
        this.updateProgress(size, true);

        const callback = this._callbacks[url];
        if(callback) {
            if(Request.AllowedResponseCodes.exec(responseCode.toString())) {
                this._cacheBookkeeping.writeFileEntry(callback.fileId, this._cacheBookkeeping.createFileInfo(true, size, totalSize, FileId.getFileIdExtension(callback.fileId)));
                this.sendDiagnostic(CacheDiagnosticEvent.FINISHED, callback);
                this.fulfillCallback(url, CacheStatus.OK);
                SdkStats.setCachingFinishTimestamp(callback.fileId);
                return;
            } else if(Request.RedirectResponseCodes.exec(responseCode.toString())) {
                this.sendDiagnostic(CacheDiagnosticEvent.REDIRECTED, callback);
                this._cacheBookkeeping.removeFileEntry(callback.fileId);
                this._nativeBridge.Cache.deleteFile(callback.fileId);
                const location = Request.getHeader(headers, 'location');
                if(location) {
                    let fileId = callback.fileId;
                    let originalUrl = url;
                    if(callback.originalUrl) {
                        fileId = this._callbacks[callback.originalUrl].fileId;
                        originalUrl = callback.originalUrl;
                    }
                    this.registerCallback(location, fileId, false, callback.diagnostics, callback.session, originalUrl);
                    this.downloadFile(location, fileId);
                    return;
                }
            } else if(responseCode === 416) {
                this.sendDiagnostic(CacheDiagnosticEvent.ERROR, callback);
                this.handleRequestRangeError(callback, url);
                return;
            }

            this.sendDiagnostic(CacheDiagnosticEvent.ERROR, callback);

            const error: DiagnosticError = new DiagnosticError(new Error('HTTP ' + responseCode), {
                url: url,
                size: size,
                totalSize: totalSize,
                duration: duration,
                responseCode: responseCode,
                headers: JSON.stringify(headers)
            });
            Diagnostics.trigger('cache_error', error, callback.session);

            this._cacheBookkeeping.removeFileEntry(callback.fileId);
            if(size > 0) {
                this._nativeBridge.Cache.deleteFile(callback.fileId);
            }

            this.fulfillCallback(url, CacheStatus.FAILED);
        }
    }

    private onDownloadStopped(url: string, size: number, totalSize: number, duration: number, responseCode: number, headers: Array<[string, string]>): void {
        this.updateProgress(size, true);

        const callback = this._callbacks[url];
        if(callback) {
            this._cacheBookkeeping.writeFileEntry(callback.fileId, this._cacheBookkeeping.createFileInfo(false, size, totalSize, FileId.getFileIdExtension(callback.fileId)));
            this.sendDiagnostic(CacheDiagnosticEvent.STOPPED, callback);
            if(callback.contentLength > this._maxFileSize) {
                // files larger than 20 megabytes should be handled as failures
                this.fulfillCallback(url, CacheStatus.FAILED);
            } else if(!callback.paused) {
                this.fulfillCallback(url, CacheStatus.STOPPED);
            }
        }
    }

    private onDownloadError(error: string, url: string, message: string): void {
        const callback = this._callbacks[url];
        if(callback) {
            this.sendDiagnostic(CacheDiagnosticEvent.ERROR, callback);

            switch (error) {
                case CacheError[CacheError.NETWORK_ERROR]:
                    this.handleRetry(callback, url, error);
                    return;

                case CacheError[CacheError.NO_INTERNET]:
                    this.handleRetry(callback, url, error);
                    return;

                default:
                    this.fulfillCallback(url, CacheStatus.FAILED);
                    return;
            }
        }
    }

    private handleRetry(callback: ICallbackObject, url: string, error: string): void {
        if(callback.retryCount < this._maxRetries) {
            callback.retryCount++;
            callback.networkRetry = true;

            // note: this timeout may never trigger since timeouts are unreliable when ad unit is not active
            // therefore this method should not assume any previous state and work the same way as system event handlers
            // if this never triggers, retrying will still be triggered from connection events
            setTimeout(() => {
                const retryCallback = this._callbacks[url];
                if(retryCallback && retryCallback.networkRetry) {
                    retryCallback.networkRetry = false;
                    this.downloadFile(url, retryCallback.fileId);
                }
            }, this._retryDelay);
        } else if(callback.networkRetryCount < this._maxRetries) {
            callback.networkRetryCount++;
            callback.networkRetry = true;
        } else {
            this.fulfillCallback(url, CacheStatus.FAILED);
        }
    }

    private handleRequestRangeError(callback: ICallbackObject, url: string): void {
        Promise.all([this._nativeBridge.Cache.getFileInfo(callback.fileId), this._request.head(url)]).then(([fileInfo, response]) => {
            const contentLength = Request.getHeader(response.headers, 'Content-Length');

            if(response.responseCode === 200 && fileInfo.found && contentLength && fileInfo.size === parseInt(contentLength, 10) && fileInfo.size > 0) {
                Diagnostics.trigger('cache_desync_fixed', {
                    url: url,
                    responseCode: response.responseCode,
                    fileFound: fileInfo.found,
                    fileSize: fileInfo.size,
                    contentLength: parseInt(contentLength, 10)
                }, callback.session);
                this._cacheBookkeeping.writeFileEntry(callback.fileId, this._cacheBookkeeping.createFileInfo(true, fileInfo.size, fileInfo.size, FileId.getFileIdExtension(callback.fileId)));
                this.fulfillCallback(url, CacheStatus.OK);
            } else {
                let parsedContentLength;
                if (contentLength) {
                    parsedContentLength = parseInt(contentLength, 10);
                }
                Diagnostics.trigger('cache_desync_failure', {
                    url: url,
                    responseCode: response.responseCode,
                    fileFound: fileInfo.found,
                    fileSize: fileInfo.size,
                    contentLength: parsedContentLength
                }, callback.session);
                this._cacheBookkeeping.removeFileEntry(callback.fileId);
                if(fileInfo.found) {
                    this._nativeBridge.Cache.deleteFile(callback.fileId);
                }
                this.fulfillCallback(url, CacheStatus.FAILED);
            }
        }).catch((error) => {
            Diagnostics.trigger('cache_desync_failure', {
                url: url,
                error: error,
            }, callback.session);
            this._cacheBookkeeping.removeFileEntry(callback.fileId);
            this.fulfillCallback(url, CacheStatus.FAILED);
        });
    }

    private onNetworkConnected(): void {
        for(const url in this._callbacks) {
            if(this._callbacks.hasOwnProperty(url)) {
                const callback: ICallbackObject = this._callbacks[url];
                if(callback.networkRetry) {
                    callback.networkRetry = false;
                    this.downloadFile(url, callback.fileId);
                }
            }
        }
    }

    private pause(paused: boolean): void {
        if(paused === this._paused) {
            return;
        }
        this._paused = paused;

        if(paused) {
            let activeDownload: boolean = false;

            for(const url in this._callbacks) {
                if(this._callbacks.hasOwnProperty(url)) {
                    const callback: ICallbackObject = this._callbacks[url];
                    callback.paused = true;
                    if(!callback.networkRetry) {
                        activeDownload = true;
                    }
                }
            }

            if(activeDownload) {
                this._nativeBridge.Cache.stop();
            }
        } else {
            for(const url in this._callbacks) {
                if (this._callbacks.hasOwnProperty(url)) {
                    const callback: ICallbackObject = this._callbacks[url];
                    if(callback.paused) {
                        callback.paused = false;
                        this.downloadFile(url, callback.fileId);
                    }
                }
            }
        }
    }

    private onStorageSet(eventType: string, data: any) {
        let deleteValue: boolean = false;

        if(data && data.caching && data.caching.pause && 'value' in data.caching.pause) {
            this.pause(data.caching.pause.value);
            deleteValue = true;
        }

        if(deleteValue) {
            this._nativeBridge.Storage.delete(StorageType.PUBLIC, 'caching.pause');
            this._nativeBridge.Storage.write(StorageType.PUBLIC);
        }
    }

    private updateProgress(position: number, finished: boolean) {
        const deltaPosition: number = position - this._currentDownloadPosition;
        const deltaTime: number = Date.now() - this._lastProgressEvent;

        if(position > 0 && deltaPosition > 102400) { // sample size must be at least 100 kilobytes
            // speed in kilobytes per second (same as bytes per millisecond)
            const speed: number = deltaPosition / deltaTime;

            // if speed is over 0,5 megabytes per second (4mbps), the connection is fast enough for streaming
            if(speed > 512 && !this._fastConnectionDetected) {
                this._fastConnectionDetected = true;
                this.onFastConnectionDetected.trigger();
            }
        }

        if(finished) {
            this._currentDownloadPosition = 0;
            this._fastConnectionDetected = false;
        } else {
            this._currentDownloadPosition = position;
            this._lastProgressEvent = Date.now();
        }
    }

    private sendDiagnostic(event: CacheDiagnosticEvent, callback: ICallbackObject) {
        if(this._sendDiagnosticEvents) {
            const msg: any = {
                eventTimestamp: Date.now(),
                eventType: CacheDiagnosticEvent[event],
                creativeType: callback.diagnostics.creativeType,
                size: callback.contentLength,
                downloadStartTimestamp: callback.startTimestamp,
                targetGameId: callback.diagnostics.targetGameId,
                targetCampaignId: callback.diagnostics.targetCampaignId
            };
            HttpKafka.sendEvent('ads.sdk2.events.creativedownload.json', KafkaCommonObject.ANONYMOUS, msg);
        }
    }
}
