import { Backend } from 'Native/Backend/Backend';

export class Request {

    public static getLog() {
        return Request._requestLog;
    }

    public static setLog(requestLog: string[]) {
        Request._requestLog = requestLog;
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

    public static head(id: string, url: string, headers: [string, string][], connectTimeout: number, readTimeout: number) {
        Request._requestLog.push(url);
        const xhr = new XMLHttpRequest();
        xhr.onload = (event: Event) => {
            Backend.sendEvent('REQUEST', 'COMPLETE', id, url, xhr.responseText, xhr.status, xhr.getAllResponseHeaders());
        };
        xhr.open('HEAD', url);
        xhr.send();
    }

    public static post(id: string, url: string, body: string, headers: [string, string][], connectTimeout: number, readTimeout: number) {
        const vastBodyElement = <HTMLInputElement>window.parent.document.getElementById('vastBody');

        Request._requestLog.push(url);
        const xhr = new XMLHttpRequest();
        xhr.onload = (event: Event) => {
            let responseText = xhr.responseText;

            if (vastBodyElement.value !== '' && url.match(/games\/\d{1,}\/fill/)) {
                responseText = `{
                                  "abGroup": 3,
                                  "vast": {
                                    "data": "` + encodeURIComponent(vastBodyElement.value) + `"
                                  },
                                  "gamerId": "5712983c481291b16e1be03b"
                                }`;
            }

            Backend.sendEvent('REQUEST', 'COMPLETE', id, url, responseText, xhr.status, xhr.getAllResponseHeaders());
        };
        xhr.open('POST', url);
        xhr.send(body);
    }

    public static head(id: string, url: string, body: string, headers: [string, string][], connectTimeout: number, readTimeout: number) {
        Request._requestLog.push(url);
        const xhr = new XMLHttpRequest();
        xhr.onload = (event: Event) => {
            Backend.sendEvent('REQUEST', 'COMPLETE', id, url, xhr.responseText, xhr.status, xhr.getAllResponseHeaders());
        };
        xhr.open('HEAD', url);
        xhr.send(body);
    }

    private static _requestLog: string[] = [];

}
