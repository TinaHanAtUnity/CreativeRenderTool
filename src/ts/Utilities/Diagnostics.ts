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

        return Diagnostics.createCommonObject(clientInfo, deviceInfo).then(commonObject => {
            messages.unshift(commonObject);

            let rawData: string = messages.map(message => JSON.stringify(message)).join('\n');
            return eventManager.diagnosticEvent(Diagnostics.DiagnosticsBaseUrl, rawData);
        });
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
                console.log("create common object != null then");

                common.device = deviceInfoDTO;
                return common
            });
        } else {
            return Promise.resolve(common);
        }

    }
}
