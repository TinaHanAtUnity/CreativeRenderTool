import { NativeApi, ApiPackage } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { EventCategory } from 'Core/Constants/EventCategory';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Observable1, Observable2, Observable3 } from 'Core/Utilities/Observable';

enum WebAuthSessionEvents {
    SessionResult = 'SESSION_RESULT',
    StartSessionResult = 'START_SESSION_RESULT'
}

interface IAuthSessionObservers {
    startSessionResultObserver: Observable1<boolean>;
    sessionResultObserver: Observable2<string | null, string | null>;
}

// Interface for using ASWebAuthenticationSession on iOS
// IMPORTANT Add unit tests for this api once it is actually in use

// Split WebAuthSessionManager to separate file once we actually start using this.
export class WebAuthSessionManager {

    private webAuthApi: WebAuthApi;
    private sessionObserverDict: {[sessionId: string]: IAuthSessionObservers} = {};

    constructor(webAuthApi: WebAuthApi) {
        this.webAuthApi = webAuthApi;
        this.webAuthApi.sessionResultObserver.subscribe(this.handleSessionResult);
        this.webAuthApi.startSessionResultObserver.subscribe(this.handleStartSessionResult);
    }

    public createSession(authUrlString: string, callbackUrlScheme: string): Promise<string> {
        return this.webAuthApi.createSession(authUrlString, callbackUrlScheme).then((sessionId: string) => {
            // after getting the sessionId create observer object
            this.sessionObserverDict[sessionId] = {
                startSessionResultObserver: new Observable1(),
                sessionResultObserver: new Observable2()
            };
            return sessionId;
        });
    }

    public getSessionObservers(sessionId: string): IAuthSessionObservers | undefined {
        return this.sessionObserverDict[sessionId];
    }

    public startSession(sessionId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sessionObservers = this.sessionObserverDict[sessionId];
            if (sessionObservers) {
                // after triggering once remove observable from dictionary
                sessionObservers.startSessionResultObserver.subscribe((didStart) => {
                    resolve(didStart);
                });
                this.webAuthApi.startSession(sessionId).catch((error) => {
                    reject(error);
                });
            } else {
                reject(new Error(`Session with id ${sessionId} was never created`));
            }
        });
    }

    public removeSession(sessionId: string): Promise<void> {
        delete this.sessionObserverDict[sessionId];
        return this.webAuthApi.removeSession(sessionId);
    }

    public cancelSession(sessionId: string): Promise<void> {
        return this.webAuthApi.cancelSession(sessionId);
    }

    private handleSessionResult(sessionId: string, callbackUrl: string | null, errorString: string | null) {
        const sessionObserver = this.sessionObserverDict[sessionId];
        if (sessionObserver) {
            sessionObserver.sessionResultObserver.trigger(callbackUrl, errorString);
        }
        // cleanup session reference on native
        this.removeSession(sessionId);
    }

    private handleStartSessionResult(sessionId: string, didStart: boolean) {
        const sessionObserver = this.sessionObserverDict[sessionId];
        if (sessionObserver) {
            sessionObserver.startSessionResultObserver.trigger(didStart);
        }
    }
}

export class WebAuthApi extends NativeApi {

    // param1<string> is the session identifier
    // param2<boolean> is a boolean indicating if the session successfully started
    public startSessionResultObserver: Observable2<string, boolean> = new Observable2();
    // param1<string> is the session identifier
    // param2<string | null> is a possible callback url
    // param3<string | null> is a possible error string
    public sessionResultObserver: Observable3<string, string | null, string | null> = new Observable3();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'WebAuth', ApiPackage.CORE, EventCategory.WEB_AUTH_SESSION);
    }

    public createSession(authUrlString: string, callbackUrlScheme: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'createSession', [authUrlString, callbackUrlScheme]);
    }

    public startSession(sessionId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'startSession', [sessionId]);
    }

    public removeSession(sessionId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'removeSession', [sessionId]);
    }

    // After cancelling a session call remove
    public cancelSession(sessionId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'cancelSession', [sessionId]);
    }

    public handleEvent(event: string, parameters: unknown[]) {
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
    private handleSessionResult(parameters: unknown[]) {
        if (parameters.length >= 3) {
            const sessionId: string | null = <string>parameters[0];
            const callbackUrl: string | null = <string>parameters[1];
            const errorString: string | null = <string>parameters[2];
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

    private handleStartSessionResult(parameters: unknown[]) {
        if (parameters.length >= 2) {
            const sessionId: string | null = <string>parameters[0];
            const didStart: boolean = <boolean>parameters[1];
            if (sessionId) {
                this.startSessionResultObserver.trigger(sessionId, didStart);
            }
        }
    }
}
