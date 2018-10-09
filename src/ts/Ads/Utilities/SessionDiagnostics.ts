import { Session } from 'Ads/Models/Session';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { INativeResponse } from 'Core/Managers/RequestManager';

export class SessionDiagnostics {
    public static trigger(type: string, error: {}, session: Session): Promise<INativeResponse> {
        // ElasticSearch schema generation can result in dropping errors if root values are not the same type across errors
        if(!error || typeof error !== 'object' || Array.isArray(error)) {
            error = {
                value: error
            };
        }

        const kafkaObject: any = {};
        kafkaObject.type = type;
        kafkaObject[type] = error;
        kafkaObject.timestamp = Date.now();
        if (session.getAdPlan() !== undefined) {
            kafkaObject.adPlan = session.getAdPlan();
        }

        return HttpKafka.sendEvent('ads.sdk2.diagnostics', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }
}
