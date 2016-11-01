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

    public static sendEvent(url: string, type: string, data: any): Promise<INativeResponse> {
        const messages: any[] = [];
        messages.push({
            'type': 'ads.sdk2.' + type,
            'msg': data
        });

        return HttpKafka.createCommonObject(this._clientInfo, this._deviceInfo).then(commonObject => {
            messages.unshift(commonObject);

            const rawData: string = messages.map(message => JSON.stringify(message)).join('\n');
            return this._request.post(url, rawData);
        });
    }

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
