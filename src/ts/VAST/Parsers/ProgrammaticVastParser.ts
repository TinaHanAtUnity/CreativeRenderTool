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
import { VastErrorHandler, VastErrorCode, VastErrorMessage } from 'VAST/EventHandlers/VastErrorHandler';
import { Url } from 'Core/Utilities/Url';
// tslint:disable:no-console
export class ProgrammaticVastParser extends CampaignParser {
    public static ContentType = 'programmatic/vast';
    public static setVastParserMaxDepth(depth: number): void {
        ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH = depth;
    }

    private static VAST_PARSER_MAX_DEPTH: number;

    protected _vastParser: VastParser = new VastParser();

    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session): Promise<Campaign> {
        const decodedVast = decodeURIComponent(response.getContent()).trim();

        if(ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH !== undefined) {
            this._vastParser.setMaxWrapperDepth(ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH);
        }

        return this._vastParser.retrieveVast(decodedVast, nativeBridge, request).then((vast): Promise<Campaign> => {
            const campaignId = this.getProgrammaticCampaignId(nativeBridge);
            return this.parseVastToCampaign(vast, nativeBridge, request, campaignId, session, response);
        });
    }

    protected parseVastToCampaign(vast: Vast, nativeBridge: NativeBridge, request: Request, campaignId: string, session: Session, response: AuctionResponse): Promise<Campaign> {
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
        console.log('parseVastToCampaign ----- ');
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

        const vastErrorTrackingUrl = vast.getErrorURLTemplate();
        let mediaVideoUrl = vast.getMediaVideoUrl();
        console.log('parseVastToCampaign ----- mediaVideoUrl ' + mediaVideoUrl);
        if (!mediaVideoUrl) {
            if (vastErrorTrackingUrl) {
                VastErrorHandler.sendVastErrorEventRequest(request, vastErrorTrackingUrl, VastErrorCode.MEDIA_FILE_NOT_FOUND);
            }
            console.log('parseVastToCampaign ----- media file not found error!!! vastErrorUrl ' + vastErrorTrackingUrl);
            throw new Error(VastErrorMessage.MEDIA_FILE_NOT_FOUND);
        }
        console.log('parseVastToCampaign ----- ongoing');
        if (nativeBridge.getPlatform() === Platform.IOS && !mediaVideoUrl.match(/^https:\/\//)) {
            if (vastErrorTrackingUrl) {
                VastErrorHandler.sendVastErrorEventRequest(request, vastErrorTrackingUrl, VastErrorCode.MEDIA_FILE_PLAY_ERROR);
            }

            const videoUrlError = new DiagnosticError(
                new Error('Campaign video url needs to be https for iOS'),
                { rootWrapperVast: response.getContent() }
            );
            throw videoUrlError;
        }

        if (!Url.isValid(mediaVideoUrl)) {
            if (vastErrorTrackingUrl) {
                VastErrorHandler.sendVastErrorEventRequest(request, vastErrorTrackingUrl, VastErrorCode.MEDIA_FILE_UNSUPPORTED);
            }

            throw new Error('Invalid Url in VAST Media url');
        }

        mediaVideoUrl = Url.encode(mediaVideoUrl);

        const vastCampaignParms: IVastCampaign = {
            ... baseCampaignParams,
            vast: vast,
            video: new Video(mediaVideoUrl, session),
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

        return Promise.resolve(campaign);
    }
}
