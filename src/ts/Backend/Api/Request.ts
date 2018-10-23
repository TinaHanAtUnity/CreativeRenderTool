import { BackendApi } from '../BackendApi';

export class Request extends BackendApi {

    private _retryCount: number = 0;
    private _toggleUrl: boolean = false;
    private _passthrough = false;

    public getLog() {
        return this._requestLog;
    }

    public setLog(requestLog: string[]) {
        this._requestLog = requestLog;
    }

    public get(id: string, url: string, headers: Array<[string, string]>, connectTimeout: number, readTimeout: number) {
        if(this._passthrough) {
            this._requestLog.push(url);
            const xhr = new XMLHttpRequest();
            xhr.onload = (event: Event) => {
                this._backend.sendEvent('REQUEST', 'COMPLETE', id, url, xhr.responseText, xhr.status, xhr.getAllResponseHeaders());
            };
            xhr.open('GET', url);
            xhr.send();
            return;
        }

        if(url.indexOf('/success') !== -1) {
            this.sendSuccessResponse(id, url, 'Success response', 200, []);
        } else if(url.indexOf('/fail') !== -1) {
            this.sendFailResponse(id, url, 'Fail response');
        } else if(url.indexOf('/forwardheader') !== -1) {
            if(headers[0][0] === 'X-Test') {
                this.sendSuccessResponse(id, url, headers[0][1], 200, []);
            } else {
                this.sendFailResponse(id, url, 'No X-Test header found');
            }
        } else if(url.indexOf('/retry') !== -1) {
            if(this._retryCount === 3) {
                this.sendSuccessResponse(id, url, 'Success response', 200, []);
            } else {
                this.sendFailResponse(id, url, 'Must continue retrying');
            }

            this._retryCount++;
        } else if(url.indexOf('/alwaysRetry') !== -1) {
            this.sendFailResponse(id, url, 'This URL always fails');
        } else if(url.indexOf('/toggle') !== -1) {
            if(this._toggleUrl) {
                this.sendSuccessResponse(id, url, 'Success response', 200, []);
            } else {
                this.sendFailResponse(id, url, 'URL toggled off');
            }
        } else if (url.indexOf('/responsecode') !== -1) {
            const responseCodes = url.match(/2[0-9]{2}/);
            if (responseCodes && responseCodes.length > 0) {
                const responseCode = responseCodes[0];
                this.sendSuccessResponse(id, url, 'Success response', parseInt(responseCode, 10), []);
            } else {
                this.sendFailResponse(id, url, 'Fail response');
            }
        } else if (url.indexOf('/errorresponsecode') !== -1) {
            const responseCodes = url.match(/(4[0-9]{2})|600/);
            if (responseCodes && responseCodes.length > 0) {
                const responseCode = responseCodes[0];
                this.sendSuccessResponse(id, url, '{"error": "Failure response"}', parseInt(responseCode, 10), []);
            }
        } else {
            this.sendSuccessResponse(id, url, 'Success response', 200, []);
        }
    }

    public head(id: string, url: string, headers: Array<[string, string]>, connectTimeout: number, readTimeout: number) {
        if(this._passthrough) {
            this._requestLog.push(url);
            const xhr = new XMLHttpRequest();
            xhr.onload = (event: Event) => {
                this._backend.sendEvent('REQUEST', 'COMPLETE', id, url, xhr.responseText, xhr.status, xhr.getAllResponseHeaders());
            };
            xhr.open('HEAD', url);
            xhr.send();
            return;
        }

        if (url.indexOf('/responsecode') !== -1) {
            const responseCodes = url.match(/3[0-9]{2}/);
            if (responseCodes && responseCodes.length > 0) {
                const responseCode = responseCodes[0];
                this.sendSuccessResponse(id, url, 'Redirect response', parseInt(responseCode, 10), [['location', 'http://www.example.org/endurl/']]);
            }
        } else if (url.indexOf('/recursiveResponseCode') !== -1) {
            this.sendSuccessResponse(id, url, 'Recursive redirect response', 301, [['location', 'http://www.example.org/recursiveResponseCode/']]);
        } else {
            this.sendSuccessResponse(id, url, 'Success response', 200, []);
        }
    }

    public post(id: string, url: string, body: string, headers: Array<[string, string]>, connectTimeout: number, readTimeout: number) {
        if(this._passthrough) {
            this._requestLog.push(url);
            const xhr = new XMLHttpRequest();
            xhr.onload = (event: Event) => {
                this._backend.sendEvent('REQUEST', 'COMPLETE', id, url, xhr.responseText, xhr.status, xhr.getAllResponseHeaders());
            };
            xhr.open('POST', url);
            xhr.send(body);
            return;
        }

        if(url.indexOf('/success') !== -1) {
            this.sendSuccessResponse(id, url, 'Success response', 200, []);
        } else if(url.indexOf('/fail') !== -1) {
            this.sendFailResponse(id, url, 'Fail response');
        } else if(url.indexOf('/forwardheader') !== -1) {
            if(headers[0][0] === 'X-Test') {
                this.sendSuccessResponse(id, url, headers[0][1], 200, []);
            } else {
                this.sendFailResponse(id, url, 'No X-Test header found');
            }
        } else if(url.indexOf('/forwardbody') !== -1) {
            this.sendSuccessResponse(id, url, body, 200, []);
        } else if(url.indexOf('/retry')) {
            if(this._retryCount === 3) {
                this.sendSuccessResponse(id, url, 'Success response', 200, []);
            } else {
                this.sendFailResponse(id, url, 'Must continue retrying');
            }

            this._retryCount++;
        } else {
            this.sendSuccessResponse(id, url, 'Success response', 200, []);
        }
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

    public setPassthrough(value: boolean) {
        this._passthrough = value;
    }

    private _requestLog: string[] = [];

    public setToggleUrl(status: boolean) {
        this._toggleUrl = status;
    }

    private sendSuccessResponse(id: string, url: string, body: string, responseCode: number, headers: Array<[string, string]>) {
        this._backend.sendEvent('REQUEST', 'COMPLETE', id, url, body, responseCode, headers);
    }

    private sendFailResponse(id: string, url: string, message: string) {
        this._backend.sendEvent('REQUEST', 'FAILED', id, url, message);
    }

}
