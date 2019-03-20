import { Model } from 'Core/Models/Model';
import { VastVerificationResource } from 'VAST/Models/VastVerificationResource';

interface IVastAdVerification {
    verificationResources: VastVerificationResource[];  // javascript only
    trackingEvents: { [eventName: string]: string[] };
    verificationParameters: string | null;
}

export class VastAdVerification extends Model<IVastAdVerification> {

    constructor(verificationResources: VastVerificationResource[], verificationParameters?: string, trackingEvents?: { [eventName: string]: string[] }) {
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

    public addTrackingEvent(eventName: string, trackingUrl: string) {
        const trackingEvents = this.get('trackingEvents');
        if (trackingEvents[eventName]) {
            trackingEvents[eventName].push(trackingUrl);
        } else {
            trackingEvents[eventName] = [trackingUrl];
        }
    }

    public getDTO() : { [key: string]: unknown } {
        return {
            'verificationResources': this.getVerficationResources(),
            'trackingEvents': this.getTrackingEvents(),
            'verificationParameters': this.getVerificationParameters()
        };
    }
}
