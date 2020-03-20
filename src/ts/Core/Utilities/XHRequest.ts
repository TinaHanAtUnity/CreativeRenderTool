import { RequestError } from 'Core/Errors/RequestError';

export class XHRequest {

    public static isAvailable(): boolean {
        return XMLHttpRequest !== undefined;
    }

    public static get(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const xhr = XHRequest.create(url, resolve, reject);

            xhr.open('GET', decodeURIComponent(url));
            xhr.send();
        });
    }

    public static post(url: string, body: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const xhr = XHRequest.create(url, resolve, reject);

            xhr.open('POST', decodeURIComponent(url));
            xhr.send(body);
        });
    }

    private static create(url: string, resolve: (value?: string | PromiseLike<string> | undefined) => void, reject: (reason?: unknown) => void) {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('load', () => {
            if ((xhr.status >= 200 && xhr.status <= 299) || (xhr.status === 0 && url.indexOf('file://') === 0)) {
                resolve(xhr.responseText);
            } else {
                reject(new RequestError(`Request failed with status code ${xhr.status}`, {}, { url: url, headers: [], response: '', responseCode: xhr.status }));
            }
        });
        // If there is network error or local file not found, this event will be fired.
        xhr.addEventListener('error', () => {
            reject(new RequestError(`Error ocurred while executing request: status - ${xhr.status}`, {}, undefined));
        });
        xhr.addEventListener('timeout', () => {
            reject(new RequestError('Request timed out', {}, undefined));
        });
        xhr.addEventListener('abort', () => {
            reject(new RequestError('Request was aborted', {}, undefined));
        });
        return xhr;
    }
}
