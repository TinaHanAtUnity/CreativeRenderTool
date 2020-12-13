import { Model } from 'Core/Models/Model';
export var VerificationReasonCode;
(function (VerificationReasonCode) {
    VerificationReasonCode[VerificationReasonCode["VERIFICATION_RESOURCE_REJECTED"] = 1] = "VERIFICATION_RESOURCE_REJECTED";
    VerificationReasonCode[VerificationReasonCode["VERIFICATION_NOT_SUPPORTED"] = 2] = "VERIFICATION_NOT_SUPPORTED";
    VerificationReasonCode[VerificationReasonCode["ERROR_RESOURCE_LOADING"] = 3] = "ERROR_RESOURCE_LOADING"; // The player/SDK was not able to fetch the verification resource, or some error occurred that the player/SDK was able to detect. ex) malformed resource URLs, 404 or other failed response codes, request time out. Examples of potentially undetectable errors: parsing or runtime errors in the JS resource
})(VerificationReasonCode || (VerificationReasonCode = {}));
export class VastAdVerification extends Model {
    constructor(verificationVendor, verificationResources, parameters, trackingEvent) {
        super('VastAdVerifications', {
            verificationVendor: ['string'],
            verificationResources: ['array'],
            verificationTrackingEvent: ['string', 'null'],
            verificationParameters: ['string', 'null']
        });
        this.set('verificationVendor', verificationVendor);
        this.set('verificationResources', verificationResources);
        this.set('verificationTrackingEvent', trackingEvent || null);
        this.set('verificationParameters', parameters || null);
    }
    getVerificationVendor() {
        return this.get('verificationVendor');
    }
    getVerficationResources() {
        return this.get('verificationResources');
    }
    getVerificationTrackingEvent() {
        return this.get('verificationTrackingEvent');
    }
    getVerificationParameters() {
        return this.get('verificationParameters');
    }
    setVerificationTrackingEvent(trackingUrl) {
        this.set('verificationTrackingEvent', trackingUrl);
    }
    getDTO() {
        return {
            'verificationVendor': this.getVerificationVendor(),
            'verificationResources': this.getVerficationResources(),
            'verificationTrackingEvent': this.getVerificationTrackingEvent(),
            'verificationParameters': this.getVerificationParameters()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdEFkVmVyaWZpY2F0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZBU1QvTW9kZWxzL1Zhc3RBZFZlcmlmaWNhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFHMUMsTUFBTSxDQUFOLElBQVksc0JBSVg7QUFKRCxXQUFZLHNCQUFzQjtJQUM5Qix1SEFBa0MsQ0FBQTtJQUNsQywrR0FBOEIsQ0FBQTtJQUM5Qix1R0FBMEIsQ0FBQSxDQUFDLDhTQUE4UztBQUM3VSxDQUFDLEVBSlcsc0JBQXNCLEtBQXRCLHNCQUFzQixRQUlqQztBQVNELE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxLQUEwQjtJQUU5RCxZQUFZLGtCQUEwQixFQUFFLHFCQUFpRCxFQUFFLFVBQW1CLEVBQUUsYUFBc0I7UUFDbEksS0FBSyxDQUFDLHFCQUFxQixFQUFFO1lBQ3pCLGtCQUFrQixFQUFFLENBQUMsUUFBUSxDQUFDO1lBQzlCLHFCQUFxQixFQUFFLENBQUMsT0FBTyxDQUFDO1lBQ2hDLHlCQUF5QixFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztZQUM3QyxzQkFBc0IsRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7U0FDN0MsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsR0FBRyxDQUFDLDJCQUEyQixFQUFFLGFBQWEsSUFBSSxJQUFJLENBQUMsQ0FBQztRQUM3RCxJQUFJLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRU0scUJBQXFCO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFTSx1QkFBdUI7UUFDMUIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVNLDRCQUE0QjtRQUMvQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRU0seUJBQXlCO1FBQzVCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFTSw0QkFBNEIsQ0FBQyxXQUFtQjtRQUNuRCxJQUFJLENBQUMsR0FBRyxDQUFDLDJCQUEyQixFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFTSxNQUFNO1FBQ1QsT0FBTztZQUNILG9CQUFvQixFQUFFLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtZQUNsRCx1QkFBdUIsRUFBRSxJQUFJLENBQUMsdUJBQXVCLEVBQUU7WUFDdkQsMkJBQTJCLEVBQUUsSUFBSSxDQUFDLDRCQUE0QixFQUFFO1lBQ2hFLHdCQUF3QixFQUFFLElBQUksQ0FBQyx5QkFBeUIsRUFBRTtTQUM3RCxDQUFDO0lBQ04sQ0FBQztDQUNKIn0=