import { IDownloadQueryResult, DownloadColumn, DownloadDestination, DownloadReason, DownloadStatus, DownloadVisibility, DownloadDirectory } from 'China/Native/Android/Download';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Observable3 } from 'Core/Utilities/Observable';
import { IObserver1, IObserver2 } from 'Core/Utilities/IObserver';
import { StorageType } from 'Core/Native/Storage';
import { CurrentPermission, PermissionsUtil, PermissionTypes } from 'Core/Utilities/Permissions';
import { IntentFlag } from 'Core/Native/Android/Intent';
import { ICoreApi } from 'Core/ICore';
import { Platform } from 'Core/Constants/Platform';
import { BuildVerionCode } from 'Core/Constants/Android/BuildVerionCode';
import { IChinaApi } from 'China/IChina';

export enum DownloadState {
    READY,
    ENQUEUING
}

export const DownloadMessage : {[key: string] : string} = {
    ALREADY_ENQUEUED : 'Download already enqueued',
    ENQUEUING_IN_PROGRESS : 'Enqueuing is in progress',
    PERMISSION_ERROR : 'Permission error',
    PERMISSION_DENIED : 'Permission denied',
    ERROR_INSUFFICIENT_SPACE : 'Download failed due to insufficient space',
    ERROR_FILE_ALREADY_EXISTS : 'Download failed because file already exists',
    ERROR_HTTP_DATA_ERROR : 'Download failed due network error',
    CANCELED_OR_NOT_FOUND : 'Download canceled',
    GENERIC_ERROR : 'Download failed',
    GENERIC_PAUSED_MESSAGE : 'Download paused',
    PAUSED_QUEUED_FOR_WIFI : 'Download is queued',
    PAUSED_UNKNOWN : 'Download paused',
    PAUSED_WAITING_FOR_NETWORK : 'Download paused due to network',
    PAUSED_WAITING_TO_RETRY : 'Download is retrying',
    SUCCESS : 'Download completed',
    DOWNLOADING : 'Downloading',
    OPENING_BROWSER : 'Opening browser to complete download',
    DOWNLOADING_REMINDER : 'Safe to resume game'
};

export enum DownloadStorageKey {
    ENQUEUED_DOWNLOADS = 'enqueuedDownloads'
}

export class DownloadManager {
    public readonly enqueuedDownloads: { [url: string]: number } = {};
    public readonly onDownloadUpdate = new Observable3<number, DownloadStatus, string|number>();

    private readonly _core: ICoreApi;
    private readonly _china: IChinaApi;
    private readonly _apiLevel: number;

    constructor(core: ICoreApi, china: IChinaApi, apiLevel: number) {
        this._core = core;
        this._china = china;
        this._apiLevel = apiLevel;
    }

    /**
     * @returns Returns id of the enqueued download or -1 if enqueue fails and fallback to the view intent is used to open browser.
     */
    public download(url: string, title: string, description: string): Promise<number> {

        // we use DownloadState.ENQUEUING as a lock to prevent concurrent calls to this method
        if (this.getState() === DownloadState.ENQUEUING) {
            return Promise.reject(new Error(DownloadMessage.ENQUEUING_IN_PROGRESS));
        }

        // grab the lock
        this.state = DownloadState.ENQUEUING;

        return this.checkDownloadId(url)
            .then(downloadId => {
                if (!downloadId) {
                    return this.checkPermission();
                } else {
                    return Promise.reject(new Error(DownloadMessage.ALREADY_ENQUEUED));
                }
            })
            .then(hasPermission => {
                if (hasPermission) {
                    return this.enqueue(url, title, description);
                } else {
                    return Promise.reject(new Error(DownloadMessage.PERMISSION_ERROR));
                }
            })
            .then(downloadId => {
                // free the lock
                this.state = DownloadState.READY;
                Diagnostics.trigger('download_started', {url, title, description});
                return Promise.resolve(downloadId);
            })
            .catch((error) => {
                // free the lock
                this.state = DownloadState.READY;
                Diagnostics.trigger('download_error', error);
                this.openViewIntent(url);
                return Promise.resolve(-1);
            });
    }

    /**
     * @returns Returns undefined if either condition is true
     *
     * 1. the url is not enqueued
     * 2. the url is enqueued but the download is NOT pending.
     *
     * Otherwise just return the download id in the map
     *
     * Note, when url is enqueued and download is not pending, it means the download was failed
     * but the this.enqueuedDownloads hasn't been updated yet
     *
     */
    private checkDownloadId(url: string) : Promise<number|undefined> {
        // if the url is not in enqueuedDownloads, then it is not pending
        if (!this.enqueuedDownloads[url]) {
            return Promise.resolve(undefined);
        }
        // otherwise, we need to consult SDK because there is a small time window
        // when the state changes and enqueuedDownloads is not updated yet
        return this.isDownloadPending(this.enqueuedDownloads[url])
            .then(isPending => {
                if (isPending) {
                    return Promise.resolve(this.enqueuedDownloads[url]);
                } else {
                    return Promise.resolve(undefined);
                }
            })
            .catch((error) => {
                Diagnostics.trigger('download_status', error);
                return Promise.resolve(undefined);
            });
    }

    /**
     * @returns Returns true iff we can get all the permissions
     */

    private checkPermission() : Promise<boolean> {
        return PermissionsUtil.checkPermissions(Platform.ANDROID, this._core, PermissionTypes.WRITE_EXTERNAL_STORAGE)
            .then((result) => {
                if (result === CurrentPermission.ACCEPTED) {
                    return Promise.resolve(true);
                }

                if (this._apiLevel >= BuildVerionCode.M) {
                    return this.askPermission();
                } else {
                    Diagnostics.trigger('check_permission', 'API level is too low');
                    return Promise.resolve(false);
                }
            })
            .catch((error) => {
                Diagnostics.trigger('check_permission', error);
                return Promise.resolve(false);
            });
    }

    private askPermission() : Promise<boolean> {
        Diagnostics.trigger('download_permission', 'Permission requested');
        return this.handlePermissionRequest(PermissionTypes.WRITE_EXTERNAL_STORAGE)
            .then(() => {
                Diagnostics.trigger('download_permission', 'Permission granted');
                return Promise.resolve(true);
            })
            .catch((error) => {
                Diagnostics.trigger('download_permission', error);
                return Promise.resolve(false);
            });
    }

    public getState(): DownloadState {
        return this.state;
    }

    public getCurrentDownloadId(): number {
        return this.currentDownloadId;
    }

    public restoreStoredDownloadIds(): Promise<void[]> {
        return this.fetchValue(DownloadStorageKey.ENQUEUED_DOWNLOADS).then((val) => {

            if (val) {
                const tempDict = JSON.parse(val);

                if (Object.keys(tempDict).length > 0) {
                    this.listenDownloadEvent();
                }

                Object.keys(tempDict).forEach((url) => {
                    this.enqueuedDownloads[url] = tempDict[url];
                });

                const subscribeList = Object.keys(tempDict).map(url => this._china.Android.Download.subscribeDownloadId(this.enqueuedDownloads[url], this.updateIntervalMillis, this.maxUpdateCount));
                return Promise.all(subscribeList);
            }

            return Promise.all([]);
        });
    }

    public listenInstallEvent() {
        // enable native broadcast of install event
        this._china.Android.InstallListener.subscribeInstallComplete();

        // subscribe webview listeners to install event from native
        if (!this.onPackageAddedObserver) {
            this.onPackageAddedObserver = this._china.Android.InstallListener.onPackageAdded.subscribe((packageName) => {
                Diagnostics.trigger('install_completed', { packageName });
            });
        }
    }

    private listenDownloadEvent(): void {
        if (!this.onCompletedObserver) {
            this.onCompletedObserver = this._china.Android.Download.onCompleted.subscribe((downloadId, queryResult) => {
                this.handleDownloadCompleted(downloadId, queryResult);
            });
        }
        if (!this.onUpdatedObserver) {
            this.onUpdatedObserver = this._china.Android.Download.onUpdated.subscribe((downloadId, queryResult) => {
                this.handleDownloadUpdated(downloadId, queryResult);
            });
        }
    }

    private onPackageAddedObserver: IObserver1<string>;
    private onCompletedObserver: IObserver2<number, IDownloadQueryResult> | null;
    private onUpdatedObserver: IObserver2<number, IDownloadQueryResult> | null;
    private state: DownloadState = DownloadState.READY;
    private currentDownloadId: number;
    private readonly mimeType = 'application/vnd.android.package-archive';
    private readonly updateIntervalMillis = 1000;
    private readonly maxUpdateCount = 600;

    private handlePermissionRequest(requestedPermission: PermissionTypes): Promise<void> {

        return new Promise<void>((resolve, reject) => {
            const onPermissionResultObserver = this._core.Permissions.onPermissionsResult.subscribe((permission, granted) => {
                if (this.isError(permission)) {
                    reject(new Error(DownloadMessage.PERMISSION_ERROR));
                } else if (permission === requestedPermission) {
                    if (granted) {
                        resolve();
                        this._core.Permissions.onPermissionsResult.unsubscribe(onPermissionResultObserver);
                    } else {
                        reject(new Error(DownloadMessage.PERMISSION_DENIED));
                    }
                }
            });
            PermissionsUtil.requestPermission(Platform.ANDROID, this._core, requestedPermission).catch(reject);
        });
    }

    private isError(permission : string): boolean {
        for (const pt in PermissionTypes) {
            if (PermissionTypes[pt] === permission) {
                return false;
            }
        }
        return true;
    }

    private openViewIntent(url: string): void {
        this._core.Android!.Intent.launch({
            'action': 'android.intent.action.VIEW',
            'uri': url
        });
    }

    private enqueue(url: string, title: string, description: string): Promise<number> {
        this.listenDownloadEvent();

        const filename = this.getFilename(url);

        const downloadData = {
            url,
            title,
            description,
            filename,
            visibility: DownloadVisibility.VISIBLE_NOTIFY_COMPLETED,
            mimeType: this.mimeType,
            directory: DownloadDirectory.DOWNLOADS,
            updateIntervalMillis: this.updateIntervalMillis,
            maxUpdateCount: this.maxUpdateCount,
            destination: DownloadDestination.PUBLIC_DIR
        };

        return this._china.Android.Download.enqueue(downloadData)
            .then(downloadId => {
                this.enqueuedDownloads[url] = downloadId;
                this.storeValue(DownloadStorageKey.ENQUEUED_DOWNLOADS, JSON.stringify(this.enqueuedDownloads)).catch((error) => {
                    this._core.Sdk.logWarning(JSON.stringify(error));
                });
                this.currentDownloadId = downloadId;
                return Promise.resolve(downloadId);
            });
    }

    private isDownloadPending(downloadId: number): Promise<boolean> {
        return this._china.Android.Download.query(downloadId, [DownloadColumn.STATUS, DownloadColumn.REASON])
            .then((queryResult) => {
                const status = this.getStatus(queryResult);
                if (status === DownloadStatus.RUNNING || status === DownloadStatus.PAUSED || status === DownloadStatus.PENDING) {
                    return Promise.resolve(true);
                } else {
                    return Promise.resolve(false);
                }
            });
    }

    private getUrlByDownloadId(downloadId: number): string | null {
        let downloadUrl : string | null = null;
        Object.keys(this.enqueuedDownloads).forEach((url) => {
            if (this.enqueuedDownloads[url] === downloadId) {
                downloadUrl = url;
            }
        });
        return downloadUrl;
    }

    private handleDownloadCompleted(downloadId: number, queryResult: IDownloadQueryResult): void {
        const url = this.getUrlByDownloadId(downloadId);

        if (!url) {
            return;
        }

        this.unsubscribeDownloadId(downloadId, url);

        const status = this.getStatus(queryResult);
        const reason = this.getReason(queryResult);

        if (status === DownloadStatus.SUCCESSFUL) {
            this.onDownloadUpdate.trigger(downloadId, DownloadStatus.SUCCESSFUL, DownloadMessage.SUCCESS);
            Diagnostics.trigger('download_success', {
                url,
                status: DownloadStatus[status],
                reason: DownloadReason[reason],
                statusCode: status,
                reasonCode: reason
            });

            this.installDownloadedApkFile(downloadId).then(() => {
                Diagnostics.trigger('install_started', { url });
            }).catch(() => {
                Diagnostics.trigger('install_failed', { url });
                this._core.Sdk.logError(`DownloadManager: failed to launch install view intent : downloadId: ${downloadId} : status: ${DownloadStatus[status]} : reason: ${DownloadReason[reason]}`);
            });
        } else if (status === DownloadStatus.FAILED || status === DownloadStatus.CANCELED_OR_NOT_FOUND) {
            this.onDownloadUpdate.trigger(downloadId, DownloadStatus.FAILED, this.getErrorMessage(status, reason));
            Diagnostics.trigger('download_failed', {
                url,
                status: DownloadStatus[status],
                reason: DownloadReason[reason],
                statusCode: status,
                reasonCode: reason
            });
        } else {
            this.onDownloadUpdate.trigger(downloadId, status, this.getErrorMessage(status, reason));
            Diagnostics.trigger('download_complete', {
                url,
                status: DownloadStatus[status],
                reason: DownloadReason[reason],
                statusCode: status,
                reasonCode: reason
            });
        }

    }

    private handleDownloadUpdated(downloadId: number, queryResult: IDownloadQueryResult): void {
        const url = this.getUrlByDownloadId(downloadId);

        if (!url) {
            return;
        }

        const status = this.getStatus(queryResult);
        const reason = this.getReason(queryResult);

        switch (status) {
            case DownloadStatus.PAUSED:
                this.onDownloadUpdate.trigger(downloadId, DownloadStatus.PAUSED, this.getErrorMessage(status, reason));
                break;
            case DownloadStatus.PENDING:
                this.onDownloadUpdate.trigger(downloadId, DownloadStatus.PENDING, DownloadMessage.DOWNLOADING);
                break;
            case DownloadStatus.RUNNING:
                const progress = this.getProgress(queryResult);
                this.onDownloadUpdate.trigger(downloadId, DownloadStatus.RUNNING, progress);
                break;
            case DownloadStatus.SUCCESSFUL:
                this.unsubscribeDownloadId(downloadId, url);
                this.onDownloadUpdate.trigger(downloadId, DownloadStatus.SUCCESSFUL, DownloadMessage.SUCCESS);
                Diagnostics.trigger('download_success', {
                    url,
                    status: DownloadStatus[status],
                    reason: DownloadReason[reason],
                    statusCode: status,
                    reasonCode: reason
                });

                this.installDownloadedApkFile(downloadId).then(() => {
                    Diagnostics.trigger('install_started', {url});
                }).catch(() => {
                    Diagnostics.trigger('install_failed', {url});
                    this._core.Sdk.logError(`DownloadManager: failed to launch install view intent : downloadId: ${downloadId} : status: ${DownloadStatus[status]} : reason: ${DownloadReason[reason]}`);
                });
                break;
            case DownloadStatus.FAILED:
            default:
                this.unsubscribeDownloadId(downloadId, url);
                this.onDownloadUpdate.trigger(downloadId, DownloadStatus.FAILED, this.getErrorMessage(status, reason));
                Diagnostics.trigger('download_failed', {
                    url,
                    status: DownloadStatus[status],
                    reason: DownloadReason[reason],
                    statusCode: status,
                    reasonCode: reason
                });
        }
    }

    private installDownloadedApkFile(downloadId: number): Promise<void> {
        return this._china.Android.Download.getUriForDownloadedFile(downloadId).then((uri) => {
            const flag = this._apiLevel >= BuildVerionCode.N ? IntentFlag.FLAG_GRANT_READ_URI_PERMISSION : IntentFlag.FLAG_ACTIVITY_NEW_TASK;
            return this._core.Android!.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': uri,
                'mimeType': 'application/vnd.android.package-archive',
                'flags': flag
            });
        });
    }

    private unsubscribeDownloadId(downloadId: number, url: string): void {
        delete this.enqueuedDownloads[url];
        this.storeValue(DownloadStorageKey.ENQUEUED_DOWNLOADS, JSON.stringify(this.enqueuedDownloads)).catch((error) => {
            this._core.Sdk.logWarning(JSON.stringify(error));
        });

        this._china.Android.Download.unsubscribeDownloadId(downloadId);

        // unsubscribe download listeners if no more active downloads
        if (Object.keys(this.enqueuedDownloads).length === 0) {
            if (this.onCompletedObserver) {
                this._china.Android.Download.onCompleted.unsubscribe(this.onCompletedObserver);
            }
            if (this.onUpdatedObserver) {
                this._china.Android.Download.onUpdated.unsubscribe(this.onUpdatedObserver);
            }
            this.onCompletedObserver = null;
            this.onUpdatedObserver = null;
        }
    }

    private getErrorMessage(status: number, reason: number): string {
        const genericMessage = (status === DownloadStatus.PAUSED) ? DownloadMessage.GENERIC_PAUSED_MESSAGE : DownloadMessage.GENERIC_ERROR;
        const reasonName: string = DownloadReason[reason];
        return DownloadMessage[reasonName] ? DownloadMessage[reasonName] : genericMessage;
    }

    private getStatus(queryResult: IDownloadQueryResult): number {
        const status = <number>queryResult[DownloadColumn.STATUS];
        return (status === undefined) ? DownloadStatus.CANCELED_OR_NOT_FOUND : status;
    }

    private getReason(queryResult: IDownloadQueryResult): number {
        const reason = <number>queryResult[DownloadColumn.REASON];
        return (reason === undefined) ? DownloadReason.CANCELED_OR_NOT_FOUND : reason;
    }

    private getProgress(queryResult: IDownloadQueryResult): number {
        const bytesDownloaded = <number>queryResult[DownloadColumn.BYTES_DOWNLOADED_SO_FAR];
        const bytesTotal = <number>queryResult[DownloadColumn.TOTAL_SIZE_BYTES];

        if (bytesTotal > 0) {
            return Math.round((bytesDownloaded / bytesTotal) * 100);
        }
        return 0;
    }

    private getFilename(url: string) {
        let filename: string = url;
        const urlPaths = url.split('/');
        if (urlPaths.length > 1) {
            filename = urlPaths[urlPaths.length - 1];
        }
        return filename;
    }

    private fetchValue(key: string): Promise<string | undefined> {
        return this._core.Storage.get<string>(StorageType.PRIVATE, key).then(val => {
            return val;
        }).catch(() => {
            return undefined;
        });
    }

    private storeValue(key: string, value: string): Promise<void[]> {
        return Promise.all([
            this._core.Storage.set(StorageType.PRIVATE, key, value),
            this._core.Storage.write(StorageType.PRIVATE)
        ]);
    }
}
