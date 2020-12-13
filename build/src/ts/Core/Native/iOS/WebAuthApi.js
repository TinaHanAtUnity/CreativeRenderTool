import { NativeApi, ApiPackage } from 'Core/Native/Bridge/NativeApi';
import { EventCategory } from 'Core/Constants/EventCategory';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Observable1, Observable2, Observable3 } from 'Core/Utilities/Observable';
var WebAuthSessionEvents;
(function (WebAuthSessionEvents) {
    WebAuthSessionEvents["SessionResult"] = "SESSION_RESULT";
    WebAuthSessionEvents["StartSessionResult"] = "START_SESSION_RESULT";
})(WebAuthSessionEvents || (WebAuthSessionEvents = {}));
// Interface for using ASWebAuthenticationSession on iOS
// IMPORTANT Add unit tests for this api once it is actually in use
// Split WebAuthSessionManager to separate file once we actually start using this.
export class WebAuthSessionManager {
    constructor(webAuthApi) {
        this.sessionObserverDict = {};
        this.webAuthApi = webAuthApi;
        this.webAuthApi.sessionResultObserver.subscribe(this.handleSessionResult);
        this.webAuthApi.startSessionResultObserver.subscribe(this.handleStartSessionResult);
    }
    createSession(authUrlString, callbackUrlScheme) {
        return this.webAuthApi.createSession(authUrlString, callbackUrlScheme).then((sessionId) => {
            // after getting the sessionId create observer object
            this.sessionObserverDict[sessionId] = {
                startSessionResultObserver: new Observable1(),
                sessionResultObserver: new Observable2()
            };
            return sessionId;
        });
    }
    getSessionObservers(sessionId) {
        return this.sessionObserverDict[sessionId];
    }
    startSession(sessionId) {
        return new Promise((resolve, reject) => {
            const sessionObservers = this.sessionObserverDict[sessionId];
            if (sessionObservers) {
                // after triggering once remove observable from dictionary
                sessionObservers.startSessionResultObserver.subscribe((didStart) => {
                    resolve(didStart);
                });
                this.webAuthApi.startSession(sessionId).catch((error) => {
                    reject(error);
                });
            }
            else {
                reject(new Error(`Session with id ${sessionId} was never created`));
            }
        });
    }
    removeSession(sessionId) {
        delete this.sessionObserverDict[sessionId];
        return this.webAuthApi.removeSession(sessionId);
    }
    cancelSession(sessionId) {
        return this.webAuthApi.cancelSession(sessionId);
    }
    handleSessionResult(sessionId, callbackUrl, errorString) {
        const sessionObserver = this.sessionObserverDict[sessionId];
        if (sessionObserver) {
            sessionObserver.sessionResultObserver.trigger(callbackUrl, errorString);
        }
        // cleanup session reference on native
        this.removeSession(sessionId);
    }
    handleStartSessionResult(sessionId, didStart) {
        const sessionObserver = this.sessionObserverDict[sessionId];
        if (sessionObserver) {
            sessionObserver.startSessionResultObserver.trigger(didStart);
        }
    }
}
export class WebAuthApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'WebAuth', ApiPackage.CORE, EventCategory.WEB_AUTH_SESSION);
        // param1<string> is the session identifier
        // param2<boolean> is a boolean indicating if the session successfully started
        this.startSessionResultObserver = new Observable2();
        // param1<string> is the session identifier
        // param2<string | null> is a possible callback url
        // param3<string | null> is a possible error string
        this.sessionResultObserver = new Observable3();
    }
    createSession(authUrlString, callbackUrlScheme) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'createSession', [authUrlString, callbackUrlScheme]);
    }
    startSession(sessionId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'startSession', [sessionId]);
    }
    removeSession(sessionId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'removeSession', [sessionId]);
    }
    // After cancelling a session call remove
    cancelSession(sessionId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'cancelSession', [sessionId]);
    }
    handleEvent(event, parameters) {
        switch (event) {
            case WebAuthSessionEvents.SessionResult:
                this.handleSessionResult(parameters);
                break;
            case WebAuthSessionEvents.StartSessionResult:
                this.handleStartSessionResult(parameters);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
    // the information from this function should be used in the future when we don't have IDFA
    handleSessionResult(parameters) {
        if (parameters.length >= 3) {
            const sessionId = parameters[0];
            const callbackUrl = parameters[1];
            const errorString = parameters[2];
            if (sessionId) {
                this.sessionResultObserver.trigger(sessionId, callbackUrl, errorString);
            }
            if (errorString) {
                // an error occurred
                Diagnostics.trigger('web_auth_session_error_result', {
                    errorString: errorString
                });
            }
        }
    }
    handleStartSessionResult(parameters) {
        if (parameters.length >= 2) {
            const sessionId = parameters[0];
            const didStart = parameters[1];
            if (sessionId) {
                this.startSessionResultObserver.trigger(sessionId, didStart);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2ViQXV0aEFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL05hdGl2ZS9pT1MvV2ViQXV0aEFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRXJFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDekQsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFbEYsSUFBSyxvQkFHSjtBQUhELFdBQUssb0JBQW9CO0lBQ3JCLHdEQUFnQyxDQUFBO0lBQ2hDLG1FQUEyQyxDQUFBO0FBQy9DLENBQUMsRUFISSxvQkFBb0IsS0FBcEIsb0JBQW9CLFFBR3hCO0FBT0Qsd0RBQXdEO0FBQ3hELG1FQUFtRTtBQUVuRSxrRkFBa0Y7QUFDbEYsTUFBTSxPQUFPLHFCQUFxQjtJQUs5QixZQUFZLFVBQXNCO1FBRjFCLHdCQUFtQixHQUFpRCxFQUFFLENBQUM7UUFHM0UsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFDLFVBQVUsQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDeEYsQ0FBQztJQUVNLGFBQWEsQ0FBQyxhQUFxQixFQUFFLGlCQUF5QjtRQUNqRSxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQWlCLEVBQUUsRUFBRTtZQUM5Rixx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