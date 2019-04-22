import { Model } from 'Core/Models/Model';
import { VastVerificationResource } from 'VAST/Models/VastVerificationResource';

export enum VerificationReasonCode {
    VERIFICATION_RESOURCE_REJECTED = 1, // The publisher does not recognize or allow code from the vendor in the parent <Verification>
    VERIFICATION_NOT_SUPPORTED = 2, // The API framework or language type of verification resources provided are not implemented or supported by the player/SDK
    ERROR_RESOURCE_LOADING = 3 // The player/SDK was not able to fetch the verification resource, or some error occurred that the player/SDK was able to detect. ex) malformed resource URLs, 404 or other failed response codes, request time out. Examples of potentially undetectable errors: parsing or runtime errors in the JS resource
}

interface IVastAdVerification {
    verificationVendor: string;
    verificationResources: VastVerificationResource[];  // javascript only
    verificationTrackingEvent: string | null;
    verificationParameters: string | null;
}

export class VastAdVerification extends Model<IVastAdVerification> {

    constructor(verificationVendor: string, verificationResources: VastVerificationResource[], parameters?: string, trackingEvent?: string) {
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

    public getVerificationVendor(): string {
        return this.get('verificationVendor');
    }

    public getVerficationResources(): VastVerificationResource[] {
        return this.get('verificationResources');
    }

    public getVerificationTrackingEvent(): string | null {
        return this.get('verificationTrackingEvent');
    }

    public getVerificationParameters(): string | null {
        return this.get('verificationParameters');
    }

    public getFormattedVerificationTrackingEvent(reasonCode: VerificationReasonCode): string | null {
        let trackingEvent = this.getVerificationTrackingEvent();
        if (trackingEvent) {
            trackingEvent = trackingEvent.replace('%5BREASON%5D', reasonCode.toString());
        }
        return trackingEvent;
    }

    public setVerificationTrackingEvent(trackingUrl: string) {
        this.set('verificationTrackingEvent', trackingUrl);
    }

    public getDTO() : { [key: string]: unknown } {
        return {
            'verificationVendor': this.getVerificationVendor(),
            'verificationResources': this.getVerficationResources(),
            'verificationTrackingEvent': this.getVerificationTrackingEvent(),
            'verificationParameters': this.getVerificationParameters()
        };
    }
}
