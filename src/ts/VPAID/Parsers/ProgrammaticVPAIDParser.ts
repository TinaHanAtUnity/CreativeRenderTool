import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Request } from 'Core/Utilities/Request';
import { Vast } from 'VAST/Models/Vast';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';
import { IVPAIDCampaign, VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { VPAIDParser } from 'VPAID/Utilities/VPAIDParser';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';

export class ProgrammaticVPAIDParser extends ProgrammaticVastParser {
    public static ContentType = CampaignContentTypes.ProgrammaticVpaid;

    private _vpaidParser: VPAIDParser = new VPAIDParser();

    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session): Promise<Campaign> {
        const decodedVast = decodeURIComponent(response.getContent()).trim();
        return this._vastParser.retrieveVast(decodedVast, nativeBridge, request).then((vast): Promise<Campaign> => {
            const vpaidMediaFile = this.getVPAIDMediaFile(vast);
            const campaignId = this.getProgrammaticCampaignId(nativeBridge);
            if (vpaidMediaFile) {
                const vpaid = this._vpaidParser.parseFromVast(vast, vpaidMediaFile);

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

                const vpaidCampaignParams: IVPAIDCampaign = {
                    ... baseCampaignParams,
                    vpaid: vpaid,
                    trackingUrls: response.getTrackingUrls(),
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
                return this.parseVastToCampaign(vast, nativeBridge, campaignId, session, response);
            }
        });
    }

    private getVPAIDMediaFile(vast: Vast): VastMediaFile | null {
        return this._vpaidParser.getSupportedMediaFile(vast);
    }
}
