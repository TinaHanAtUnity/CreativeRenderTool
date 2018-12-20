import { Image } from 'Ads/Models/Assets/Image';
import { Video } from 'Ads/Models/Assets/Video';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { Platform } from 'Core/Constants/Platform';
import { Vast } from 'VAST/Models/Vast';
import { IVastCampaign, VastCampaign } from 'VAST/Models/VastCampaign';
import { VastParser } from 'VAST/Utilities/VastParser';
import { Url } from 'Core/Utilities/Url';
import { VastMediaSelector } from 'VAST/Utilities/VastMediaSelector';
import { CampaignError } from 'Ads/Errors/CampaignError';
import { VastErrorInfo, VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';

export class ProgrammaticVastParser extends CampaignParser {
    public static ContentType = CampaignContentTypes.ProgrammaticVast;

    public static setVastParserMaxDepth(depth: number): void {
        ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH = depth;
    }

    private static VAST_PARSER_MAX_DEPTH: number;

    protected _vastParser: VastParser = new VastParser();

    public parse(platform: Platform, core: ICoreApi, request: RequestManager, response: AuctionResponse, session: Session, osVersion?: string, gameId?: string, connectionType?: string): Promise<Campaign> {
        const decodedVast = decodeURIComponent(response.getContent()).trim();

        if(ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH !== undefined) {
            this._vastParser.setMaxWrapperDepth(ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH);
        }

        return this._vastParser.retrieveVast(decodedVast, core, request).then((vast): Promise<Campaign> => {
            const campaignId = this.getProgrammaticCampaignId(platform);
            return this.parseVastToCampaign(vast, platform, campaignId, session, response, connectionType);
        });
    }

    protected parseVastToCampaign(vast: Vast, platform: Platform, campaignId: string, session: Session, response: AuctionResponse, connectionType?: string): Promise<Campaign> {
        const cacheTTL = response.getCacheTTL();

        const baseCampaignParams: ICampaign = {
            id: this.getProgrammaticCampaignId(platform),
            willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
            contentType: ProgrammaticVastParser.ContentType,
            adType: response.getAdType() || undefined,
            correlationId: response.getCorrelationId() || undefined,
            creativeId: response.getCreativeId() || undefined,
            seatId: response.getSeatId() || undefined,
            meta: undefined,
            session: session,
            mediaId: response.getMediaId(),
            trackingUrls: response.getTrackingUrls() || {},
            backupCampaign: false
        };

        let errorTrackingUrl;
        if (vast.getErrorURLTemplate()) {
            errorTrackingUrl = vast.getErrorURLTemplate()!;
        }

        const vastImpressionUrls: string[] = [];
        for (const impUrl of vast.getImpressionUrls()) {
            if (Url.isValid(impUrl)) {
                vastImpressionUrls.push(Url.encodeUrlWithQueryParams(impUrl));
            }
        }

        const portraitUrl = vast.getCompanionPortraitUrl();
        let portraitAsset;
        if(portraitUrl) {
            if (!Url.isValid(portraitUrl)) {
                throw new CampaignError(VastErrorInfo.errorMap[VastErrorCode.MEDIA_FILE_UNSUPPORTED], CampaignContentTypes.ProgrammaticVast, errorTrackingUrl, VastErrorCode.MEDIA_FILE_UNSUPPORTED, portraitUrl);
            }
            portraitAsset = new Image(Url.encode(portraitUrl), session);
        }

        const landscapeUrl = vast.getCompanionLandscapeUrl();
        let landscapeAsset;
        if(landscapeUrl) {
            if (!Url.isValid(landscapeUrl)) {
                throw new CampaignError(VastErrorInfo.errorMap[VastErrorCode.MEDIA_FILE_UNSUPPORTED], CampaignContentTypes.ProgrammaticVast, errorTrackingUrl, VastErrorCode.MEDIA_FILE_UNSUPPORTED, landscapeUrl);
            }
            landscapeAsset = new Image(Url.encode(landscapeUrl), session);
        }

        let mediaVideoUrl = VastMediaSelector.getOptimizedVideoUrl(vast.getVideoMediaFiles(), connectionType);
        if (!mediaVideoUrl) {
            throw new CampaignError(VastErrorInfo.errorMap[VastErrorCode.MEDIA_FILE_URL_NOT_FOUND], CampaignContentTypes.ProgrammaticVast, errorTrackingUrl, VastErrorCode.MEDIA_FILE_URL_NOT_FOUND);
        }

        if (platform === Platform.IOS && !mediaVideoUrl.match(/^https:\/\//)) {
            throw new CampaignError(VastErrorInfo.errorMap[VastErrorCode.MEDIA_FILE_UNSUPPORTED_IOS], CampaignContentTypes.ProgrammaticVast, errorTrackingUrl, VastErrorCode.MEDIA_FILE_UNSUPPORTED_IOS, mediaVideoUrl);
        }

        if (!Url.isValid(mediaVideoUrl)) {
            throw new CampaignError(VastErrorInfo.errorMap[VastErrorCode.MEDIA_FILE_UNSUPPORTED], CampaignContentTypes.ProgrammaticVast, errorTrackingUrl, VastErrorCode.MEDIA_FILE_UNSUPPORTED, mediaVideoUrl);
        }

        mediaVideoUrl = Url.encode(mediaVideoUrl);

        const vastCampaignParms: IVastCampaign = {
            ... baseCampaignParams,
            vast: vast,
            video: new Video(mediaVideoUrl, session),
            hasEndscreen: !!portraitAsset || !!landscapeAsset,
            portrait: portraitAsset,
            landscape: landscapeAsset,
            useWebViewUserAgentForTracking: response.getUseWebViewUserAgentForTracking(),
            buyerId: response.getBuyerId() || undefined,
            appCategory: response.getCategory() || undefined,
            appSubcategory: response.getSubCategory() || undefined,
            advertiserDomain: response.getAdvertiserDomain() || undefined,
            advertiserCampaignId: response.getAdvertiserCampaignId() || undefined,
            advertiserBundleId: response.getAdvertiserBundleId() || undefined,
            impressionUrls: vastImpressionUrls,
            isMoatEnabled: response.isMoatEnabled() || undefined
        };

        const campaign = new VastCampaign(vastCampaignParms);

        return Promise.resolve(campaign);
    }
}
