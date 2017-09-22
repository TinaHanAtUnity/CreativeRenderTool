import { Campaign } from 'Models/Campaign';
import { JsonParser } from 'Utilities/JsonParser';
import { CampaignParser } from 'Parsers/CampaignParser';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';

export class CometCampaignParser extends CampaignParser {
    public parse(nativeBridge: NativeBridge, request: Request): Promise<Campaign> {
        const json = JsonParser.parse(this.getAuctionResponse().getContent());
        if(json && json.mraidUrl) {
            return Promise.resolve(new MRAIDCampaign(json, this.getSession(), this.getGamerId(), this.getAbGroup(), undefined, json.mraidUrl));
        } else {
            return Promise.resolve(new PerformanceCampaign(json, this.getSession(), this.getGamerId(), this.getAbGroup()));
        }
    }
}
