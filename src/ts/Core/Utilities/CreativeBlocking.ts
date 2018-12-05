import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { INativeResponse } from 'Core/Managers/RequestManager';

export enum BlockingReason {
    FILE_TOO_LARGE = 'too_large_file',
    VIDEO_TOO_LONG = 'video_length_error',
    VIDEO_PARSE_FAILURE = 'parse_error',
    USER_REPORT = 'report'
}

export class CreativeBlocking {
    public static report(creativeId: string | undefined, seatId: number | undefined, type: BlockingReason, extraFields: {}): Promise<INativeResponse> {

        const kafkaObject: any = {
            ... extraFields,
            type: type,
            creativeId: creativeId,
            seatId: seatId
        };

        return HttpKafka.sendEvent('ads.creative.blocking', KafkaCommonObjectType.EMPTY, kafkaObject);
    }
}
