import { FailedOperativeEventManager } from 'Ads/Managers/FailedOperativeEventManager';
import { Session } from 'Ads/Models/Session';
import { SessionUtils } from 'Ads/Utilities/SessionUtils';
import { StorageType } from 'Core/Native/Storage';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { StorageOperation } from 'Core/Utilities/StorageOperation';
import { FailedXpromoOperativeEventManager } from 'XPromo/Managers/FailedXpromoOperativeEventManager';
import { FailedPTSEventManager } from 'Ads/Managers/FailedPTSEventManager';
export class SessionManager {
    constructor(core, request, storageBridge) {
        this._core = core;
        this._request = request;
        this._storageBridge = storageBridge;
    }
    create(id) {
        this.startNewSession(id);
        return new Session(id);
    }
    startNewSession(sessionId) {
        const sessionTimestampKey = SessionUtils.getSessionStorageTimestampKey(sessionId);
        const timestamp = Date.now();
        const operation = new StorageOperation(StorageType.PRIVATE);
        operation.set(sessionTimestampKey, timestamp);
        this._storageBridge.queue(operation);
    }
    sendUnsentSessions() {
        return this.getUnsentSessions().then(sessions => {
            const promises = sessions.map(sessionId => {
                return this.isSessionOutdated(sessionId).then(outdated => {
                    if (outdated) {
                        return this.deleteSession(sessionId);
                    }
                    else {
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
    setGameSessionId(gameSessionId) {
        this._gameSessionId = gameSessionId;
    }
    getGameSessionId() {
        return this._gameSessionId;
    }
    deleteSession(sessionId) {
        const operation = new StorageOperation(StorageType.PRIVATE);
        operation.delete(SessionUtils.getSessionStorageKey(sessionId));
        this._storageBridge.queue(operation);
        return Promise.resolve([]);
    }
    getUnsentSessions() {
        return this._core.Storage.getKeys(StorageType.PRIVATE, 'session', false);
    }
    isSessionOutdated(sessionId) {
        return this._core.Storage.get(StorageType.PRIVATE, SessionUtils.getSessionStorageTimestampKey(sessionId)).then(timestamp => {
            const timeThresholdMin = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
            const timeThresholdMax = new Date().getTime();
            return !(timestamp > timeThresholdMin && timestamp < timeThresholdMax);
        }).catch(() => {
            return true;
        });
    }
    sendUnsentEvents(sessionId) {
        const promises = [];
        const failedOperativeEventManager = new FailedOperativeEventManager(this._core, sessionId);
        const failedXpromoOperativeEventManager = new FailedXpromoOperativeEventManager(this._core, sessionId);
        const failedUnityInternalPTSEventManager = new FailedPTSEventManager(this._core, sessionId);
        promises.push(failedOperativeEventManager.sendFailedEvents(this._request, this._storageBridge), failedXpromoOperativeEventManager.sendFailedEvents(this._request, this._storageBridge), failedUnityInternalPTSEventManager.sendFailedEvents(this._request, this._storageBridge));
        return Promise.all(promises);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Vzc2lvbk1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL01hbmFnZXJzL1Nlc3Npb25NYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBQ3ZGLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFMUQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUV6RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUNuRSxPQUFPLEVBQUUsaUNBQWlDLEVBQUUsTUFBTSxtREFBbUQsQ0FBQztBQUV0RyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUUzRSxNQUFNLE9BQU8sY0FBYztJQU92QixZQUFZLElBQWMsRUFBRSxPQUF1QixFQUFFLGFBQTRCO1FBQzdFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO0lBQ3hDLENBQUM7SUFFTSxNQUFNLENBQUMsRUFBVTtRQUNwQixJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLE9BQU8sSUFBSSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVNLGVBQWUsQ0FBQyxTQUFpQjtRQUNwQyxNQUFNLG1CQUFtQixHQUFHLFlBQVksQ0FBQyw2QkFBNkIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsRixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMs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