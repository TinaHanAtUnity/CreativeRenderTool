import { FailedOperativeEventManager } from 'Ads/Managers/FailedOperativeEventManager';
import { Session } from 'Ads/Models/Session';
import { SessionUtils } from 'Ads/Utilities/SessionUtils';
import { StorageApi, StorageType } from 'Core/Native/Storage';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Request } from 'Core/Managers/Request';
import { FailedXpromoOperativeEventManager } from 'XPromo/Managers/FailedXpromoOperativeEventManager';

export class SessionManager {
    private _storage: StorageApi;
    private _request: Request;
    private _gameSessionId: number;

    constructor(storage: StorageApi, request: Request) {
        this._storage = storage;
        this._request = request;
    }

    public create(id: string): Session {
        this.startNewSession(id);
        return new Session(id);
    }

    public startNewSession(sessionId: string): Promise<any[]> {
        const sessionTimestampKey = SessionUtils.getSessionStorageTimestampKey(sessionId);
        const timestamp = Date.now();

        return Promise.all([
            this._storage.set<number>(StorageType.PRIVATE, sessionTimestampKey, timestamp),
            this._storage.write(StorageType.PRIVATE)
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
            this._storage.delete(StorageType.PRIVATE, SessionUtils.getSessionStorageKey(sessionId)),
            this._storage.write(StorageType.PRIVATE)
        ]);
    }

    private getUnsentSessions(): Promise<string[]> {
        return this._storage.getKeys(StorageType.PRIVATE, 'session', false);
    }

    private isSessionOutdated(sessionId: string): Promise<boolean> {
        return this._storage.get<number>(StorageType.PRIVATE, SessionUtils.getSessionStorageTimestampKey(sessionId)).then(timestamp => {
            const timeThresholdMin: number = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
            const timeThresholdMax: number = new Date().getTime();

            return !(timestamp > timeThresholdMin && timestamp < timeThresholdMax);
        }).catch(() => {
            return true;
        });
    }

    private sendUnsentEvents(sessionId: string): Promise<any[]> {
        const promises: Array<Promise<any>> = [];
        const failedOperativeEventManager = new FailedOperativeEventManager(this._storage, sessionId);
        promises.push(failedOperativeEventManager.sendFailedEvents(this._request));
        const failedXpromoOperativeEventManager = new FailedXpromoOperativeEventManager(this._storage, sessionId);
        promises.push(failedXpromoOperativeEventManager.sendFailedEvents(this._request));
        return Promise.all(promises);
    }
}
