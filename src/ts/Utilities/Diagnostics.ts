import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { EventManager } from 'Managers/EventManager';
import { INativeResponse } from 'Utilities/Request';

export class Diagnostics {

    private static DiagnosticsBaseUrl: string = 'https://httpkafka.unityads.unity3d.com/v1/events';

    public static trigger(eventManager: EventManager, data: any, clientInfo?: ClientInfo, deviceInfo?: DeviceInfo): Promise<INativeResponse> {
        let messages: any[] = []; // todo: use a more specific type
        messages.push({
            'type': 'ads.sdk2.diagnostics',
            'msg': data
        });
        messages.unshift(Diagnostics.createCommonObject(clientInfo, deviceInfo));

        let rawData: string = messages.map(message => JSON.stringify(message)).join('\n');
        return eventManager.diagnosticEvent(Diagnostics.DiagnosticsBaseUrl, rawData);
    }

    private static createCommonObject(clientInfo?: ClientInfo, deviceInfo?: DeviceInfo) {
        return {
            'common': {
                'client': clientInfo ? clientInfo.getDTO() : null,
                'device': deviceInfo ? deviceInfo.getDTO() : null
             }
        };
    }

}
