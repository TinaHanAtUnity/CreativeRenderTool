import { FailedOperativeEventManager } from 'Ads/Managers/FailedOperativeEventManager';
import { Session } from 'Ads/Models/Session';
import { SessionUtils } from 'Ads/Utilities/SessionUtils';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageType } from 'Core/Native/Storage';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Request } from 'Core/Utilities/Request';
import { FailedXpromoOperativeEventManager } from 'XPromo/Managers/FailedXpromoOperativeEventManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { StorageOperation } from 'Core/Utilities/StorageOperation';

export class SessionManager {
    private _nativeBridge: NativeBridge;
    private _request: Request;
    private _storageBridge: StorageBridge;
    private _gameSessionId: number;

    constructor(nativeBridge: NativeBridge, request: Request, storageBridge: StorageBridge) {
        this._nativeBridge = nativeBridge;
        this._request = request;
        this._storageBridge = storageBridge;
    }

    public create(id: string): Session {
        this.startNewSession(id);
        return new Session(id);
    }

    public startNewSession(sessionId: string): void {
        const sessionTimestampKey = SessionUtils.getSessionStorageTimestampKey(sessionId);
        const timestamp = Date.now();

        const operation = new StorageOperation(StorageType.PRIVATE);
        operation.set(sessionTimestampKey, timestamp);
        this._storageBridge.queue(operation);
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
        const operation = new StorageOperation(StorageType.PRIVATE);
        operation.delete(SessionUtils.getSessionStorageKey(sessionId));
        this._storageBridge.queue(operation);

        return Promise.resolve([]);
    }

    private getUnsentSessions(): Promise<string[]> {
        return this._nativeBridge.Storage.getKeys(StorageType.PRIVATE, 'session', false);
    }

    private isSessionOutdated(sessionId: string): Promise<boolean> {
        return this._nativeBridge.Storage.get<number>(StorageType.PRIVATE, SessionUtils.getSessionStorageTimestampKey(sessionId)).then(timestamp => {
            const timeThresholdMin: number = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
            const timeThresholdMax: number = new Date().getTime();

            return !(timestamp > timeThresholdMin && timestamp < timeThresholdMax);
        }).catch(() => {
            return true;
        });
    }

    private sendUnsentEvents(sessionId: string): Promise<any[]> {
        const promises: Promise<any>[] = [];
        const failedOperativeEventManager = new FailedOperativeEventManager(sessionId);
        promises.push(failedOperativeEventManager.sendFailedEvents(this._nativeBridge, this._request, this._storageBridge));
        const failedXpromoOperativeEventManager = new FailedXpromoOperativeEventManager(sessionId);
        promises.push(failedXpromoOperativeEventManager.sendFailedEvents(this._nativeBridge, this._request, this._storageBridge));
        return Promise.all(promises);
    }
}
