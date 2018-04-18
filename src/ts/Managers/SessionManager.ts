import { Session } from 'Models/Session';
import { NativeBridge } from 'Native/NativeBridge';
import { StorageType } from 'Native/Api/Storage';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { SdkStats } from 'Utilities/SdkStats';
import { Request } from 'Utilities/Request';

export class SessionManager {
    public static getSessionKey(sessionId: string): string {
        return 'session.' + sessionId;
    }

    private static getSessionTimestampKey(sessionId: string): string {
        return SessionManager.getSessionKey(sessionId) + '.ts';
    }

    private _nativeBridge: NativeBridge;
    private _request: Request;
    private _gameSessionId: number;

    constructor(nativeBridge: NativeBridge, request: Request) {
        this._nativeBridge = nativeBridge;
        this._request = request;
    }

    public create(id: string): Session {
        this.startNewSession(id);
        return new Session(id);
    }

    public startNewSession(sessionId: string): Promise<any[]> {
        const sessionTimestampKey = SessionManager.getSessionTimestampKey(sessionId);
        const timestamp = Date.now();

        return Promise.all([
            this._nativeBridge.Storage.set<number>(StorageType.PRIVATE, sessionTimestampKey, timestamp),
            this._nativeBridge.Storage.write(StorageType.PRIVATE)
        ]).catch(error => {
            return Promise.resolve([]);
        });
    }

    public sendUnsentSessions(): Promise<any[]> {
        return this.getUnsentSessions().then(sessions => {
            const promises = sessions.map(sessionId => {
                return this.isSessionOutdated(sessionId).then(outdated => {
                    if(outdated) {
                        return this.deleteSession(sessionId);
                    } else {
                        return this.sendUnsentEvents(sessionId);
                    }
                });
            });
            return Promise.all(promises).catch(error => {
                Diagnostics.trigger('sending_stored_events_failed', error);
                return Promise.resolve([]);
            });
        });
    }

    public setGameSessionId(gameSessionId: number): void {
        this._gameSessionId = gameSessionId;
    }

    public getGameSessionId(): number {
        return this._gameSessionId;
    }

    private deleteSession(sessionId: string): Promise<any[]> {
        return Promise.all([
            this._nativeBridge.Storage.delete(StorageType.PRIVATE, SessionManager.getSessionKey(sessionId)),
            this._nativeBridge.Storage.write(StorageType.PRIVATE)
        ]);
    }

    private getUnsentSessions(): Promise<string[]> {
        return this._nativeBridge.Storage.getKeys(StorageType.PRIVATE, 'session', false);
    }

    private isSessionOutdated(sessionId: string): Promise<boolean> {
        return this._nativeBridge.Storage.get<number>(StorageType.PRIVATE, SessionManager.getSessionTimestampKey(sessionId)).then(timestamp => {
            const timeThresholdMin: number = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
            const timeThresholdMax: number = new Date().getTime();

            return !(timestamp > timeThresholdMin && timestamp < timeThresholdMax);
        }).catch(() => {
            return true;
        });
    }

    private sendUnsentEvents(sessionId: string): Promise<any[]> {
        return this.getUnsentEvents(sessionId).then(events => {
            return Promise.all(events.map(eventId => {
                return this.resendEvent(sessionId, eventId);
            }));
        });
    }

    private getUnsentEvents(sessionId: string): Promise<string[]> {
        return this._nativeBridge.Storage.getKeys(StorageType.PRIVATE, 'session.' + sessionId + '.operative', false);
    }

    private resendEvent(sessionId: string, eventId: string): Promise<void | void[]> {
        return this.getStoredEvent(sessionId, eventId).then(([url, data]) => {
            this._nativeBridge.Sdk.logDebug('Unity Ads operative event: resending operative event to ' + url + ' (session ' + sessionId + ', event ' + eventId + ')');
            return this._request.post(url, data);
        }).then(() => {
            return Promise.all([
                this._nativeBridge.Storage.delete(StorageType.PRIVATE, OperativeEventManager.getEventKey(sessionId, eventId)),
                this._nativeBridge.Storage.write(StorageType.PRIVATE)
            ]);
        }).catch(() => {
            // ignore failed resends, they will be retried later
        });
    }

    private getStoredEvent(sessionId: string, eventId: string): Promise<string[]> {
        return Promise.all([
            this._nativeBridge.Storage.get<string>(StorageType.PRIVATE, OperativeEventManager.getUrlKey(sessionId, eventId)),
            this._nativeBridge.Storage.get<string>(StorageType.PRIVATE, OperativeEventManager.getDataKey(sessionId, eventId))
        ]);
    }
}
