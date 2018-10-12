import { Image } from 'Ads/Models/Assets/Image';
import { Video } from 'Ads/Models/Assets/Video';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { Platform } from 'Core/Constants/Platform';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Request } from 'Core/Utilities/Request';
import { Vast } from 'VAST/Models/Vast';
import { IVastCampaign, VastCampaign } from 'VAST/Models/VastCampaign';
import { VastParser } from 'VAST/Utilities/VastParser';
import { getOptimizedVideoUrl } from 'VAST/Utilities/VastMediaSelector';

export class ProgrammaticVastParser extends CampaignParser {
    public static ContentType = 'programmatic/vast';
    public static setVastParserMaxDepth(depth: number): void {
        ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH = depth;
    }

    private static VAST_PARSER_MAX_DEPTH: number;
    private _isMediaExperiment: boolean = false;

    protected _vastParser: VastParser = new VastParser();

    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, osVersion?: string, gameId?: string, connectionType?: string): Promise<Campaign> {
        const decodedVast = decodeURIComponent(response.getContent()).trim();

        if(ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH !== undefined) {
            this._vastParser.setMaxWrapperDepth(ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH);
        }

        return this._vastParser.retrieveVast(decodedVast, nativeBridge, request).then((vast): Promise<Campaign> => {
            const campaignId = this.getProgrammaticCampaignId(nativeBridge);
            return this.parseVastToCampaign(vast, nativeBridge, campaignId, session, response, connectionType);
        });
    }

    protected parseVastToCampaign(vast: Vast, nativeBridge: NativeBridge, campaignId: string, session: Session, response: AuctionResponse, connectionType?: string): Promise<Campaign> {
        const cacheTTL = response.getCacheTTL();

        const baseCampaignParams: ICampaign = {
            id: this.getProgrammaticCampaignId(nativeBridge),
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

        let videoUrl;
        if (this._isMediaExperiment && connectionType) {    // TODO: ab test with auction feature flag
            videoUrl = getOptimizedVideoUrl(vast.getVideoMedialFiles(), connectionType);
            if (!videoUrl) {
                throw new Error('No video URL found for VAST');
            }
        } else {
            videoUrl = vast.getVideoUrl();
        }

        const vastCampaignParms: IVastCampaign = {
            ... baseCampaignParams,
            vast: vast,
            video: new Video(this.validateAndEncodeUrl(videoUrl, session), session),
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
            impressionUrls: this.validateAndEncodeUrls(vast.getImpressionUrls(), session),
            isMoatEnabled: response.isMoatEnabled() || undefined
        };

        const campaign = new VastCampaign(vastCampaignParms);

        if(campaign.getImpressionUrls().length === 0) {
            throw new Error('Campaign does not have an impression url');
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
