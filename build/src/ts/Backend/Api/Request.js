import { BackendApi } from 'Backend/BackendApi';
export class Request extends BackendApi {
    constructor() {
        super(...arguments);
        this._retryCount = 0;
        this._toggleUrl = false;
        this._passthrough = false;
        this._requestLog = [];
    }
    getLog(method) {
        let entries;
        if (method) {
            entries = this._requestLog.filter((entry) => entry.method.match(method));
        }
        else {
            entries = this._requestLog;
        }
        return entries.map((entry) => entry.url);
    }
    setLog(requestLog) {
        this._requestLog = requestLog;
    }
    get(id, url, headers, connectTimeout, readTimeout) {
        if (this._passthrough) {
            this._requestLog.push({
                method: 'GET',
                url: url
            });
            const xhr = new XMLHttpRequest();
            xhr.onload = (event) => {
                this._backend.sendEvent('REQUEST', 'COMPLETE', id, url, xhr.responseText, xhr.status, xhr.getAllResponseHeaders());
            };
            xhr.open('GET', url);
            xhr.send();
            return;
        }
        if (url.indexOf('/success') !== -1) {
            this.sendSuccessResponse(id, url, 'Success response', 200, []);
        }
        else if (url.indexOf('/fail') !== -1) {
            this.sendFailResponse(id, url, 'Fail response');
        }
        else if (url.indexOf('/forwardheader') !== -1) {
            if (headers[0][0] === 'X-Test') {
                this.sendSuccessResponse(id, url, headers[0][1], 200, []);
            }
            else {
                this.sendFailResponse(id, url, 'No X-Test header found');
            }
        }
        else if (url.indexOf('/retry') !== -1) {
            if (this._retryCount === 3) {
                this.sendSuccessResponse(id, url, 'Success response', 200, []);
            }
            else {
                this.sendFailResponse(id, url, 'Must continue retrying');
            }
            this._retryCount++;
        }
        else if (url.indexOf('/alwaysRetry') !== -1) {
            this.sendFailResponse(id, url, 'This URL always fails');
        }
        else if (url.indexOf('/toggle') !== -1) {
            if (this._toggleUrl) {
                this.sendSuccessResponse(id, url, 'Success response', 200, []);
            }
            else {
                this.sendFailResponse(id, url, 'URL toggled off');
            }
        }
        else if (url.indexOf('/responsecode') !== -1) {
            const responseCodes = url.match(/2[0-9]{2}/);
            if (responseCodes && responseCodes.length > 0) {
                const responseCode = responseCodes[0];
                this.sendSuccessResponse(id, url, 'Success response', parseInt(responseCode, 10), []);
            }
            else {
                this.sendFailResponse(id, url, 'Fail response');
            }
        }
        else if (url.indexOf('/errorresponsecode') !== -1) {
            const responseCodes = url.match(/(4[0-9]{2})|600/);
            if (responseCodes && responseCodes.length > 0) {
                const responseCode = responseCodes[0];
                this.sendSuccessResponse(id, url, '{"error": "Failure response"}', parseInt(responseCode, 10), []);
            }
        }
        else {
            this.sendSuccessResponse(id, url, 'Success response', 200, []);
        }
    }
    head(id, url, headers, connectTimeout, readTimeout) {
        if (this._passthrough) {
            this._requestLog.push({
                method: 'HEAD',
                url: url
            });
            const xhr = new XMLHttpRequest();
            xhr.onload = (event) => {
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
        }
        else if (url.indexOf('/recursiveResponseCode') !== -1) {
            this.sendSuccessResponse(id, url, 'Recursive redirect response', 301, [['location', 'http://www.example.org/recursiveResponseCode/']]);
        }
        else if (url.indexOf('/rejectedResponseCode') !== -1) {
            this.sendFailResponse(id, url, 'Fail response');
        }
        else {
            this.sendSuccessResponse(id, url, 'Success response', 200, []);
        }
    }
    post(id, url, body, headers, connectTimeout, readTimeout) {
        if (this._passthrough) {
            this._requestLog.push({
                method: 'POST',
                url: url
            });
            const xhr = new XMLHttpRequest();
            xhr.onload = (event) => {
                this._backend.sendEvent('REQUEST', 'COMPLETE', id, url, xhr.responseText, xhr.status, xhr.getAllResponseHeaders());
            };
            xhr.open('POST', url);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(body);
            return;
        }
        if (url.indexOf('/success') !== -1) {
            this.sendSuccessResponse(id, url, 'Success response', 200, []);
        }
        else if (url.indexOf('/fail') !== -1) {
            this.sendFailResponse(id, url, 'Fail response');
        }
        else if (url.indexOf('/forwardheader') !== -1) {
            if (headers[0][0] === 'X-Test') {
                this.sendSuccessResponse(id, url, headers[0][1], 200, []);
            }
            else {
                this.sendFailResponse(id, url, 'No X-Test header found');
            }
        }
        else if (url.indexOf('/forwardbody') !== -1) {
            this.sendSuccessResponse(id, url, body, 200, []);
        }
        else if (url.indexOf('/retry')) {
            if (this._retryCount === 3) {
                this.sendSuccessResponse(id, url, 'Success response', 200, []);
            }
            else {
                this.sendFailResponse(id, url, 'Must continue retrying');
            }
            this._retryCount++;
        }
        else {
            this.sendSuccessResponse(id, url, 'Success response', 200, []);
        }
    }
    setConcurrentRequestCount(count) {
        return;
    }
    setMaximumPoolSize(count) {
        return;
    }
    setKeepAliveTime(keepAliveTime) {
        return;
    }
    setPassthrough(value) {
        this._passthrough = value;
    }
    setToggleUrl(status) {
        this._toggleUrl = status;
    }
    sendSuccessResponse(id, url, body, responseCode, headers) {
        this._backend.sendEvent('REQUEST', 'COMPLETE', id, url, body, responseCode, headers);
    }
    sendFailResponse(id, url, message) {
        this._backend.sendEvent('REQUEST', 'FAILED', id, url, message);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9CYWNrZW5kL0FwaS9SZXF1ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQU9oRCxNQUFNLE9BQU8sT0FBUSxTQUFRLFVBQVU7SUFBdkM7O1FBRVksZ0JBQVcsR0FBVyxDQUFDLENBQUM7UUFDeEIsZUFBVSxHQUFZLEtBQUssQ0FBQztRQUM1QixpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUNyQixnQkFBVyxHQUF1QixFQUFFLENBQUM7SUErS2pELENBQUM7SUE3S1UsTUFBTSxDQUFDLE1BQXdCO1FBQ2xDLElBQUksT0FBMkIsQ0FBQztRQUNoQyxJQUFJLE1BQU0sRUFBRTtZQUNSLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztTQUM1RTthQUFNO1lBQ0gsT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7U0FDOUI7UUFDRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRU0sTUFBTSxDQUFDLFVBQThCO1FBQ3hDLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0lBQ2xDLENBQUM7SUFFTSxHQUFHLENBQUMsRUFBVSxFQUFFLEdBQVcsRUFBRSxPQUEyQixFQUFFLGNBQXNCLEVBQUUsV0FBbUI7UUFDeEcsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ25CLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO2dCQUNsQixNQUFNLEVBQUUsS0FBSztnQkFDYixHQUFHLEVBQUUsR0FBRzth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