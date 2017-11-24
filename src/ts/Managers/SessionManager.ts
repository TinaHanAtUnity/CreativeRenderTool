import { Session } from 'Models/Session';
import { NativeBridge } from 'Native/NativeBridge';
import { StorageType } from 'Native/Api/Storage';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { SdkStats } from 'Utilities/SdkStats';

export class SessionManager {
    public static getSessionKey(sessionId: string): string {
        return 'session.' + sessionId;
    }

    private static getSessionTimestampKey(sessionId: string): string {
        return SessionManager.getSessionKey(sessionId) + '.ts';
    }

    private _nativeBridge: NativeBridge;
    private _gameSessionId: number;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public create(): Promise<Session> {
        return this._nativeBridge.DeviceInfo.getUniqueEventId().then(id => {
            this.startNewSession(id);
            return Promise.resolve(new Session(id));
        });
    }

    public startNewSession(sessionId: string): Promise<any[]> {
        const sessionTimestampKey = SessionManager.getSessionTimestampKey(sessionId);
        const timestamp = Date.now();

        return Promise.all([
            this._nativeBridge.Storage.set<number>(StorageType.PRIVATE, sessionTimestampKey, timestamp),
            this._nativeBridge.Storage.write(StorageType.PRIVATE)
        ]).catch(error => {
            Diagnostics.trigger('session_start_failed', new DiagnosticError(error, {
                key: sessionTimestampKey,
                timestamp: timestamp,
                adRequestOrdinal: SdkStats.getAdRequestOrdinal()
            }));
            return Promise.resolve([]);
        });
    }

    public sendUnsentSessions(operativeEventManager: OperativeEventManager): Promise<any[]> {
        return this.getUnsentSessions().then(sessions => {
            const promises = sessions.map(sessionId => {
                return this.isSessionOutdated(sessionId).then(outdated => {
                    if(outdated) {
                        return this.deleteSession(sessionId);
                    } else {
                        return operativeEventManager.sendUnsentEvents(sessionId);
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
}
