import { Session } from 'Ads/Models/Session';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { INativeResponse } from 'Core/Utilities/Request';

export interface IKafkaObject {
    [key: string]: unknown;
    type: string;
    timestamp: number;
    adPlan?: string;
}

export class SessionDiagnostics {
    public static trigger(type: string, error: {}, session: Session): Promise<INativeResponse> {
        // ElasticSearch schema generation can result in dropping errors if root values are not the same type across errors
        if(!error || typeof error !== 'object' || Array.isArray(error)) {
            error = {
                value: error
            };
        }

        const kafkaObject: IKafkaObject = {
            type,
            timestamp: Date.now(),
            adPlan: session.getAdPlan() ? session.getAdPlan() : undefined
        };
        kafkaObject[type] = error;

        return HttpKafka.sendEvent('ads.sdk2.diagnostics', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }
}
