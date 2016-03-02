import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { EventManager } from 'Managers/EventManager';

export class Diagnostics {

    private static DiagnosticsBaseUrl: string = 'https://httpkafka.unityads.unity3d.com/v1/events';

    public static trigger(eventManager: EventManager, data: any, deviceInfo?: DeviceInfo, clientInfo?: ClientInfo): Promise<any[]> {
        let messages = [];
        messages.push({
            'type': 'ads.sdk2.diagnostics',
            'msg': data
        });
        messages.unshift(Diagnostics.createCommonObject(deviceInfo, clientInfo));

        let rawData: string = messages.map(message => JSON.stringify(message)).join('\n');
        return eventManager.diagnosticEvent(Diagnostics.DiagnosticsBaseUrl, rawData);
    }

    private static createCommonObject(deviceInfo?: DeviceInfo, clientInfo?: ClientInfo) {
        return {
            'common': {
                'device': deviceInfo ? deviceInfo.getDTO() : null,
                'client': clientInfo ? clientInfo.getDTO() : null
             }
        };
    }

}
