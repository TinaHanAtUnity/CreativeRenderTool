import { CampaignParser } from 'Parsers/CampaignParser';
import { Campaign, ICampaign } from 'Models/Campaign';
import { VastParser } from 'Utilities/VastParser';
import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { IVastCampaign, VastCampaign } from 'Models/Vast/VastCampaign';
import { Platform } from 'Constants/Platform';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { Vast } from 'Models/Vast/Vast';
import { Video } from 'Models/Assets/Video';
import { Image } from 'Models/Assets/Image';
import { ABGroup } from 'Models/ABGroup';

export class ProgrammaticVastParser extends CampaignParser {
    public static ContentType = 'programmatic/vast';
    public static setVastParserMaxDepth(depth: number): void {
        ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH = depth;
    }

    private static VAST_PARSER_MAX_DEPTH: number;

    protected _vastParser: VastParser = new VastParser();

    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, abGroup: ABGroup): Promise<Campaign> {
        const decodedVast = decodeURIComponent(response.getContent()).trim();

        if(ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH !== undefined) {
            this._vastParser.setMaxWrapperDepth(ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH);
        }

        return this._vastParser.retrieveVast(decodedVast, nativeBridge, request).then((vast): Promise<Campaign> => {
            const campaignId = this.getProgrammaticCampaignId(nativeBridge);
            return this.parseVastToCampaign(vast, nativeBridge, campaignId, session, abGroup, response);
        });
    }

    protected parseVastToCampaign(vast: Vast, nativeBridge: NativeBridge, campaignId: string, session: Session, abGroup: ABGroup, response: AuctionResponse): Promise<Campaign> {
        const cacheTTL = response.getCacheTTL();

        const baseCampaignParams: ICampaign = {
            id: this.getProgrammaticCampaignId(nativeBridge),
            abGroup: abGroup,
            willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
            adType: response.getAdType() || undefined,
            correlationId: response.getCorrelationId() || undefined,
            creativeId: response.getCreativeId() || undefined,
            seatId: response.getSeatId() || undefined,
            meta: undefined,
            session: session,
            mediaId: response.getMediaId()
        };

        const portraitUrl = vast.getCompanionPortraitUrl();
        let portraitAsset;
        if(portraitUrl) {
            portraitAsset = new Image(this.validateAndEncodeUrl(portraitUrl, session), session);
        }

        const landscapeUrl = vast.getCompanionLandscapeUrl();
        let landscapeAsset;
        if(landscapeUrl) {
            landscapeAsset = new Image(this.validateAndEncodeUrl(landscapeUrl, session), session);
        }

        const vastCampaignParms: IVastCampaign = {
            ... baseCampaignParams,
            vast: vast,
            video: new Video(this.validateAndEncodeUrl(vast.getVideoUrl(), session), session),
            hasEndscreen: !!vast.getCompanionPortraitUrl() || !!vast.getCompanionLandscapeUrl(),
            portrait: portraitAsset,
            landscape: landscapeAsset,
            trackingUrls: response.getTrackingUrls(),
            useWebViewUserAgentForTracking: response.getUseWebViewUserAgentForTracking(),
            buyerId: response.getBuyerId() || undefined,
            appCategory: response.getCategory() || undefined,
            appSubcategory: response.getSubCategory() || undefined,
            advertiserDomain: response.getAdvertiserDomain() || undefined,
            advertiserCampaignId: response.getAdvertiserCampaignId() || undefined,
            advertiserBundleId: response.getAdvertiserBundleId() || undefined,
            isMoatEnabled: response.isMoatEnabled() || undefined
        };

        const campaign = new VastCampaign(vastCampaignParms);
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
