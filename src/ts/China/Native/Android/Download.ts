import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { NativeApi, ApiPackage } from 'Core/Native/Bridge/NativeApi';
import { Observable2 } from 'Core/Utilities/Observable';
import { EventCategory } from 'Core/Constants/EventCategory';

enum DownloadEvent {
    COMPLETE,
    CLICKED,
    UPDATE
}

export enum DownloadVisibility {
    VISIBLE = 0,
    VISIBLE_NOTIFY_COMPLETED = 1,
    VISIBLE_NOTIFY_ONLY_COMPLETION = 3
}

export enum DownloadStatus {
    CANCELED_OR_NOT_FOUND = -1,
    FAILED = 16,
    PAUSED = 4,
    PENDING = 1,
    RUNNING = 2,
    SUCCESSFUL = 8
}

export enum DownloadReason {
    CANCELED_OR_NOT_FOUND = -1,
    NONE = 0,
    ERROR_CANNOT_RESUME = 1008,
    ERROR_DEVICE_NOT_FOUND = 1007,
    ERROR_FILE_ALREADY_EXISTS = 1009,
    ERROR_FILE_ERROR = 1001,
    ERROR_HTTP_DATA_ERROR = 1004,
    ERROR_INSUFFICIENT_SPACE = 1006,
    ERROR_TOO_MANY_REDIRECTS = 1005,
    ERROR_UNHANDLED_HTTP_CODE = 1002,
    ERROR_UNKNOWN = 1000,
    PAUSED_QUEUED_FOR_WIFI = 3,
    PAUSED_UNKNOWN = 4,
    PAUSED_WAITING_FOR_NETWORK = 2,
    PAUSED_WAITING_TO_RETRY = 1
}

export enum DownloadColumn {
    BYTES_DOWNLOADED_SO_FAR = 'bytes_so_far',
    ID = '_id',
    LAST_MODIFIED_TIMESTAMP = 'last_modified_timestamp',
    LOCAL_FILENAME = 'local_filename',
    LOCAL_URI = 'local_uri',
    MEDIAPROVIDER_URI = 'mediaprovider_uri',
    MEDIA_TYPE = 'media_type',
    URI = 'uri',
    REASON = 'reason',
    STATUS = 'status',
    TOTAL_SIZE_BYTES = 'total_size'
}

export enum DownloadDirectory {
    DOWNLOADS = 'DIRECTORY_DOWNLOADS'
}

export enum DownloadDestination {
    DEFAULT = 'DEFAULT',
    PUBLIC_DIR = 'PUBLIC_DIR',
    FILES_DIR = 'FILES_DIR',
    CUSTOM_URI = 'CUSTOM_URI'
}

export interface IDownloadQueryResult {
    [columnName: string]: number | string;
}

export interface IDownloadData {
    url: string;
    title: string;
    description: string;
    visibility: number;
    destination: string;
    mimeType?: string;
    directory?: string;
    filename?: string;
    updateIntervalMillis: number;
    maxUpdateCount: number;
    headers?: [string, string][];
}

export class AndroidDownloadApi extends NativeApi {

    public readonly onCompleted = new Observable2<number, IDownloadQueryResult>();
    public readonly onClicked = new Observable2<number, IDownloadQueryResult>();
    public readonly onUpdated = new Observable2<number, IDownloadQueryResult>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Download', ApiPackage.CHINA, EventCategory.DOWNLOAD);
    }

    public enqueue(downloadData: IDownloadData): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'enqueue', [downloadData]);
    }

    public query(downloadId: number, columnNames: DownloadColumn[]): Promise<IDownloadQueryResult> {
        return this._nativeBridge.invoke<IDownloadQueryResult>(this._fullApiClassName, 'query', [downloadId, columnNames]);
    }

    public subscribeDownloadId(downloadId: number, updateIntervalMillis: number, maxUpdateCount: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'subscribeDownloadId', [downloadId, updateIntervalMillis, maxUpdateCount]);
    }

    public unsubscribeDownloadId(downloadId: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'unsubscribeDownloadId', [downloadId]);
    }

    public getUriForDownloadedFile(downloadId: number): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getUriForDownloadedFile', [downloadId]);
    }

    public handleEvent(event: string, parameters: unknown[]): void {
        switch (event) {
            case DownloadEvent[DownloadEvent.COMPLETE]:
                this.onCompleted.trigger(<number>parameters[0], <IDownloadQueryResult>parameters[1]);
                break;

            case DownloadEvent[DownloadEvent.CLICKED]:
                this.onClicked.trigger(<number>parameters[0], <IDownloadQueryResult>parameters[1]);
                break;

            case DownloadEvent[DownloadEvent.UPDATE]:
                this.onUpdated.trigger(<number>parameters[0], <IDownloadQueryResult>parameters[1]);
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }
}
