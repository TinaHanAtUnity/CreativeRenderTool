import { Backend } from 'Backend/Backend';
import { BackendApi } from '../BackendApi';

export class Request extends BackendApi {

    public getLog() {
        return this._requestLog;
    }

    public setLog(requestLog: string[]) {
        this._requestLog = requestLog;
    }

    public get(id: string, url: string, headers: Array<[string, string]>, connectTimeout: number, readTimeout: number) {
        this._requestLog.push(url);
        const xhr = new XMLHttpRequest();
        xhr.onload = (event: Event) => {
            this._backend.sendEvent('REQUEST', 'COMPLETE', id, url, xhr.responseText, xhr.status, xhr.getAllResponseHeaders());
        };
        xhr.open('GET', url);
        xhr.send();
    }

    public head(id: string, url: string, headers: Array<[string, string]>, connectTimeout: number, readTimeout: number) {
        this._requestLog.push(url);
        const xhr = new XMLHttpRequest();
        xhr.onload = (event: Event) => {
            this._backend.sendEvent('REQUEST', 'COMPLETE', id, url, xhr.responseText, xhr.status, xhr.getAllResponseHeaders());
        };
        xhr.open('HEAD', url);
        xhr.send();
    }

    public post(id: string, url: string, body: string, headers: Array<[string, string]>, connectTimeout: number, readTimeout: number) {
        this._requestLog.push(url);
        const xhr = new XMLHttpRequest();
        xhr.onload = (event: Event) => {
            this._backend.sendEvent('REQUEST', 'COMPLETE', id, url, xhr.responseText, xhr.status, xhr.getAllResponseHeaders());
        };
        xhr.open('POST', url);
        xhr.send(body);
    }

    public setConcurrentRequestCount(count: number) {
        return;
    }

    public setMaximumPoolSize(count: number) {
        return;
    }

    public setKeepAliveTime(keepAliveTime: number) {
        return;
    }

    private _requestLog: string[] = [];

}
