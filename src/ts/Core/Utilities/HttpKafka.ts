import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Platform } from 'Core/Constants/Platform';

export enum KafkaCommonObjectType {
    EMPTY,
    ANONYMOUS,
    PERSONAL
}

export interface ICommonObject {
    common: {
        client: { [key: string]: unknown } | null;
        device: { [key: string]: unknown } | null;
        country: string | null;
    };
}

export class HttpKafka {
    public static setRequest(request?: RequestManager) {
        HttpKafka._request = request;
    }

    public static setPlatform(platform?: Platform) {
        HttpKafka._platform = platform;
    }

    public static setClientInfo(clientInfo?: ClientInfo) {
        HttpKafka._clientInfo = clientInfo;
    }

    public static setDeviceInfo(deviceInfo?: DeviceInfo) {
        HttpKafka._deviceInfo = deviceInfo;
    }

    public static setConfiguration(configuration?: CoreConfiguration) {
        HttpKafka._configuration = configuration;
    }

    public static sendEvent(type: string, objectType: KafkaCommonObjectType, data: unknown): Promise<INativeResponse> {
        const messages: unknown[] = [];
        messages.push({
            'type': type,
            'msg': data
        });

        return HttpKafka.createCommonObject(objectType, this._platform, this._clientInfo, this._deviceInfo, this._configuration).then(commonObject => {
            if (commonObject) {
                messages.unshift(commonObject);
            }

            const rawData: string = messages.map(message => JSON.stringify(message)).join('\n');
            if (HttpKafka._request) {
                return HttpKafka._request.post(HttpKafka.KafkaBaseUrl, rawData);
            } else {
                return Promise.resolve(<INativeResponse>{});
            }
        });
    }

    public static setTestBaseUrl(baseUrl: string) {
        HttpKafka.KafkaBaseUrl = baseUrl + '/v1/events';
    }

    private static KafkaBaseUrl: string = 'https://httpkafka.unityads.unity3d.com/v1/events';
    private static _request: RequestManager | undefined;
    private static _platform: Platform | undefined;
    private static _clientInfo: ClientInfo | undefined;
    private static _deviceInfo: DeviceInfo | undefined;
    private static _configuration: CoreConfiguration | undefined;
    private static _deviceInfoUpdating: boolean = false;

    private static createCommonObject(objectType: KafkaCommonObjectType, platform?: Platform, clientInfo?: ClientInfo, deviceInfo?: DeviceInfo, configuration?: CoreConfiguration): Promise<unknown> {
        if (objectType === KafkaCommonObjectType.EMPTY) {
            const emptyCommon: unknown = {
                'common': {
                    'client': null,
                    'device': null,
                    'country': null
                }
            };
            return Promise.resolve(emptyCommon);
        } else {
            const common: ICommonObject = {
                'common': {
                    'client': clientInfo ? clientInfo.getDTO() : null,
                    'device': null,
                    'country': configuration ? configuration.getCountry() : null
                }
            };

            if (common.common.client) {
                common.common.client.platform = typeof platform !== 'undefined' ? Platform[platform].toLowerCase() : null;
            }

            if (deviceInfo && !HttpKafka._deviceInfoUpdating) {
                HttpKafka._deviceInfoUpdating = true;
                if (objectType === KafkaCommonObjectType.PERSONAL) {
                    return deviceInfo.getDTO().then(deviceInfoDTO => {
                        if (typeof navigator !== 'undefined' && navigator.userAgent) {
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
                    return deviceInfo.getAnonymousDTO().then(deviceInfoDTO => {
                        if (typeof navigator !== 'undefined' && navigator.userAgent) {
                            deviceInfoDTO.userAgent = navigator.userAgent;
                        }
                        HttpKafka._deviceInfoUpdating = false;
                        common.common.device = deviceInfoDTO;
                        return common;
                    }).catch(err => {
                        HttpKafka._deviceInfoUpdating = false;
                        common.common.device = deviceInfo.getAnonymousStaticDTO();
                        return common;
                    });
                }
            } else {
                if (deviceInfo) {
                    if (objectType === KafkaCommonObjectType.PERSONAL) {
                        common.common.device = deviceInfo.getStaticDTO();
                    } else {
                        common.common.device = deviceInfo.getAnonymousStaticDTO();
                    }
                }
                return Promise.resolve(common);
            }
        }
    }
}
