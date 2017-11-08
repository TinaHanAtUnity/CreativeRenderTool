import { Campaign } from 'Models/Campaign';
import { JsonParser } from 'Utilities/JsonParser';
import { CampaignParser } from 'Parsers/CampaignParser';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import {XPromoCampaign} from "../Models/Campaigns/XPromoCampaign";

export class CometCampaignParser extends CampaignParser {
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign> {
        const json = JsonParser.parse(response.getContent());
        if(json && json.mraidUrl) {
            return Promise.resolve(new MRAIDCampaign(json, session, gamerId, abGroup, undefined, json.mraidUrl));
        }
        // TODO: should XPROMO have it's own parser? then what's the point of CometCampaignParser?
        // Maybe we should send the content type and make decision based on that? existence of clickUrl seems... hacky
        if(json && !json.clickUrl) {
            return Promise.resolve(new XPromoCampaign(json, session, gamerId, abGroup));
        }
        return Promise.resolve(new PerformanceCampaign(json, session, gamerId, abGroup));
    }
}
