import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { EventManager } from 'Managers/EventManager';
import { INativeResponse } from 'Utilities/Request';

export class Diagnostics {

    private static DiagnosticsBaseUrl: string = 'https://httpkafka.unityads.unity3d.com/v1/events';
    private static _eventManager: EventManager;
    private static _clientInfo: ClientInfo | undefined;
    private static _deviceInfo: DeviceInfo | undefined;

    public static trigger(data: any): Promise<INativeResponse> {
        let messages: any[] = []; // todo: use a more specific type
        messages.push({
            'type': 'ads.sdk2.diagnostics',
            'msg': data
        });

        return Diagnostics.createCommonObject(this._clientInfo, this._deviceInfo).then(commonObject => {
            messages.unshift(commonObject);

            let rawData: string = messages.map(message => JSON.stringify(message)).join('\n');
            return this._eventManager.diagnosticEvent(Diagnostics.DiagnosticsBaseUrl, rawData);
        });
    }

    public static setEventManager(eventManager: EventManager) {
        this._eventManager = eventManager;
    }

    public static setClientInfo(clientInfo?: ClientInfo) {
        this._clientInfo = clientInfo;
    }

    public static setDeviceInfo(deviceInfo?: DeviceInfo) {
        this._deviceInfo = deviceInfo;
    }

    public static setTestBaseUrl(baseUrl: string) {
        Diagnostics.DiagnosticsBaseUrl = baseUrl + '/v1/events';
    }

    private static createCommonObject(clientInfo?: ClientInfo, deviceInfo?: DeviceInfo): Promise<any> {
        let common: any = {
            'common': {
                'client': clientInfo ? clientInfo.getDTO() : null,
                'device': null,
            }
        };

        if (deviceInfo) {
            return deviceInfo.getDTO().then(deviceInfoDTO => {
                common.common.device = deviceInfoDTO;
                return common;
            }).catch(err => {
                return common;
            });
        } else {
            return Promise.resolve(common);
        }
    }
}
