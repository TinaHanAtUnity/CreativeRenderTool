import { Campaign, ICampaign } from 'Models/Campaign';
import { ISchema } from 'Models/Model';

export interface IProgrammaticCampaign extends ICampaign {
    useWebViewUserAgentForTracking: boolean | undefined;
    trackingUrls: {[key: string]: string[]};
}

export abstract class ProgrammaticCampaign<T extends IProgrammaticCampaign> extends Campaign<T> {
    public static Schema: ISchema<IProgrammaticCampaign> = {
        ... Campaign.Schema,
        trackingUrls: ['object'],
        useWebViewUserAgentForTracking: ['boolean']
    };

    constructor(name: string, schema: ISchema<T>, data: T) {
        super(name, schema, data);
    }

    public setTrackingUrls(trackingUrls: {[key: string]: string[]}) {
        this.set('trackingUrls', trackingUrls);
    }

    public getTrackingUrls(): {[key: string]: string[]} {
        return this.get('trackingUrls');
    }

    public getUseWebViewUserAgentForTracking(): boolean {
        return !!this.get('useWebViewUserAgentForTracking');
    }

    public getTrackingUrlsForEvent(event: string): string[] {
        const urls = this.get('trackingUrls');
        if (urls) {
            return urls[event] || [];
        }
        return [];
    }

}
