import { Platform } from 'Core/Constants/Platform';
export var KafkaCommonObjectType;
(function (KafkaCommonObjectType) {
    KafkaCommonObjectType[KafkaCommonObjectType["EMPTY"] = 0] = "EMPTY";
    KafkaCommonObjectType[KafkaCommonObjectType["ANONYMOUS"] = 1] = "ANONYMOUS";
    KafkaCommonObjectType[KafkaCommonObjectType["PERSONAL"] = 2] = "PERSONAL";
})(KafkaCommonObjectType || (KafkaCommonObjectType = {}));
export class HttpKafka {
    static setRequest(request) {
        HttpKafka._request = request;
    }
    static setPlatform(platform) {
        HttpKafka._platform = platform;
    }
    static setClientInfo(clientInfo) {
        HttpKafka._clientInfo = clientInfo;
    }
    static setDeviceInfo(deviceInfo) {
        HttpKafka._deviceInfo = deviceInfo;
    }
    static setConfiguration(configuration) {
        HttpKafka._configuration = configuration;
    }
    static sendEvent(type, objectType, data) {
        const messages = [];
        messages.push({
            'type': type,
            'msg': data
        });
        return HttpKafka.createCommonObject(objectType, this._platform, this._clientInfo, this._deviceInfo, this._configuration).then(commonObject => {
            if (commonObject) {
                messages.unshift(commonObject);
            }
            const rawData = messages.map(message => JSON.stringify(message)).join('\n');
            if (HttpKafka._request) {
                return HttpKafka._request.post(HttpKafka.KafkaBaseUrl, rawData);
            }
            else {
                return Promise.resolve({});
            }
        });
    }
    static setTestBaseUrl(baseUrl) {
        HttpKafka.KafkaBaseUrl = baseUrl + '/v1/events';
    }
    static createCommonObject(objectType, platform, clientInfo, deviceInfo, configuration) {
        if (objectType === KafkaCommonObjectType.EMPTY) {
            const emptyCommon = {
                'common': {
                    'client': null,
                    'device': null,
                    'country': null
                }
            };
            return Promise.resolve(emptyCommon);
        }
        else {
            const common = {
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
                }
                else {
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
            }
            else {
                if (deviceInfo) {
                    if (objectType === KafkaCommonObjectType.PERSONAL) {
                        common.common.device = deviceInfo.getStaticDTO();
                    }
                    else {
                        common.common.device = deviceInfo.getAnonymousStaticDTO();
                    }
                }
                return Promise.resolve(common);
            }
        }
    }
}
HttpKafka.KafkaBaseUrl = 'https://httpkafka.unityads.unity3d.com/v1/events';
HttpKafka._deviceInfoUpdating = false;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSHR0cEthZmthLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvVXRpbGl0aWVzL0h0dHBLYWZrYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsTUFBTSxDQUFOLElBQVkscUJBSVg7QUFKRCxXQUFZLHFCQUFxQjtJQUM3QixtRUFBSyxDQUFBO0lBQ0wsMkVBQVMsQ0FBQTtJQUNULHlFQUFRLENBQUE7QUFDWixDQUFDLEVBSlcscUJBQXFCLEtBQXJCLHFCQUFxQixRQUloQztBQVVELE1BQU0sT0FBTyxTQUFTO0lBQ1gsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUF3QjtRQUM3QyxTQUFTLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztJQUNqQyxDQUFDO0lBRU0sTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFtQjtRQUN6QyxTQUFTLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztJQUNuQyxDQUFDO0lBRU0sTUFBTSxDQUFDLGFBQWEsQ0FBQyxVQUF1QjtRQUMvQyxTQUFTLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztJQUN2QyxDQUFDO0lBRU0sTUFBTSxDQUFDLGFBQWEsQ0FBQyxVQUF1QjtRQUMvQyxTQUFTLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztJQUN2QyxDQUFDO0lBRU0sTUFBTSxDQUFDLGdCQUFnQixDQUFDLGFBQWlDO1FBQzVELFNBQVMsQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO0lBQzdDLENBQUM7SUFFTSxNQUFNLENBQUMsU0FBUyxDQUFDLElBQVksRUFBRSxVQUFpQyxFQUFFLElBQWE7UUFDbEYsTUFBTSxRQUFRLEdBQWMsRUFBRSxDQUFDO1FBQy9CLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDVixNQUFNLEVBQUUsSUFBSTtZQUNaLEtBQUssRUFBRSxJQUFJO1NBQ2QsQ0FBQyxDQUFDO1FBRUgsT0FBTyxTQUFTLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDekksSUFBSSxZQUFZLEVBQUU7Z0JBQ2QsUUFBUSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUNsQztZQUVELE1BQU0sT0FBTyxHQUFXLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BGLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRTtnQkFDcEIsT0FBTyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQ25FO2lCQUFNO2dCQUNILE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBa0IsRUFBRSxDQUFDLENBQUM7YUFDL0M7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQWU7UUFDeEMsU0FBUyxDQUFDLFlBQVksR0FBRyxPQUFPLEdBQUcsWUFBWSxDQUFDO0lBQ3BELENBQUM7SUFVTyxNQUFNLENBQUMsa0JBQWtCLENBQUMsVUFBaUMsRUFBRSxRQUFtQixFQUFFLFVBQXVCLEVBQUUsVUFBdUIsRUFBRSxhQUFpQztRQUN6SyxJQUFJLFVBQVUsS0FBSyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUU7WUFDNUMsTUFBTSxXQUFXLEdBQVk7Z0JBQ3pCLFFBQVEsRUFBRTtvQkFDTixRQUFRLEVBQUUsSUFBSTtvQkFDZCxRQUFRLEVBQUUsSUFBSTtvQkFDZCxTQUFTLEVBQUUsSUFBSTtpQkFDbEI7YUFDSixDQUFDO1lBQ0YsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ3ZDO2FBQU07WUFDSCxNQUFNLE1BQU0sR0FBa0I7Z0JBQzFCLFFBQVEsRUFBRTtvQkFDTixRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ2pELFFBQVEsRUFBRSxJQUFJO29CQUNkLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSTtpQkFDL0Q7YUFDSixDQUFDO1lBRUYsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtnQkFDdEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLE9BQU8sUUFBUSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7YUFDN0c7WUFFRCxJQUFJLFVBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRTtnQkFDOUMsU0FBUyxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQztnQkFDckMsSUFBSSxVQUFVLEtBQUsscUJBQXFCLENBQUMsUUFBUSxFQUFFO29CQUMvQyxPQUFPLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUU7d0JBQzVDLElBQUksT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQyxTQUFTLEVBQUU7NEJBQ3pELGFBQWEsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQzt5QkFDakQ7d0JBQ0QsU0FBUyxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQzt3QkFDdEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDO3dCQUNyQyxPQUFPLE1BQU0sQ0FBQztvQkFDbEIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUNYLFNBQVMsQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLENBQUM7d0JBQ3RDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQzt3QkFDakQsT0FBTyxNQUFNLENBQUM7b0JBQ2xCLENBQUMsQ0FBQyxDQUFDO2lCQUNOO3FCQUFNO29CQUNILE9BQU8sVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRTt3QkFDckQsSUFBSSxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRTs0QkFDekQsYUFBYSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO3lCQUNqRDt3QkFDRCxTQUFTLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDO3dCQUN0QyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUM7d0JBQ3JDLE9BQU8sTUFBTSxDQUFDO29CQUNsQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQ1gsU0FBUyxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQzt3QkFDdEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLHFCQUFxQixFQUFFLENBQUM7d0JBQzFELE9BQU8sTUFBTSxDQUFDO29CQUNsQixDQUFDLENBQUMsQ0FBQztpQkFDTjthQUNKO2lCQUFNO2dCQUNILElBQUksVUFBVSxFQUFFO29CQUNaLElBQUksVUFBVSxLQUFLLHFCQUFxQixDQUFDLFFBQVEsRUFBRTt3QkFDL0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDO3FCQUNwRDt5QkFBTTt3QkFDSCxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMscUJBQXFCLEVBQUUsQ0FBQztxQkFDN0Q7aUJBQ0o7Z0JBQ0QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ2xDO1NBQ0o7SUFDTCxDQUFDOztBQXZFYyxzQkFBWSxHQUFXLGtEQUFrRCxDQUFDO0FBTTFFLDZCQUFtQixHQUFZLEtBQUssQ0FBQyJ9