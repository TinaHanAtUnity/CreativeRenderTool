import { EventCategory } from 'Core/Constants/EventCategory';
import { Platform } from 'Core/Constants/Platform';
import { AndroidRequestApi } from 'Core/Native/Android/Request';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { Observable3, Observable5 } from 'Core/Utilities/Observable';
export var RequestEvent;
(function (RequestEvent) {
    RequestEvent[RequestEvent["COMPLETE"] = 0] = "COMPLETE";
    RequestEvent[RequestEvent["FAILED"] = 1] = "FAILED";
})(RequestEvent || (RequestEvent = {}));
export class RequestApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Request', ApiPackage.CORE, EventCategory.REQUEST);
        this.onComplete = new Observable5();
        this.onFailed = new Observable3();
        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            this.Android = new AndroidRequestApi(nativeBridge);
        }
    }
    get(id, url, headers, connectTimeout, readTimeout) {
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.invoke(this._fullApiClassName, 'get', [id, url, headers, connectTimeout]);
        }
        else {
            return this._nativeBridge.invoke(this._fullApiClassName, 'get', [id, url, headers, connectTimeout, readTimeout]);
        }
    }
    post(id, url, requestBody, headers, connectTimeout, readTimeout) {
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.invoke(this._fullApiClassName, 'post', [id, url, requestBody, headers, connectTimeout]);
        }
        else {
            return this._nativeBridge.invoke(this._fullApiClassName, 'post', [id, url, requestBody, headers, connectTimeout, readTimeout]);
        }
    }
    head(id, url, headers, connectTimeout, readTimeout) {
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.invoke(this._fullApiClassName, 'head', [id, url, headers, connectTimeout]);
        }
        else {
            return this._nativeBridge.invoke(this._fullApiClassName, 'head', [id, url, headers, connectTimeout, readTimeout]);
        }
    }
    setConnectTimeout(connectTimeout) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setConnectTimeout', [connectTimeout]);
    }
    getConnectTimeout() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getConnectTimeout');
    }
    setReadTimeout(readTimeout) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setReadTimeout', [readTimeout]);
    }
    getReadTimeout() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getReadTimeout');
    }
    setConcurrentRequestCount(count) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setConcurrentRequestCount', [count]);
    }
    handleEvent(event, parameters) {
        switch (event) {
            case RequestEvent[RequestEvent.COMPLETE]:
                this.onComplete.trigger(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4]);
                break;
            case RequestEvent[RequestEvent.FAILED]:
                this.onFailed.trigger(parameters[0], parameters[1], parameters[2]);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL05hdGl2ZS9SZXF1ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDaEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUVyRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXJFLE1BQU0sQ0FBTixJQUFZLFlBR1g7QUFIRCxXQUFZLFlBQVk7SUFDcEIsdURBQVEsQ0FBQTtJQUNSLG1EQUFNLENBQUE7QUFDVixDQUFDLEVBSFcsWUFBWSxLQUFaLFlBQVksUUFHdkI7QUFFRCxNQUFNLE9BQU8sVUFBVyxTQUFRLFNBQVM7SUFNckMsWUFBWSxZQUEwQjtRQUNsQyxLQUFLLENBQUMsWUFBWSxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUozRCxlQUFVLEdBQUcsSUFBSSxXQUFXLEVBQXNELENBQUM7UUFDbkYsYUFBUSxHQUFHLElBQUksV0FBVyxFQUEwQixDQUFDO1FBS2pFLElBQUksWUFBWSxDQUFDLFdBQVcsRUFBRSxLQUFLLFFBQVEsQ0FBQyxPQUFPLEVBQUU7WUFDakQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ3REO0lBQ0wsQ0FBQztJQUVNLEdBQUcsQ0FBQyxFQUFVLEVBQUUsR0FBVyxFQUFFLE9BQTJCLEVBQUUsY0FBc0IsRUFBRSxXQUFtQjtRQUN4RyxJQUFJLElBQUksQ0FBQyxhQUFhLENB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