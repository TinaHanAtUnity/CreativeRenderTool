import { NativeBridge } from 'Native/NativeBridge';
import { Request, NativeResponse } from 'Utilities/Request';
import { StorageApi, StorageType } from 'Native/Api/Storage';
import { SdkApi } from 'Native/Api/Sdk';

export class EventManager {
    private _request: Request;

    constructor(request: Request) {
        this._request = request;
    }

    public operativeEvent(event: string, eventId: string, sessionId: string, url: string, data: string): Promise<void> {
        SdkApi.logInfo('Unity Ads operative event: sending ' + event + ' event to ' + url + ' (session ' + sessionId + ', event ' + eventId + ')');

        let urlKey: string = this.getUrlKey(sessionId, eventId);
        let dataKey: string = this.getDataKey(sessionId, eventId);

        StorageApi.set(StorageType.PRIVATE, urlKey, url);
        StorageApi.set(StorageType.PRIVATE, dataKey, data);
        StorageApi.write(StorageType.PRIVATE);

        return this._request.post(url, data, [], 5, 5000).then(() => {
            return StorageApi.delete(StorageType.PRIVATE, urlKey);
        }).then(() => {
            return StorageApi.delete(StorageType.PRIVATE, dataKey);
        }).then(() => {
            return StorageApi.write(StorageType.PRIVATE);
        });
    }

    public thirdPartyEvent(event: string, sessionId: string, url: string): Promise<NativeResponse> {
        SdkApi.logInfo('Unity Ads third party event: sending ' + event + ' event to ' + url + ' (session ' + sessionId + ')');
        return this._request.get(url);
    }

    public diagnosticEvent(url: string, data: string): Promise<NativeResponse> {
        return this._request.post(url, data);
    }

    public sendUnsentSessions(): Promise<any[]> {
        return this.getUnsentSessions().then(([sessions]) => {
            let promises = sessions.map(sessionId => {
                return this.getUnsentOperativeEvents(sessionId).then(([events]) => {
                    return Promise.all(events.map(eventId => {
                        return this.resendEvent(sessionId, eventId);
                    }));
                });
            });
            return Promise.all(promises);
        });
    }

    public getUniqueEventId(): Promise<string> {
        return NativeBridge.getInstance().invoke<string>('DeviceInfo', 'getUniqueEventId');
    }

    private getUnsentSessions(): Promise<any[]> {
        return StorageApi.getKeys(StorageType.PRIVATE, 'session', false);
    }

    private getUnsentOperativeEvents(sessionId: string): Promise<any[]> {
        return StorageApi.getKeys(StorageType.PRIVATE, 'session.' + sessionId + '.operative', false);
    }

    private resendEvent(sessionId: string, eventId: string): Promise<void> {
        let urlKey: string = this.getUrlKey(sessionId, eventId);
        let dataKey: string = this.getDataKey(sessionId, eventId);

        return this.getStoredOperativeEvent(sessionId, eventId).then(([url, data]) => {
            SdkApi.logInfo('Unity Ads operative event: resending operative event to ' + url + ' (session ' + sessionId + ', event + ' + eventId + ')');
            return this._request.post(url, data, [], 5, 5000);
        }).then(() => {
            return StorageApi.delete(StorageType.PRIVATE, urlKey);
        }).then(() => {
            return StorageApi.delete(StorageType.PRIVATE, dataKey);
        }).then(() => {
            return StorageApi.write(StorageType.PRIVATE);
        });
    }

    private getStoredOperativeEvent(sessionId: string, eventId: string): Promise<[string, string]> {
        return Promise.all([
            StorageApi.get(StorageType.PRIVATE, this.getUrlKey(sessionId, eventId)),
            StorageApi.get(StorageType.PRIVATE, this.getDataKey(sessionId, eventId))
        ]);
    }

    private getUrlKey(sessionId: string, eventId: string): string {
        return 'session.' + sessionId + '.operative.' + eventId + '.url';
    }

    private getDataKey(sessionId: string, eventId: string): string {
        return 'session.' + sessionId + '.operative.' + eventId + '.data';
    }
}
