import { NativeBridge } from 'Native/NativeBridge';
import { Request, INativeResponse } from 'Utilities/Request';
import { StorageType } from 'Native/Api/Storage';

export class EventManager {

    private _nativeBridge: NativeBridge;
    private _request: Request;

    constructor(nativeBridge: NativeBridge, request: Request) {
        this._nativeBridge = nativeBridge;
        this._request = request;
    }

    public operativeEvent(event: string, eventId: string, sessionId: string, url: string, data: string): Promise<void[]> {
        this._nativeBridge.Sdk.logInfo('Unity Ads operative event: sending ' + event + ' event to ' + url + ' (session ' + sessionId + ', event ' + eventId + ')');

        this._nativeBridge.Storage.set(StorageType.PRIVATE, this.getUrlKey(sessionId, eventId), url);
        this._nativeBridge.Storage.set(StorageType.PRIVATE, this.getDataKey(sessionId, eventId), data);
        this._nativeBridge.Storage.write(StorageType.PRIVATE);

        return this._request.post(url, data, [], 5, 5000).then(() => {
            return Promise.all([
                this._nativeBridge.Storage.delete(StorageType.PRIVATE, this.getEventKey(sessionId, eventId)),
                this._nativeBridge.Storage.write(StorageType.PRIVATE)
            ]);
        });
    }

    public clickAttributionEvent(sessionId: string, url: string, redirects: boolean): Promise<INativeResponse> {
        if (redirects) {
            return this._request.get(url, [], 0, 0, {followRedirects: true});
        } else {
            return this._request.get(url);
        }
    }

    public diagnosticEvent(url: string, data: string): Promise<INativeResponse> {
        return this._request.post(url, data);
    }

    public startNewSession(sessionId: string): Promise<void[]> {
        return Promise.all([
            this._nativeBridge.Storage.set<number>(StorageType.PRIVATE, this.getSessionTimestampKey(sessionId), Date.now()),
            this._nativeBridge.Storage.write(StorageType.PRIVATE)
        ]);
    }

    public sendUnsentSessions(): Promise<any[]> {
        return this.getUnsentSessions().then(sessions => {
            let promises = sessions.map(sessionId => {
                return this.isSessionOutdated(sessionId).then(outdated => {
                    if (outdated) {
                        return this.deleteSession(sessionId);
                    } else {
                        return this.getUnsentOperativeEvents(sessionId).then(events => {
                            return Promise.all(events.map(eventId => {
                                return this.resendEvent(sessionId, eventId);
                            }));
                        });
                    }
                });
            });
            return Promise.all(promises);
        });
    }

    public getUniqueEventId(): Promise<string> {
        return this._nativeBridge.DeviceInfo.getUniqueEventId();
    }

    private getUnsentSessions(): Promise<string[]> {
        return this._nativeBridge.Storage.getKeys(StorageType.PRIVATE, 'session', false);
    }

    private isSessionOutdated(sessionId: string): Promise<boolean> {
        return this._nativeBridge.Storage.get<number>(StorageType.PRIVATE, this.getSessionTimestampKey(sessionId)).then(timestamp => {
            let timeThresholdMin: number = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
            let timeThresholdMax: number = new Date().getTime();

            return !(timestamp > timeThresholdMin && timestamp < timeThresholdMax);
        }).catch(() => {
            return true;
        });
    }

    private getUnsentOperativeEvents(sessionId: string): Promise<string[]> {
        return this._nativeBridge.Storage.getKeys(StorageType.PRIVATE, 'session.' + sessionId + '.operative', false);
    }

    private resendEvent(sessionId: string, eventId: string): Promise<void[]> {
        return this.getStoredOperativeEvent(sessionId, eventId).then(([url, data]) => {
            this._nativeBridge.Sdk.logInfo('Unity Ads operative event: resending operative event to ' + url + ' (session ' + sessionId + ', event ' + eventId + ')');
            return this._request.post(url, data);
        }).then(() => {
            return Promise.all([
                this._nativeBridge.Storage.delete(StorageType.PRIVATE, this.getEventKey(sessionId, eventId)),
                this._nativeBridge.Storage.write(StorageType.PRIVATE)
            ]);
        });
    }

    private getStoredOperativeEvent(sessionId: string, eventId: string): Promise<[string, string]> {
        return Promise.all([
            this._nativeBridge.Storage.get(StorageType.PRIVATE, this.getUrlKey(sessionId, eventId)),
            this._nativeBridge.Storage.get(StorageType.PRIVATE, this.getDataKey(sessionId, eventId))
        ]);
    }

    private deleteSession(sessionId: string): Promise<any[]> {
        return Promise.all([
            this._nativeBridge.Storage.delete(StorageType.PRIVATE, this.getSessionKey(sessionId)),
            this._nativeBridge.Storage.write(StorageType.PRIVATE)
        ]);
    }

    private getSessionKey(sessionId: string): string {
        return 'session.' + sessionId;
    }

    private getSessionTimestampKey(sessionId: string): string {
        return this.getSessionKey(sessionId) + '.ts';
    }

    private getEventKey(sessionId: string, eventId: string): string {
        return this.getSessionKey(sessionId) + '.operative.' + eventId;
    }

    private getUrlKey(sessionId: string, eventId: string): string {
        return this.getEventKey(sessionId, eventId) + '.url';
    }

    private getDataKey(sessionId: string, eventId: string): string {
        return this.getEventKey(sessionId, eventId) + '.data';
    }
}
