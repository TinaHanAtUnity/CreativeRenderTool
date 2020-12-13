import { EventCategory } from 'Core/Constants/EventCategory';
import { BatchInvocation } from 'Core/Native/Bridge/BatchInvocation';
import { CallbackContainer } from 'Core/Native/Bridge/CallbackContainer';
export var CallbackStatus;
(function (CallbackStatus) {
    CallbackStatus[CallbackStatus["OK"] = 0] = "OK";
    CallbackStatus[CallbackStatus["ERROR"] = 1] = "ERROR";
})(CallbackStatus || (CallbackStatus = {}));
export class NativeBridge {
    constructor(backend, platform, autoBatch = true) {
        this._callbackId = 1;
        // tslint:disable-next-line
        this._callbackTable = {};
        this._eventHandlers = {};
        this._backend = backend;
        this._platform = platform;
        this._autoBatchEnabled = autoBatch;
    }
    static convertStatus(status) {
        switch (status) {
            case CallbackStatus[CallbackStatus.OK]:
                return CallbackStatus.OK;
            case CallbackStatus[CallbackStatus.ERROR]:
                return CallbackStatus.ERROR;
            default:
                throw new Error('Status string is not valid: ' + status);
        }
    }
    registerCallback(resolve, reject) {
        const id = this._callbackId++;
        this._callbackTable[id] = new CallbackContainer(resolve, reject);
        return id;
    }
    invoke(className, methodName, parameters) {
        if (this._autoBatchEnabled) {
            if (this._autoBatch) {
                return this._autoBatch.queue(className, methodName, parameters);
            }
            else {
                this._autoBatch = new BatchInvocation(this);
            }
        }
        const batch = new BatchInvocation(this);
        const promise = batch.queue(className, methodName, parameters);
        this.invokeBatch(batch);
        return promise;
    }
    handleCallback(results) {
        results.forEach((result) => {
            const id = parseInt(result.shift(), 10);
            const status = NativeBridge.convertStatus(result.shift());
            let parameters = result.shift();
            const callbackObject = this._callbackTable[id];
            if (!callbackObject) {
                throw new Error('Unable to find matching callback object from callback id ' + id);
            }
            if (parameters.length === 1) {
                // @ts-ignore
                parameters = parameters[0];
            }
            switch (status) {
                case CallbackStatus.OK:
                    callbackObject.resolve(parameters);
                    break;
                case CallbackStatus.ERROR:
                    callbackObject.reject(parameters);
                    break;
                default:
                    throw new Error('Unknown callback status');
            }
            delete this._callbackTable[id];
        });
        if (this._autoBatchEnabled) {
            if (this._autoBatch && this._autoBatch.getBatch().length > 0) {
                this.invokeBatch(this._autoBatch);
            }
            delete this._autoBatch;
        }
    }
    addEventHandler(eventCategory, nativeApi) {
        if (!(EventCategory[eventCategory] in this._eventHandlers)) {
            this._eventHandlers[EventCategory[eventCategory]] = nativeApi;
        }
    }
    handleEvent(parameters) {
        const category = parameters.shift();
        const event = parameters.shift();
        if (category && category in this._eventHandlers) {
            this._eventHandlers[category].handleEvent(event, parameters);
        }
        else {
            throw new Error('Unknown event category: ' + category);
        }
    }
    handleInvocation(parameters) {
        const className = parameters.shift();
        const methodName = parameters.shift();
        const callback = parameters.shift();
        parameters.push((status, ...callbackParameters) => {
            this.invokeCallback(callback, CallbackStatus[status], ...callbackParameters);
        });
        // @ts-ignore
        window[className][methodName].apply(window[className], parameters);
    }
    getPlatform() {
        return this._platform;
    }
    setAutoBatchEnabled(enabled) {
        this._autoBatchEnabled = enabled;
    }
    invokeBatch(batch) {
        this._backend.handleInvocation(JSON.stringify(batch.getBatch()).replace(NativeBridge._doubleRegExp, '$1'));
    }
    invokeCallback(id, status, ...parameters) {
        this._backend.handleCallback(id, status, JSON.stringify(parameters));
    }
}
NativeBridge._doubleRegExp = /"(\d+\.\d+)=double"/g;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF0aXZlQnJpZGdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvTmF0aXZlL0JyaWRnZS9OYXRpdmVCcmlkZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTdELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUNyRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUl6RSxNQUFNLENBQU4sSUFBWSxjQUdYO0FBSEQsV0FBWSxjQUFjO0lBQ3RCLCtDQUFFLENBQUE7SUFDRixxREFBSyxDQUFBO0FBQ1QsQ0FBQyxFQUhXLGNBQWMsS0FBZCxjQUFjLFFBR3pCO0FBSUQsTUFBTSxPQUFPLFlBQVk7SUEyQnJCLFlBQVksT0FBdUIsRUFBRSxRQUFrQixFQUFFLFNBQVMsR0FBRyxJQUFJO1FBWmpFLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBQ2hDLDJCQUEyQjtRQUNuQixtQkFBYyxHQUE0QyxFQUFFLENBQUM7UUFRN0QsbUJBQWMsR0FBaUMsRUFBRSxDQUFDO1FBR3RELElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUM7SUFDdkMsQ0FBQztJQTNCTyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQWM7UUFDdkMsUUFBUSxNQUFNLEVBQUU7WUFDWixLQUFLLGNBQWMsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO2dCQUNsQyxPQUFPLGNBQWMsQ0FBQyxFQUFFLENBQUM7WUFDN0IsS0FBSyxjQUFjLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztnQkFDckMsT0FBTyxjQUFjLENBQUMsS0FBSyxDQUFDO1lBQ2hDO2dCQUNJLE1BQU0sSUFBSSxLQUFL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