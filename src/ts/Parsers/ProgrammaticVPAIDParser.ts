import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { VPAIDParser } from 'Utilities/VPAIDParser';
import { ProgrammaticVastParser } from 'Parsers/ProgrammaticVastParser';
import { Vast } from 'Models/Vast/Vast';
import { IVPAIDCampaign, VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { Campaign, ICampaign } from 'Models/Campaign';
import { VastMediaFile } from 'Models/Vast/VastMediaFile';

export class ProgrammaticVPAIDParser extends ProgrammaticVastParser {

    private _vpaidParser: VPAIDParser = new VPAIDParser();

    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign> {
        const decodedVast = decodeURIComponent(response.getContent()).trim();
        return this._vastParser.retrieveVast(decodedVast, nativeBridge, request).then((vast): Promise<Campaign> => {
            const vpaidMediaFile = this.getVPAIDMediaFile(vast);
            const campaignId = this.getProgrammaticCampaignId(nativeBridge);
            if (vpaidMediaFile) {
                const vpaid = this._vpaidParser.parseFromVast(vast, vpaidMediaFile);

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
                    appCategory: response.getCategory() || undefined,
                    appSubCategory: response.getSubCategory() || undefined,
                    advertiserDomain: response.getAdvertiserDomain() || undefined,
                    advertiserCampaignId: response.getAdvertiserCampaignId() || undefined,
                    advertiserBundleId: response.getAdvertiserBundleId() || undefined,
                    useWebViewUserAgentForTracking: response.getUseWebViewUserAgentForTracking(),
                    buyerId: response.getBuyerId() || undefined,
                    session: session,
                    mediaId: response.getMediaId()
                };

                const vpaidCampaignParams: IVPAIDCampaign = {
                    ... baseCampaignParams,
                    vpaid: vpaid,
                    tracking: response.getTrackingUrls()
                };

                return Promise.resolve(new VPAIDCampaign(vpaidCampaignParams));
            } else {
                return this.parseVastToCampaign(vast, nativeBridge, campaignId, session, gamerId, abGroup, response);
            }
        });
    }

    private getVPAIDMediaFile(vast: Vast): VastMediaFile | null {
        return this._vpaidParser.getSupportedMediaFile(vast);
    }
}
