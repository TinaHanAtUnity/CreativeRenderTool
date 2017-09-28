import { CampaignParser } from 'Parsers/CampaignParser';
import { NativeBridge } from 'Native/NativeBridge';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { Campaign } from 'Models/Campaign';
import { Request } from 'Utilities/Request';
import { VPAIDParser } from 'Utilities/VPAIDParser';
import { VPAID } from 'Models/VPAID/VPAID';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';

export class ProgrammaticVPAIDParser extends CampaignParser {
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign> {
        const content = decodeURIComponent(response.getContent());
        const vpaid = this.parseVPAID(content);
        const campaignId = this.getProgrammaticCampaignId(nativeBridge);
        const campaign = new VPAIDCampaign(vpaid, session, campaignId, gamerId, abGroup, response.getCacheTTL(), response.getTrackingUrls(), response.getAdType(), response.getCreativeId(), response.getSeatId(), response.getCorrelationId());
        return Promise.resolve(campaign);
    }

    private parseVPAID(content: string): VPAID {
        return new VPAIDParser().parse(content);
    }
}
