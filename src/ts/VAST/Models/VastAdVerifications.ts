import { Model } from 'Core/Models/Model';
import { VastVerificationResource } from 'VAST/Models/VastVerificationResource';

interface IVastAdVerification {
    verificationResources: VastVerificationResource[];  // javascript and other
    trackingEvents: { [eventName: string]: string[] };
    verificationParameters: string | null;
}

export class VastAdVerifications extends Model<IVastAdVerification> {

    constructor(verificationResources: VastVerificationResource[], trackingEvents?: { [eventName: string]: string[] }, verificationParameters?: string) {
        super('VastAdVerifications', {
            verificationResources: ['array'],
            trackingEvents: ['object'],
            verificationParameters: ['string', 'null']
        });

        this.set('verificationResources', verificationResources);
        this.set('trackingEvents', trackingEvents || {});
        this.set('verificationParameters', verificationParameters || null);
    }

    public getVerficationResources(): VastVerificationResource[] {
        return this.get('verificationResources');
    }

    public getTrackingEvents(): { [eventName: string]: string[] } {
        return this.get('trackingEvents');
    }

    public getVerificationParameters(): string | null {
        return this.get('verificationParameters');
    }

    public getDTO() : { [key: string]: unknown } {
        return {
            'verificationResources': this.getVerficationResources(),
            'trackingEvents': this.getTrackingEvents(),
            'verificationParameters': this.getVerificationParameters()
        };
    }
}
