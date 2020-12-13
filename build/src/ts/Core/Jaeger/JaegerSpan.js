import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';
class JaegerLocalEndpoint {
    constructor(serviceName) {
        this.serviceName = serviceName;
    }
}
class JaegerAnnotation {
    constructor(value) {
        this.timestamp = JaegerUtilities.genTimestamp();
        this.value = value;
    }
}
export var JaegerTags;
(function (JaegerTags) {
    JaegerTags["StatusCode"] = "status.code";
    JaegerTags["DeviceType"] = "device.type";
    JaegerTags["Error"] = "error";
    JaegerTags["ErrorMessage"] = "error.message";
})(JaegerTags || (JaegerTags = {}));
export class JaegerSpan {
    constructor(operation, parentId, traceId) {
        this.traceId = JaegerUtilities.uuidv4().substring(8, 24);
        this.id = JaegerUtilities.uuidv4().substring(8, 24);
        this.kind = 'CLIENT';
        this.timestamp = JaegerUtilities.genTimestamp();
        this.duration = 0;
        this.debug = true;
        this.shared = true;
        this.localEndpoint = new JaegerLocalEndpoint('ads-sdk');
        this.annotations = [];
        this.tags = {};
        if (parentId) {
            this.parentId = parentId;
        }
        if (traceId) {
            this.traceId = traceId;
        }
        this.name = JaegerUtilities.stripQueryAndFragment(operation);
    }
    addTag(key, value) {
        this.tags[key] = value;
    }
    addAnnotation(value) {
        const annotation = new JaegerAnnotation(value);
        this.annotations.push(annotation);
    }
    stop() {
        this.duration = JaegerUtilities.genTimestamp() - this.timestamp;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFlZ2VyU3Bhbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL0phZWdlci9KYWVnZXJTcGFuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUs5RCxNQUFNLG1CQUFtQjtJQUdyQixZQUFZLFdBQW1CO1FBQzNCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ25DLENBQUM7Q0FDSjtBQU1ELE1BQU0sZ0JBQWdCO0lBSWxCLFlBQVksS0FBYTtRQUhsQixjQUFTLEdBQVcsZUFBZSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBSXRELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLENBQUM7Q0FDSjtBQW1CRCxNQUFNLENBQU4sSUFBWSxVQUtYO0FBTEQsV0FBWSxVQUFVO0lBQ2xCLHdDQUEwQixDQUFBO0lBQzFCLHdDQUEwQixDQUFBO0lBQzFCLDZCQUFlLENBQUE7SUFDZiw0Q0FBOEIsQ0FBQTtBQUNsQyxDQUFDLEVBTFcsVUFBVSxLQUFWLFVBQVUsUUFLckI7QUFFRCxNQUFNLE9BQU8sVUFBVTtJQWVuQixZQUFZLFNBQWlCLEVBQUUsUUFBaUIsRUFBRSxPQUFnQjtRQWIzRCxZQUFPLEdBQVcsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFNUQsT0FBRSxHQUFXLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRXZELFNBQUksR0FBVyxRQUFRLENBQUM7UUFDeEIsY0FBUyxHQUFXLGVBQWUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNuRCxhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBQ3JCLFVBQUssR0FBWSxJQUFJLENBQUM7UUFDdEIsV0FBTSxHQUFZLElBQUksQ0FBQztRQUN2QixrQkFBYSxHQUF5QixJQUFJLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pFLGdCQUFXLEdBQXdCLEVBQUUsQ0FBQztRQUN0QyxTQUFJLEdBQThCLEVBQUUsQ0FBQztRQUd4QyxJQUFJLFFBQVEsRUFBRTtZQUNWLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1NBQzVCO1FBQ0QsSUFBSSxPQUFPLEVBQUU7WUFDVCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztTQUMxQjtRQUNELElBQUksQ0FBQyxJQUFJLEdBQUcsZUFBZSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFTSxNQUFNLENBQUMsR0FBZSxFQUFFLEtBQWE7UUFDeEMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDM0IsQ0FBQztJQUVNLGFBQWEsQ0FBQyxLQUFhO1FBQzlCLE1BQU0sVUFBVSxHQUFHLElBQUksZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVNLElBQUk7UUFDUCxJQUFJLENBQUMsUUFBUSxHQUFHLGVBQWUsQ0FBQyxZQUFZLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3BFLENBQUM7Q0FFSiJ9