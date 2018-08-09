import { CampaignParser } from 'Parsers/CampaignParser';
import { Campaign } from 'Models/Campaign';
import { Request } from 'Utilities/Request';
import { NativeBridge } from 'Native/NativeBridge';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { IBannerCampaign, BannerCampaign } from 'AdTypes/Banner/Models/Campaigns/BannerCampaign';
import { ABGroup } from 'Models/ABGroup';

export class BannerCampaignParser extends CampaignParser {
    public static ContentTypeJS = 'programmatic/banner-js';
    public static ContentTypeHTML = 'programmatic/banner-html';

    private _wrapJS = false;

    constructor(wrapJS: boolean = false) {
        super();
        this._wrapJS = wrapJS;
    }

    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, osVersion?: string): Promise<Campaign> {
        const markup = this._wrapJS ? this.getJSContent(response) : this.getHTMLContent(response);
        const campaign = <IBannerCampaign>{
            id: this.getProgrammaticCampaignId(nativeBridge),
            adType: response.getAdType(),
            correlationId: response.getCorrelationId(),
            mediaId: response.getMediaId(),
            creativeId: response.getCreativeId(),
            meta: undefined,
            session: session,
            seatId: response.getSeatId(),
            willExpireAt: response.getCacheTTL(),
            markup: markup,
            trackingUrls: response.getTrackingUrls()
        };
        return Promise.resolve(new BannerCampaign(campaign));
    }

    private getJSContent(response: AuctionResponse) {
        return encodeURIComponent(`<script>${response.getContent()}</script>`);
    }

    private getHTMLContent(response: AuctionResponse) {
        return encodeURIComponent(response.getContent());
    }
}
