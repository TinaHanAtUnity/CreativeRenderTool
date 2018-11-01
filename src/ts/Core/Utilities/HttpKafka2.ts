import { INativeResponse, Request } from 'Core/Utilities/Request';

export enum KafkaCommonObjectType {
    EMPTY,
    ANONYMOUS,
    PERSONAL
}

export class HttpKafka2 {
    public static setRequest(request?: Request) {
        HttpKafka2._request = request;
    }

    public static sendEvent(type: string, objectType: KafkaCommonObjectType, data: any): Promise<INativeResponse> {
        const messages: any[] = [];
        messages.push({
            'type': type,
            'msg': data
        });

        return HttpKafka2.createCommonObject().then(commonObject => {
            if(commonObject) {
                messages.unshift(commonObject);
            }

            const rawData: string = messages.map(message => JSON.stringify(message)).join('\n');
            if(HttpKafka2._request) {
                return HttpKafka2._request.post(HttpKafka2.KafkaBaseUrl, rawData);
            } else {
                // tslint:disable:no-console
                console.log(JSON.stringify(data));
                // tslint:enable:no-console
                return Promise.resolve(<INativeResponse>{});
            }
        });
    }

    public static setTestBaseUrl(baseUrl: string) {
        HttpKafka2.KafkaBaseUrl = baseUrl + '/v1/events';
    }

    private static KafkaBaseUrl: string = 'https://httpkafka.unityads.unity3d.com/v1/events';
    private static _request: Request | undefined;

    private static createCommonObject(): Promise<any> {
        return Promise.resolve({});
    }
}
