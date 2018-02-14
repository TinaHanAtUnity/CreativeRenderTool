import { CampaignParser } from 'Parsers/CampaignParser';
import { Request } from 'Utilities/Request';
import { Campaign, ICampaign } from 'Models/Campaign';
import { NativeBridge } from 'Native/NativeBridge';
import { DisplayInterstitialCampaign, IDisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';

export class ProgrammaticStaticInterstitialParser extends CampaignParser {
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
            appCategory: undefined,
            appSubCategory: undefined,
            advertiserDomain: undefined,
            advertiserCampaignId: undefined,
            advertiserBundleId: undefined,
            useWebViewUserAgentForTracking: response.getUseWebViewUserAgentForTracking(),
            buyerId: undefined,
            session: session
        };

        const displayInterstitialParams: IDisplayInterstitialCampaign = {
            ... baseCampaignParams,
            dynamicMarkup: dynamicMarkup,
            tracking: response.getTrackingUrls() || undefined
        };

        return Promise.resolve(new DisplayInterstitialCampaign(displayInterstitialParams));

    }
}
