import { CampaignParser } from 'Parsers/CampaignParser';
import { Campaign } from 'Models/Campaign';
import { VastParser } from 'Utilities/VastParser';
import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Platform } from 'Constants/Platform';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { Vast } from 'Models/Vast/Vast';

export class ProgrammaticVastParser extends CampaignParser {
    public static setVastParserMaxDepth(depth: number): void {
        ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH = depth;
    }

    private static VAST_PARSER_MAX_DEPTH: number;

    protected _vastParser: VastParser = new VastParser();

    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign> {
        const decodedVast = decodeURIComponent(response.getContent()).trim();

        if(ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH !== undefined) {
            this._vastParser.setMaxWrapperDepth(ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH);
        }

        return this._vastParser.retrieveVast(decodedVast, nativeBridge, request).then((vast): Promise<Campaign> => {
            const campaignId = this.getProgrammaticCampaignId(nativeBridge);
            return this.parseVastToCampaign(vast, nativeBridge, campaignId, session, gamerId, abGroup, response);
        });
    }

    protected parseVastToCampaign(vast: Vast, nativeBridge: NativeBridge, campaignId: string, session: Session, gamerId: string, abGroup: number, response: AuctionResponse): Promise<Campaign> {
        const campaign = new VastCampaign(vast, campaignId, session, gamerId, abGroup, response.getCacheTTL(), response.getTrackingUrls(), response.getAdType(), response.getCreativeId(), response.getSeatId(), response.getCorrelationId(), response.getAdvertiserCampaignId(), response.getAdvertiserBundleId(), response.getAdvertiserDomain(), response.getCategory(), response.getSubCategory(), response.getUseWebViewUserAgentForTracking(), response.getBuyerId());
        if(campaign.getVast().getImpressionUrls().length === 0) {
            throw new Error('Campaign does not have an impression url');
        }
        // todo throw an Error if required events are missing. (what are the required events?)
        if(campaign.getVast().getErrorURLTemplates().length === 0) {
            nativeBridge.Sdk.logWarning('Campaign does not have an error url!');
        }
        if(!campaign.getVideo().getUrl()) {
            const videoUrlError = new DiagnosticError(
                new Error('Campaign does not have a video url'),
                {rootWrapperVast: response.getContent()}
            );
            throw videoUrlError;
        }
        if(nativeBridge.getPlatform() === Platform.IOS && !campaign.getVideo().getUrl().match(/^https:\/\//)) {
            const videoUrlError = new DiagnosticError(
                new Error('Campaign video url needs to be https for iOS'),
                {rootWrapperVast: response.getContent()}
            );
            throw videoUrlError;
        }
        return Promise.resolve(campaign);
    }

}
