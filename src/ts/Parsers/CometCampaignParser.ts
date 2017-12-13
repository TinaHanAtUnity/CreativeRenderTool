import { Campaign } from 'Models/Campaign';
import { CampaignParser } from 'Parsers/CampaignParser';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';

export class CometCampaignParser extends CampaignParser {
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign> {
        const json = response.getJsonContent();
        if(json && json.mraidUrl) {
            return Promise.resolve(new MRAIDCampaign(json, session, gamerId, abGroup, undefined, json.mraidUrl, undefined, undefined, undefined, undefined, undefined, undefined, response.getUseWebViewUserAgentForTracking()));
        } else {
            return Promise.resolve(new PerformanceCampaign(json, session, gamerId, abGroup));
        }
    }
}
