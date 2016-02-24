import { Request } from 'Request';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';

export class Diagnostics {

    private static DiagnosticsBaseUrl = 'https://httpkafka.unityads.unity3d.com/v1/events';

    public static trigger(request: Request, data: any, deviceInfo?: DeviceInfo, clientInfo?: ClientInfo): Promise<any[]> {
        let messages = [];
        messages.push({
            'type': 'ads.sdk2.diagnostics',
            'msg': data
        });
        messages.unshift(Diagnostics.createCommonObject(deviceInfo, clientInfo));

        let rawData = messages.map(message => JSON.stringify(message)).join('\n');
        return request.post(Diagnostics.DiagnosticsBaseUrl, rawData);
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
