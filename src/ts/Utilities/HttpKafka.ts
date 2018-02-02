import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { INativeResponse, Request } from 'Utilities/Request';
import { Configuration } from 'Models/Configuration';

export class HttpKafka {
    public static setRequest(request?: Request) {
        HttpKafka._request = request;
    }

    public static setClientInfo(clientInfo?: ClientInfo) {
        HttpKafka._clientInfo = clientInfo;
    }

    public static setDeviceInfo(deviceInfo?: DeviceInfo) {
        HttpKafka._deviceInfo = deviceInfo;
    }

    public static setConfiguration(configuration?: Configuration) {
        HttpKafka._configuration = configuration;
    }

    public static sendEvent(type: string, data: any): Promise<INativeResponse> {
        const messages: any[] = [];
        messages.push({
            'type': type,
            'msg': data
        });

        return HttpKafka.createCommonObject(this._clientInfo, this._deviceInfo, this._configuration).then(commonObject => {
            messages.unshift(commonObject);

            const rawData: string = messages.map(message => JSON.stringify(message)).join('\n');
            if(HttpKafka._request) {
                return HttpKafka._request.post(HttpKafka.KafkaBaseUrl, rawData);
            } else {
                // tslint:disable:no-console
                console.dir(data);
                // tslint:enable:no-console
                return Promise.resolve(<INativeResponse>{});
            }
        });
    }

    public static setTestBaseUrl(baseUrl: string) {
        HttpKafka.KafkaBaseUrl = baseUrl + '/v1/events';
    }

    private static KafkaBaseUrl: string = 'https://httpkafka.unityads.unity3d.com/v1/events';
    private static _request: Request | undefined;
    private static _clientInfo: ClientInfo | undefined;
    private static _deviceInfo: DeviceInfo | undefined;
    private static _configuration: Configuration | undefined;
    private static _deviceInfoUpdating: boolean = false;

    private static createCommonObject(clientInfo?: ClientInfo, deviceInfo?: DeviceInfo, configuration?: Configuration): Promise<any> {
        const common: any = {
            'common': {
                'client': clientInfo ? clientInfo.getDTO() : null,
                'device': null,
                'country': configuration ? configuration.getCountry() : null,
            }
        };

        if (deviceInfo && !HttpKafka._deviceInfoUpdating) {
            HttpKafka._deviceInfoUpdating = true;
            return deviceInfo.getDTO().then(deviceInfoDTO => {
                if(typeof navigator !== 'undefined' && navigator.userAgent) {
                    deviceInfoDTO.userAgent = navigator.userAgent;
                }
                HttpKafka._deviceInfoUpdating = false;
                common.common.device = deviceInfoDTO;
                return common;
            }).catch(err => {
                HttpKafka._deviceInfoUpdating = false;
                common.common.device = deviceInfo.getStaticDTO();
                return common;
            });
        } else {
            if (deviceInfo) {
                common.common.device = deviceInfo.getStaticDTO();
            }
            return Promise.resolve(common);
        }
    }
}
