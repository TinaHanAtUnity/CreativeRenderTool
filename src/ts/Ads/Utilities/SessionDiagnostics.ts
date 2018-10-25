import { Session } from 'Ads/Models/Session';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { INativeResponse } from 'Core/Utilities/Request';

export class SessionDiagnostics {
    public static trigger(type: string, error: {}, session: Session): Promise<INativeResponse> {
        let modifiedError = error;
        // ElasticSearch schema generation can result in dropping errors if root values are not the same type across errors
        if(!modifiedError || typeof modifiedError !== 'object' || Array.isArray(modifiedError)) {
            modifiedError = {
                value: modifiedError
            };
        }

        const kafkaObject: any = {};
        kafkaObject.type = type;
        kafkaObject[type] = modifiedError;
        kafkaObject.timestamp = Date.now();
        if (session.getAdPlan() !== undefined) {
            kafkaObject.adPlan = session.getAdPlan();
        }

        return HttpKafka.sendEvent('ads.sdk2.diagnostics', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }
}
