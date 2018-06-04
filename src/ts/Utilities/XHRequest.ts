export class XHRequest {

    public static get(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
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

            xhr.open('GET', decodeURIComponent(url));
            xhr.send();
        });
    }
}
