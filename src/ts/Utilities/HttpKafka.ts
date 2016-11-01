import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { INativeResponse, Request } from 'Utilities/Request';

export class HttpKafka {
    public static setRequest(request: Request) {
        HttpKafka._request = request;
    }

    public static setClientInfo(clientInfo?: ClientInfo) {
        HttpKafka._clientInfo = clientInfo;
    }

    public static setDeviceInfo(deviceInfo?: DeviceInfo) {
        HttpKafka._deviceInfo = deviceInfo;
    }

    public static sendEvent(type: string, data: any): Promise<INativeResponse> {
        if(!HttpKafka._request) {
            // if request is not set, this is likely a test that does not care about analytics or diagnostics
            return Promise.resolve({url: HttpKafka.KafkaBaseUrl, response: '', responseCode: 200, headers: null});
        }

        const messages: any[] = [];
        messages.push({
            'type': 'ads.sdk2.' + type,
            'msg': data
        });

        return HttpKafka.createCommonObject(this._clientInfo, this._deviceInfo).then(commonObject => {
            messages.unshift(commonObject);

            const rawData: string = messages.map(message => JSON.stringify(message)).join('\n');
            return HttpKafka._request.post(HttpKafka.KafkaBaseUrl, rawData);
        });
    }

    public static setTestBaseUrl(baseUrl: string) {
        HttpKafka.KafkaBaseUrl = baseUrl + '/v1/events';
    }

    private static KafkaBaseUrl: string = 'https://httpkafka.unityads.unity3d.com/v1/events';
    private static _request: Request;
    private static _clientInfo: ClientInfo | undefined;
    private static _deviceInfo: DeviceInfo | undefined;

    private static createCommonObject(clientInfo?: ClientInfo, deviceInfo?: DeviceInfo): Promise<any> {
        const common: any = {
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
