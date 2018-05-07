import { CampaignParser } from 'Parsers/CampaignParser';
import { Request } from 'Utilities/Request';
import { Campaign, ICampaign } from 'Models/Campaign';
import { NativeBridge } from 'Native/NativeBridge';
import { DisplayInterstitialCampaign, IDisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';

export class ProgrammaticStaticInterstitialParser extends CampaignParser {
    public static ContentTypeHtml = 'programmatic/static-interstitial-html';
    public static ContentTypeJs = 'programmatic/static-interstitial-js';
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign> {
        const dynamicMarkup = decodeURIComponent(response.getContent());
        const cacheTTL = response.getCacheTTL();

        const baseCampaignParams: ICampaign = {
            id: this.getProgrammaticCampaignId(nativeBridge),
            gamerId: gamerId,
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

        const displayInterstitialParams: IDisplayInterstitialCampaign = {
            ... baseCampaignParams,
            dynamicMarkup: dynamicMarkup,
            trackingUrls: response.getTrackingUrls(),
            useWebViewUserAgentForTracking: false,
            width: response.getWidth() || undefined,
            height: response.getHeight() || undefined,
            contentType: response.getContentType() || undefined
        };

        return Promise.resolve(new DisplayInterstitialCampaign(displayInterstitialParams));

    }
}
