import { AdMobCampaign, IAdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { ICore } from 'Core/ICore';

export class ProgrammaticAdMobParser extends CampaignParser {

    public static ContentType = 'programmatic/admob-video';

    constructor(core: ICore) {
        super(core.NativeBridge.getPlatform());
    }

    public parse(response: AuctionResponse, session: Session): Promise<AdMobCampaign> {
        const markup = response.getContent();
        const cacheTTL = response.getCacheTTL();
        const isOpenMeasurementEnabled = response.isAdmobOMEnabled();
        const shouldMuteByDefault = response.shouldMuteByDefault();
        const baseCampaignParams: ICampaign = {
            id: this.getProgrammaticCampaignId(),
            willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
            contentType: ProgrammaticAdMobParser.ContentType,
            adType: response.getAdType() || undefined,
            correlationId: response.getCorrelationId() || undefined,
            creativeId: response.getCreativeId() || undefined,
            seatId: response.getSeatId() || undefined,
            meta: undefined,
            session: session,
            mediaId: response.getMediaId(),
            trackingUrls: response.getTrackingUrls() || {},
            isLoadEnabled: false
        };

        const adMobCampaignParams: IAdMobCampaign = {
            ...baseCampaignParams,
            dynamicMarkup: markup,
            useWebViewUserAgentForTracking: true,
            omVendors: [],
            isOMEnabled: isOpenMeasurementEnabled,
            shouldMuteByDefault: shouldMuteByDefault
        };

        return Promise.resolve(new AdMobCampaign(adMobCampaignParams));
    }
}
