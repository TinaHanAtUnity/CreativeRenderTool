import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { ISchema } from 'Core/Models/Model';

export interface IProgrammaticCampaign extends ICampaign {
    useWebViewUserAgentForTracking: boolean | undefined;
}

export abstract class ProgrammaticCampaign<T extends IProgrammaticCampaign> extends Campaign<T> {
    public static Schema: ISchema<IProgrammaticCampaign> = {
        ... Campaign.Schema,
        useWebViewUserAgentForTracking: ['boolean']
    };

    constructor(name: string, schema: ISchema<T>, data: T) {
        super(name, schema, data);
    }

    public getUseWebViewUserAgentForTracking(): boolean {
        return !!this.get('useWebViewUserAgentForTracking');
    }

}
