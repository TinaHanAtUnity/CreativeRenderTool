import { NativeBridge } from 'Native/NativeBridge';
import { Request, INativeResponse } from 'Utilities/Request';
import { StorageType } from 'Native/Api/Storage';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { Analytics } from 'Utilities/Analytics';
import { RequestError } from 'Errors/RequestError';
import { Diagnostics } from 'Utilities/Diagnostics';

export class EventManager {

    private static getSessionKey(sessionId: string): string {
        return 'session.' + sessionId;
    }

    private static getSessionTimestampKey(sessionId: string): string {
        return EventManager.getSessionKey(sessionId) + '.ts';
    }

    private static getEventKey(sessionId: string, eventId: string): string {
        return EventManager.getSessionKey(sessionId) + '.operative.' + eventId;
    }

    private static getUrlKey(sessionId: string, eventId: string): string {
        return EventManager.getEventKey(sessionId, eventId) + '.url';
    }

    private static getDataKey(sessionId: string, eventId: string): string {
        return EventManager.getEventKey(sessionId, eventId) + '.data';
    }

    private _nativeBridge: NativeBridge;
    private _request: Request;

    constructor(nativeBridge: NativeBridge, request: Request) {
        this._nativeBridge = nativeBridge;
        this._request = request;
    }

    public operativeEvent(event: string, eventId: string, sessionId: string, url: string, data: string): Promise<INativeResponse | void> {
        this._nativeBridge.Sdk.logInfo('Unity Ads event: sending ' + event + ' event to ' + url);

        return this._request.post(url, data, [], {
            retries: 2,
            retryDelay: 10000,
            followRedirects: false,
            retryWithConnectionEvents: false
        }).catch(() => {
            this._nativeBridge.Storage.set(StorageType.PRIVATE, EventManager.getUrlKey(sessionId, eventId), url);
            this._nativeBridge.Storage.set(StorageType.PRIVATE, EventManager.getDataKey(sessionId, eventId), data);
            this._nativeBridge.Storage.write(StorageType.PRIVATE);
        });
    }

    public clickAttributionEvent(url: string, redirects: boolean): Promise<INativeResponse> {
        return this._request.get(url, [], {
            retries: 0,
            retryDelay: 0,
            followRedirects: redirects,
            retryWithConnectionEvents: false
        });
    }

    public thirdPartyEvent(event: string, sessionId: string, url: string): Promise<INativeResponse> {
        this._nativeBridge.Sdk.logInfo('Unity Ads third party event: sending ' + event + ' event to ' + url + ' (session ' + sessionId + ')');
        return this._request.get(url, [], {
            retries: 0,
            retryDelay: 0,
            followRedirects: true,
            retryWithConnectionEvents: false
        }).catch(error => {
            if(error instanceof RequestError) {
                error = new DiagnosticError(new Error(error.message), {
                    request: (<RequestError>error).nativeRequest,
                    event: event,
                    sessionId: sessionId,
                    url: url,
                    response: (<RequestError>error).nativeResponse
                });
            }
            return Analytics.trigger('third_party_event_failed', error);
        });
    }

    public startNewSession(sessionId: string): Promise<void[]> {
        const sessionTimestampKey = EventManager.getSessionTimestampKey(sessionId);
        const timestamp = Date.now();

        return Promise.all([
            this._nativeBridge.Storage.set<number>(StorageType.PRIVATE, sessionTimestampKey, timestamp),
            this._nativeBridge.Storage.write(StorageType.PRIVATE)
        ]).catch(error => {
            Diagnostics.trigger('session_start_failed', new DiagnosticError(error, {
                key: sessionTimestampKey,
                timestamp: timestamp
            }));
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
                        return this.getUnsentOperativeEvents(sessionId).then(events => {
                            return Promise.all(events.map(eventId => {
                                return this.resendEvent(sessionId, eventId);
                            }));
                        });
                    }
                });
            });
            return Promise.all(promises).catch(error => {
                Diagnostics.trigger('sending_stored_events_failed', error);
                return Promise.resolve([]);
            });
        });
    }

    public getUniqueEventId(): Promise<string> {
        return this._nativeBridge.DeviceInfo.getUniqueEventId();
    }

    private getUnsentSessions(): Promise<string[]> {
        return this._nativeBridge.Storage.getKeys(StorageType.PRIVATE, 'session', false);
    }

    private isSessionOutdated(sessionId: string): Promise<boolean> {
        return this._nativeBridge.Storage.get<number>(StorageType.PRIVATE, EventManager.getSessionTimestampKey(sessionId)).then(timestamp => {
            const timeThresholdMin: number = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
            const timeThresholdMax: number = new Date().getTime();

            return !(timestamp > timeThresholdMin && timestamp < timeThresholdMax);
        }).catch(() => {
            return true;
        });
    }

    private getUnsentOperativeEvents(sessionId: string): Promise<string[]> {
        return this._nativeBridge.Storage.getKeys(StorageType.PRIVATE, 'session.' + sessionId + '.operative', false);
    }

    private resendEvent(sessionId: string, eventId: string): Promise<void | void[]> {
        return this.getStoredOperativeEvent(sessionId, eventId).then(([url, data]) => {
            this._nativeBridge.Sdk.logInfo('Unity Ads operative event: resending operative event to ' + url + ' (session ' + sessionId + ', event ' + eventId + ')');
            return this._request.post(url, data);
        }).then(() => {
            return Promise.all([
                this._nativeBridge.Storage.delete(StorageType.PRIVATE, EventManager.getEventKey(sessionId, eventId)),
                this._nativeBridge.Storage.write(StorageType.PRIVATE)
            ]);
        }).catch(() => {
            // ignore failed resends, they will be retried later
        });
    }

    private getStoredOperativeEvent(sessionId: string, eventId: string): Promise<string[]> {
        return Promise.all([
            this._nativeBridge.Storage.get<string>(StorageType.PRIVATE, EventManager.getUrlKey(sessionId, eventId)),
            this._nativeBridge.Storage.get<string>(StorageType.PRIVATE, EventManager.getDataKey(sessionId, eventId))
        ]);
    }

    private deleteSession(sessionId: string): Promise<any[]> {
        return Promise.all([
            this._nativeBridge.Storage.delete(StorageType.PRIVATE, EventManager.getSessionKey(sessionId)),
            this._nativeBridge.Storage.write(StorageType.PRIVATE)
        ]);
    }

}
