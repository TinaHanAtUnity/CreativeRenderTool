import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { ICore } from 'Core/ICore';
import { Vast } from 'VAST/Models/Vast';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';
import { IVPAIDCampaign, VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { VPAIDParser } from 'VPAID/Utilities/VPAIDParser';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';

export class ProgrammaticVPAIDParser extends ProgrammaticVastParser {

    public static ContentType = CampaignContentTypes.ProgrammaticVpaid;

    private _vpaidParser: VPAIDParser = new VPAIDParser();

    constructor(core: ICore) {
        super(core);
    }

    public parse(response: AuctionResponse, session: Session): Promise<Campaign> {
        return this.retrieveVast(response).then((vast): Promise<Campaign> => {
            const vpaidMediaFile = this.getVPAIDMediaFile(vast);
            if (vpaidMediaFile) {
                const vpaid = this._vpaidParser.parseFromVast(vast, vpaidMediaFile);

                const cacheTTL = response.getCacheTTL();

                const baseCampaignParams: ICampaign = {
                    id: this.getProgrammaticCampaignId(),
                    willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
                    contentType: ProgrammaticVPAIDParser.ContentType,
                    adType: response.getAdType() || undefined,
                    correlationId: response.getCorrelationId() || undefined,
                    creativeId: response.getCreativeId() || undefined,
                    seatId: response.getSeatId() || undefined,
                    meta: undefined,
                    session: session,
                    mediaId: response.getMediaId(),
                    trackingUrls: response.getTrackingUrls() || {},
                    backupCampaign: false,
                    isLoadEnabled: false
                };

                const vpaidCampaignParams: IVPAIDCampaign = {
                    ... baseCampaignParams,
                    vpaid: vpaid,
                    appCategory: response.getCategory() || undefined,
                    appSubcategory: response.getSubCategory() || undefined,
                    advertiserDomain: response.getAdvertiserDomain() || undefined,
                    advertiserCampaignId: response.getAdvertiserCampaignId() || undefined,
                    advertiserBundleId: response.getAdvertiserBundleId() || undefined,
                    useWebViewUserAgentForTracking: response.getUseWebViewUserAgentForTracking(),
                    buyerId: response.getBuyerId() || undefined
                };

                return Promise.resolve(new VPAIDCampaign(vpaidCampaignParams));
            } else {
                return this.parseVastToCampaign(vast, session, response);
            }
        });
    }

    private getVPAIDMediaFile(vast: Vast): VastMediaFile | null {
        return this._vpaidParser.getSupportedMediaFile(vast);
    }
}
