import { Campaign } from 'Models/Campaign';
import { JsonParser } from 'Utilities/JsonParser';
import { CampaignParser } from 'Parsers/CampaignParser';
import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { XPromoCampaign } from "Models/Campaigns/XPromoCampaign";

export class XPromoCampaignParser extends CampaignParser {
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign> {
        const json = JsonParser.parse(response.getContent());
        const trackingUrls = response.getTrackingUrls();
        return Promise.resolve(new XPromoCampaign(json, session, gamerId, abGroup, trackingUrls));
    }
}
