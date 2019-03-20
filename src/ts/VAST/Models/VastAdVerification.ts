import { Model } from 'Core/Models/Model';
import { VastVerificationResource } from 'VAST/Models/VastVerificationResource';

interface IVastAdVerification {
    verificationResources: VastVerificationResource[];  // javascript only
    verificationTrackingEvent: string | null;
    verificationParameters: string | null;
}

export class VastAdVerification extends Model<IVastAdVerification> {

    constructor(verificationResources: VastVerificationResource[], parameters?: string, trackingEvent?: string) {
        super('VastAdVerifications', {
            verificationResources: ['array'],
            verificationTrackingEvent: ['string', 'null'],
            verificationParameters: ['string', 'null']
        });

        this.set('verificationResources', verificationResources);
        this.set('verificationTrackingEvent', trackingEvent || null);
        this.set('verificationParameters', parameters || null);
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
            'verificationResources': this.getVerficationResources(),
            'verificationTrackingEvent': this.getVerificationNotExecutedTrackingEvent(),
            'verificationParameters': this.getVerificationParameters()
        };
    }
}
