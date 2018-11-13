import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { INativeResponse } from 'Core/Utilities/Request';

export enum BlockingReason {
    FILE_TOO_LARGE = 'too_large_file',
    VIDEO_TOO_LONG = 'video_length_error',
    VIDEO_PARSE_FAILURE = 'parse_error',
    USER_REPORT = 'report'
}

export class CreativeBlocking {
    public static report(creativeId: string | undefined, seatId: number | undefined, type: BlockingReason, ext: {}): Promise<INativeResponse> {

        // ElasticSearch schema generation can result in dropping exts if root values are not the same type across exts
        if (!ext || typeof ext !== 'object' || Array.isArray(ext)) {
            ext = {
                value: ext
            };
        }

        const kafkaObject: any = {};
        kafkaObject.type = type;
        kafkaObject.creativeId = creativeId;
        kafkaObject.seatId = seatId;
        kafkaObject[type] = ext;

        return HttpKafka.sendEvent('ads.creative.blocking', KafkaCommonObjectType.EMPTY, kafkaObject);
    }
}
