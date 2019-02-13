import { BackendApi } from 'Backend/BackendApi';
import { DownloadColumn, IDownloadData } from 'China/Native/Android/Download';

export class Download extends BackendApi {

    public enqueue(downloadData: IDownloadData) {
        // EMPTY
    }

    public query(downloadId: number, columnNames: DownloadColumn[]) {
        // EMPTY
    }

    public subscribeDownloadId(downloadId: number, updateIntervalMillis: number, maxUpdateCount: number) {
        // EMPTY
    }

    public unsubscribeDownloadId(downloadId: number) {
        // EMPTY
    }

    public getUriForDownloadedFile(downloadId: number) {
        // EMPTY
    }
}
