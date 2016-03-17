import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { EventManager } from 'Managers/EventManager';
import {NativeResponse} from "./Request";

export class Diagnostics {

    private static DiagnosticsBaseUrl: string = 'https://httpkafka.unityads.unity3d.com/v1/events';

    public static trigger(eventManager: EventManager, data: any, clientInfo?: ClientInfo, deviceInfo?: DeviceInfo): Promise<NativeResponse> {
        let messages = [];
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
