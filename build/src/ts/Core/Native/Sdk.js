import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
export var InitErrorCode;
(function (InitErrorCode) {
    InitErrorCode[InitErrorCode["Unknown"] = 0] = "Unknown";
    InitErrorCode[InitErrorCode["GameIdDisabled"] = 1] = "GameIdDisabled";
    InitErrorCode[InitErrorCode["ConfigurationError"] = 2] = "ConfigurationError";
    InitErrorCode[InitErrorCode["InvalidArgument"] = 3] = "InvalidArgument";
})(InitErrorCode || (InitErrorCode = {}));
export class SdkApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Sdk', ApiPackage.CORE);
    }
    loadComplete() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'loadComplete');
    }
    initComplete() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'initComplete');
    }
    initError(message, code) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'initError', [message, code]);
    }
    setDebugMode(debugMode) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setDebugMode', [debugMode]);
    }
    // This is broken on all released iOS versions
    // public getDebugMode(): Promise<boolean> {
    //     return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'getDebugMode');
    // }
    logError(message) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'logError', [message]);
    }
    logWarning(message) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'logWarning', [message]);
    }
    logInfo(message) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'logInfo', [message]);
    }
    logDebug(message) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'logDebug', [message]);
    }
    reinitialize() {
        this._nativeBridge.invoke(this._fullApiClassName, 'reinitialize');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2RrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvTmF0aXZlL1Nkay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBS3JFLE1BQU0sQ0FBTixJQUFZLGFBS1g7QUFMRCxXQUFZLGFBQWE7SUFDckIsdURBQU8sQ0FBQTtJQUNQLHFFQUFjLENBQUE7SUFDZCw2RUFBa0IsQ0FBQTtJQUNsQix1RUFBZSxDQUFBO0FBQ25CLENBQUMsRUFMVyxhQUFhLEtBQWIsYUFBYSxRQUt4QjtBQU1ELE1BQU0sT0FBTyxNQUFPLFNBQVEsU0FBUztJQUNqQyxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRU0sWUFBWTtRQUNmLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQWlCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUM3RixDQUFDO0lBRU0sWUFBWTtRQUNmLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFFTSxTQUFTLENBQUMsT0FBZSxFQUFFLElBQVk7UUFDMUMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDakcsQ0FBQztJQUVNLFlBQVksQ0FBQyxTQUFrQjtRQUNsQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxjQUFjLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ2hHLENBQUM7SUFFRCw4Q0FBOEM7SUFDOUMsNENBQTRDO0lBQzVDLHlGQUF5RjtJQUN6RixJQUFJO0lBRUcsUUFBUSxDQUFDLE9BQWU7UUFDM0IsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsVUFBVSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUMxRixDQUFDO0lBRU0sVUFBVSxDQUFDLE9BQWU7UUFDN0IsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUM1RixDQUFDO0lBRU0sT0FBTyxDQUFDLE9BQWU7UUFDMUIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBRU0sUUFBUSxDQUFDLE9BQWU7UUFDM0IsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsVUFBVSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUMxRixDQUFDO0lBRU0sWUFBWTtRQUNmLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUM1RSxDQUFDO0NBQ0oifQ==