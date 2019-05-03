import { NativeApi, ApiPackage } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { EventCategory } from 'Core/Constants/EventCategory';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Observable1, Observable2 } from 'Core/Utilities/Observable';

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
export class WebAuthApi extends NativeApi {

    private sessionObserverDict: {[sessionId: string]: IAuthSessionObservers} = {};

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'WebAuth', ApiPackage.CORE, EventCategory.WEB_AUTH_SESSION);
    }

    public createSession(authUrlString: string, callbackUrlScheme: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'createSession', [authUrlString, callbackUrlScheme]).then((sessionId: string) => {
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
                this._nativeBridge.invoke<void>(this._fullApiClassName, 'startSession', [sessionId]).catch((error) => {
                    reject(error);
                });
            } else {
                reject(new Error(`Session with id ${sessionId} was never created`));
            }
        });
    }

    public removeSession(sessionId: string): Promise<void> {
        delete this.sessionObserverDict[sessionId];
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
            const sessionObserver = this.sessionObserverDict[sessionId];
            if (sessionObserver) {
                sessionObserver.sessionResultObserver.trigger(callbackUrl, errorString);
            }
            if (errorString) {
                // an error occurred
                Diagnostics.trigger('web_auth_session_error_result', {
                    errorString: errorString
                });
            }
            // cleanup session reference on native
            this.removeSession(sessionId);
        }
    }

    private handleStartSessionResult(parameters: unknown[]) {
        if (parameters.length >= 2) {
            const sessionId: string | null = <string>parameters[0];
            const didStart: boolean = <boolean>parameters[1];
            if (sessionId) {
                const sessionObservers = this.sessionObserverDict[sessionId];
                if (sessionObservers) {
                    sessionObservers.startSessionResultObserver.trigger(didStart);
                }
            }
        }
    }
}
