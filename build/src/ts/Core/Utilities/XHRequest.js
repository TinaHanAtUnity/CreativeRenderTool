import { RequestError } from 'Core/Errors/RequestError';
export class XHRequest {
    static isAvailable() {
        return XMLHttpRequest !== undefined;
    }
    static get(url) {
        return new Promise((resolve, reject) => {
            const xhr = XHRequest.create(url, () => resolve(xhr.responseText), reject);
            xhr.open('GET', decodeURIComponent(url));
            xhr.send();
        });
    }
    static post(url, body) {
        return new Promise((resolve, reject) => {
            const xhr = XHRequest.create(url, () => resolve(xhr.responseText), reject);
            xhr.open('POST', decodeURIComponent(url));
            xhr.send(body);
        });
    }
    static create(url, resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('load', () => {
            if ((xhr.status >= 200 && xhr.status <= 299) || (xhr.status === 0 && url.indexOf('file://') === 0)) {
                resolve();
            }
            else {
                const arr = xhr.getAllResponseHeaders().trim().split(/[\r\n]+/);
                const headerMap = [];
                arr.forEach((line) => {
                    const parts = line.split(': ');
                    if (parts.length >= 2) {
                        headerMap.push([parts[0], parts[1]]);
                    }
                });
                reject(new RequestError(`Request failed with status code ${xhr.status}`, {}, { url: url, headers: headerMap, response: xhr.responseText, responseCode: xhr.status }));
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
    static getDataUrl(url) {
        return new Promise((resolve, reject) => {
            const xhr = XHRequest.create(url, () => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve(reader.result);
                };
                reader.onerror = () => {
                    reject(new RequestError('Error occurred while executing request. Not able to get data url.', {}, undefined));
                };
                reader.readAsDataURL(xhr.response);
            }, reject);
            xhr.open('GET', decodeURIComponent(url));
            xhr.responseType = 'blob';
            xhr.send();
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWEhSZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvVXRpbGl0aWVzL1hIUmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFeEQsTUFBTSxPQUFPLFNBQVM7SUFFWCxNQUFNLENBQUMsV0FBVztRQUNyQixPQUFPLGNBQWMsS0FBSyxTQUFTLENBQUM7SUFDeEMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBVztRQUN6QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFM0UsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN6QyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQVcsRUFBRSxJQUFZO1FBQ3hDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDbkMsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUUzRSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzFDLEdBQUcsQ0FBQyxJQUFJLENBQUMs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