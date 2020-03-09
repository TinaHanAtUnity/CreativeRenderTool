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
                reject(new Error(`Request failed with status code ${xhr.status}`));
            }
        });
        // If there is network error or local file not found, this event will be fired.
        xhr.addEventListener('error', () => {
            reject(new Error(`Error ocurred while executing request: status - ${xhr.status}`));
        });
        xhr.addEventListener('timeout', () => {
            reject(new Error('Request timed out'));
        });
        xhr.addEventListener('abort', () => {
            reject(new Error('Request was aborted'));
        });
        return xhr;
    }
}
