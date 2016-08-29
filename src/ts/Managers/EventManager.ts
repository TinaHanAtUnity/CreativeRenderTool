import { NativeBridge } from 'Native/NativeBridge';
import { Request, INativeResponse } from 'Utilities/Request';
import { StorageType } from 'Native/Api/Storage';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { Diagnostics } from 'Utilities/Diagnostics';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';

export class EventManager {

    private _nativeBridge: NativeBridge;
    private _request: Request;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;

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

    constructor(nativeBridge: NativeBridge, request: Request, clientInfo?: ClientInfo, deviceInfo?: DeviceInfo) {
        this._nativeBridge = nativeBridge;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
    }

    public operativeEvent(event: string, eventId: string, sessionId: string, url: string, data: string): Promise<void[]> {
        this._nativeBridge.Sdk.logInfo('Unity Ads event: sending ' + event + ' event to ' + url);

        this._nativeBridge.Storage.set(StorageType.PRIVATE, EventManager.getUrlKey(sessionId, eventId), url);
        this._nativeBridge.Storage.set(StorageType.PRIVATE, EventManager.getDataKey(sessionId, eventId), data);
        this._nativeBridge.Storage.write(StorageType.PRIVATE);

        return this._request.post(url, data, [], {
            retries: 5,
            retryDelay: 5000,
            followRedirects: false,
            retryWithConnectionEvents: false
        }).then(() => {
            return Promise.all([
                this._nativeBridge.Storage.delete(StorageType.PRIVATE, EventManager.getEventKey(sessionId, eventId)),
                this._nativeBridge.Storage.write(StorageType.PRIVATE)
            ]);
        });
    }

    public clickAttributionEvent(sessionId: string, url: string, redirects: boolean): Promise<INativeResponse> {
        if(redirects) {
            return this._request.get(url, [], {
                retries: 0,
                retryDelay: 0,
                followRedirects: true,
                retryWithConnectionEvents: false
            });
        } else {
            return this._request.get(url);
        }
    }

    public thirdPartyEvent(event: string, sessionId: string, url: string): Promise<INativeResponse> {
        this._nativeBridge.Sdk.logInfo('Unity Ads third party event: sending ' + event + ' event to ' + url + ' (session ' + sessionId + ')');
        return this._request.get(url, [], {
            retries: 0,
            retryDelay: 0,
            followRedirects: true,
            retryWithConnectionEvents: false
        }).catch(([request, message]) => {
            let error: DiagnosticError = new DiagnosticError(new Error(message), {
                event: event,
                sessionId: sessionId,
                url: url
            });

            return Diagnostics.trigger(this, {
                'type': 'third_party_event_failed',
                'error': error
            }, this._clientInfo, this._deviceInfo);
        });
    }

    public diagnosticEvent(url: string, data: string): Promise<INativeResponse> {
        return this._request.post(url, data);
    }

    public startNewSession(sessionId: string): Promise<void[]> {
        return Promise.all([
            this._nativeBridge.Storage.set<number>(StorageType.PRIVATE, EventManager.getSessionTimestampKey(sessionId), Date.now()),
            this._nativeBridge.Storage.write(StorageType.PRIVATE)
        ]);
    }

    public sendUnsentSessions(): Promise<any[]> {
        return this.getUnsentSessions().then(sessions => {
            let promises = sessions.map(sessionId => {
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
        return this._nativeBridge.Storage.get<number>(StorageType.PRIVATE, EventManager.getSessionTimestampKey(sessionId)).then(timestamp => {
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
                this._nativeBridge.Storage.delete(StorageType.PRIVATE, EventManager.getEventKey(sessionId, eventId)),
                this._nativeBridge.Storage.write(StorageType.PRIVATE)
            ]);
        });
    }

    private getStoredOperativeEvent(sessionId: string, eventId: string): Promise<[string, string]> {
        return Promise.all([
            this._nativeBridge.Storage.get(StorageType.PRIVATE, EventManager.getUrlKey(sessionId, eventId)),
            this._nativeBridge.Storage.get(StorageType.PRIVATE, EventManager.getDataKey(sessionId, eventId))
        ]);
    }

    private deleteSession(sessionId: string): Promise<any[]> {
        return Promise.all([
            this._nativeBridge.Storage.delete(StorageType.PRIVATE, EventManager.getSessionKey(sessionId)),
            this._nativeBridge.Storage.write(StorageType.PRIVATE)
        ]);
    }

}
