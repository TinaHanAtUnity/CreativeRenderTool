import { Model } from 'Core/Models/Model';
import { VastVerificationResource } from 'VAST/Models/VastVerificationResource';

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

    public getVerificationNotExecutedTrackingEvent(): string | null {
        return this.get('verificationTrackingEvent');
    }

    public getVerificationParameters(): string | null {
        return this.get('verificationParameters');
    }

    public setVerificationNotExecutedTrackingEvent(trackingUrl: string) {
        this.set('verificationTrackingEvent', trackingUrl);
    }

    public getDTO() : { [key: string]: unknown } {
        return {
            'verificationVendor': this.getVerificationVendor(),
            'verificationResources': this.getVerficationResources(),
            'verificationTrackingEvent': this.getVerificationNotExecutedTrackingEvent(),
            'verificationParameters': this.getVerificationParameters()
        };
    }
}
