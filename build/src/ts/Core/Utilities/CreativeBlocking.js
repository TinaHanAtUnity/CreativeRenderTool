import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
export var BlockingReason;
(function (BlockingReason) {
    BlockingReason["FILE_TOO_LARGE"] = "too_large_file";
    BlockingReason["VIDEO_TOO_LONG"] = "video_length_error";
    BlockingReason["VIDEO_PARSE_FAILURE"] = "parse_error";
    BlockingReason["USER_REPORT"] = "report";
})(BlockingReason || (BlockingReason = {}));
export class CreativeBlocking {
    static report(creativeId, seatId, campaignId, type, extraFields) {
        const kafkaObject = Object.assign({}, extraFields, { type: type, creativeId: creativeId, seatId: seatId, campaignId: campaignId });
        return HttpKafka.sendEvent('ads.creative.blocking', KafkaCommonObjectType.EMPTY, kafkaObject);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRpdmVCbG9ja2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL1V0aWxpdGllcy9DcmVhdGl2ZUJsb2NraW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUc1RSxNQUFNLENBQU4sSUFBWSxjQUtYO0FBTEQsV0FBWSxjQUFjO0lBQ3RCLG1EQUFpQyxDQUFBO0lBQ2pDLHVEQUFxQyxDQUFBO0lBQ3JDLHFEQUFtQyxDQUFBO0lBQ25DLHdDQUFzQixDQUFBO0FBQzFCLENBQUMsRUFMVyxjQUFjLEtBQWQsY0FBYyxRQUt6QjtBQUVELE1BQU0sT0FBTyxnQkFBZ0I7SUFDbEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUE4QixFQUFFLE1BQTBCLEVBQUUsVUFBa0IsRUFBRSxJQUFvQixFQUFFLFdBQWU7UUFFdEksTUFBTSxXQUFXLHFCQUNULFdBQVcsSUFDZixJQUFJLEVBQUUsSUFBSSxFQUNWLFVBQVUsRUFBRSxVQUFVLEVBQ3RCLE1BQU0sRUFBRSxNQUFNLEVBQ2QsVUFBVSxFQUFFLFVBQVUsR0FDekIsQ0FBQztRQUVGLE9BQU8sU0FBUyxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsRUFBRSxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDbEcsQ0FBQztDQUNKIn0=