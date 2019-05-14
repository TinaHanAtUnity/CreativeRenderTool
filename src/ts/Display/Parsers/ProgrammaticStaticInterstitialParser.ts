import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { Platform } from 'Core/Constants/Platform';
import { DisplayInterstitialCampaign, IDisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { StringUtils } from 'Ads/Utilities/StringUtils';

export class ProgrammaticStaticInterstitialParser extends CampaignParser {

    public static ContentTypeHtml = 'programmatic/static-interstitial-html';
    public static ContentTypeJs = 'programmatic/static-interstitial-js';
    public static ErrorMessage = 'Display ad content is not in HTML format';

    constructor(platform: Platform) {
        super(platform);
    }

    public parse(response: AuctionResponse, session: Session): Promise<Campaign> {
        const dynamicMarkup = decodeURIComponent(response.getContent());
        if (!StringUtils.startWithHTMLTag(dynamicMarkup)) {
            throw new CampaignError(ProgrammaticStaticInterstitialParser.ErrorMessage, ProgrammaticStaticInterstitialParser.ContentTypeHtml, CampaignErrorLevel.MID, undefined, undefined, undefined, response.getSeatId(), response.getCreativeId());
        }

        const cacheTTL = response.getCacheTTL();

        const baseCampaignParams: ICampaign = {
            id: this.getProgrammaticCampaignId(),
            willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
            contentType: ProgrammaticStaticInterstitialParser.ContentTypeHtml,
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

        const displayInterstitialParams: IDisplayInterstitialCampaign = {
            ... baseCampaignParams,
            dynamicMarkup: dynamicMarkup,
            useWebViewUserAgentForTracking: false,
            width: response.getWidth() || undefined,
            height: response.getHeight() || undefined
        };

        return Promise.resolve(new DisplayInterstitialCampaign(displayInterstitialParams));

    }
}
