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
        return Promise.resolve(<INativeResponse>{});
    }
}
