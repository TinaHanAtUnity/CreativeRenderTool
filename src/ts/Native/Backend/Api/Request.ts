import { Backend } from 'Native/Backend/Backend';

export class Request {

    public static getLog() {
        return Request._requestLog;
    }

    public static get(id: string, url: string, headers: [string, string][], connectTimeout: number, readTimeout: number) {
        Request._requestLog.push(url);
        const xhr = new XMLHttpRequest();
        xhr.onload = (event: Event) => {
            Backend.sendEvent('REQUEST', 'COMPLETE', id, url, xhr.responseText, xhr.status, xhr.getAllResponseHeaders());
        };
        xhr.open('GET', url);
        xhr.send();
    }

    public static post(id: string, url: string, body: string, headers: [string, string][], connectTimeout: number, readTimeout: number) {
        Request._requestLog.push(url);
        const xhr = new XMLHttpRequest();
        xhr.onload = (event: Event) => {
            Backend.sendEvent('REQUEST', 'COMPLETE', id, url, xhr.responseText, xhr.status, xhr.getAllResponseHeaders());
        };
        xhr.open('POST', url);
        xhr.send(body);
    }

    private static _requestLog: string[] = [];

}
