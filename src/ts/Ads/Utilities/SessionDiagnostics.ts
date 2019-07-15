import { Session } from 'Ads/Models/Session';
import { INativeResponse } from 'Core/Managers/RequestManager';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { Diagnostics } from 'Core/Utilities/Diagnostics';

export interface IKafkaObject {
    [key: string]: unknown;
    type: string;
    timestamp: number;
    adPlan?: string;
}

export class SessionDiagnostics {
    public static trigger(type: string, error: unknown, session: Session): Promise<INativeResponse> {

        // ElasticSearch schema generation can result in dropping errors if root values are not the same type across errors
        if (!error || typeof error !== 'object' || Array.isArray(error)) {
            error = {
                value: error
            };
        }

        const adPlan = session.getAdPlan();
        // Don't send kafka messages with adplans greater than 1MB
        if (adPlan && adPlan.length > 1048576) {
            const errorWithOldDiagnosticType = {
                error,
                type
            };
            return Diagnostics.trigger('adplan_too_large', errorWithOldDiagnosticType);
        }

        const kafkaObject: IKafkaObject = {
            type,
            timestamp: Date.now(),
            adPlan: adPlan
        };
        kafkaObject[type] = error;

        return HttpKafka.sendEvent('ads.sdk2.diagnostics', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }
}
