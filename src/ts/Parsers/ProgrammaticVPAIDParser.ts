import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { VPAIDParser } from 'Utilities/VPAIDParser';
import { ProgrammaticVastParser } from 'Parsers/ProgrammaticVastParser';
import { Vast } from 'Models/Vast/Vast';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { Campaign } from 'Models/Campaign';
import { VastMediaFile } from 'Models/Vast/VastMediaFile';

export class ProgrammaticVPAIDParser extends ProgrammaticVastParser {

    private _vpaidParser: VPAIDParser = new VPAIDParser();

    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign> {
        const decodedVast = decodeURIComponent(response.getContent()).trim();
        return this._vastParser.retrieveVast(decodedVast, nativeBridge, request).then((vast): Promise<Campaign> => {
            const vpaidMediaFile = this.getVPAIDMediaFile(vast);
            const campaignId = this.getProgrammaticCampaignId(nativeBridge);
            if (vpaidMediaFile) {
                const vpaid = this._vpaidParser.parseFromVast(vast, vpaidMediaFile);
                return Promise.resolve(new VPAIDCampaign(vpaid, session, campaignId, gamerId, abGroup, response.getCacheTTL(), response.getTrackingUrls(), response.getAdType(), response.getCreativeId(), response.getSeatId(), response.getCorrelationId(), response.getCategory(), response.getSubCategory(), response.getUseWebViewUserAgentForTracking()));
            } else {
                return this.parseVastToCampaign(vast, nativeBridge, campaignId, session, gamerId, abGroup, response);
            }
        });
    }

    private getVPAIDMediaFile(vast: Vast): VastMediaFile | null {
        return this._vpaidParser.getSupportedMediaFile(vast);
    }
}
