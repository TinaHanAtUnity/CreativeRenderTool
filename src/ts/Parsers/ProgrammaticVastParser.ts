import { CampaignParser } from 'Parsers/CampaignParser';
import { Campaign } from 'Models/Campaign';
import { VastParser } from 'Utilities/VastParser';
import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Platform } from 'Constants/Platform';
import { DiagnosticError } from 'Errors/DiagnosticError';

export class ProgrammaticVastParser extends CampaignParser {
    public static setVastParserMaxDepth(depth: number): void {
        ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH = depth;
    }

    private static VAST_PARSER_MAX_DEPTH: number;

    private _vastParser: VastParser;

    public parse(nativeBridge: NativeBridge, request: Request): Promise<Campaign> {
        const decodedVast = decodeURIComponent(this.getAuctionResponse().getContent()).trim();

        if(!this._vastParser) {
            this._vastParser = new VastParser();
        }

        if(ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH !== undefined) {
            this._vastParser.setMaxWrapperDepth(ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH);
        }

        return this._vastParser.retrieveVast(decodedVast, nativeBridge, request).then(vast => {
            const campaignId = this.getProgrammaticCampaignId(nativeBridge);
            const campaign = new VastCampaign(vast, campaignId, this.getSession(), this.getGamerId(), this.getAbGroup(), this.getAuctionResponse().getCacheTTL(), this.getAuctionResponse().getTrackingUrls(), this.getAuctionResponse().getAdType(), this.getAuctionResponse().getCreativeId(), this.getAuctionResponse().getSeatId(), this.getAuctionResponse().getCorrelationId());
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
                    {rootWrapperVast: this.getAuctionResponse().getContent()}
                );
                throw videoUrlError;
            }
            if(nativeBridge.getPlatform() === Platform.IOS && !campaign.getVideo().getUrl().match(/^https:\/\//)) {
                const videoUrlError = new DiagnosticError(
                    new Error('Campaign video url needs to be https for iOS'),
                    {rootWrapperVast: this.getAuctionResponse().getContent()}
                );
                throw videoUrlError;
            }
            return Promise.resolve(campaign);
        });
    }
}
