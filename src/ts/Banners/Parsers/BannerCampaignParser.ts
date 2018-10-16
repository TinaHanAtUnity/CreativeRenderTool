import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { BannerCampaign, IBannerCampaign } from 'Banners/Models/BannerCampaign';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/Core';

export class BannerCampaignParser extends CampaignParser {
    public static ContentTypeJS = 'programmatic/banner-js';
    public static ContentTypeHTML = 'programmatic/banner-html';

    private _wrapJS = false;

    constructor(wrapJS: boolean = false) {
        super();
        this._wrapJS = wrapJS;
    }

    public getContentTypes() {
        return [
            BannerCampaignParser.ContentTypeJS,
            BannerCampaignParser.ContentTypeHTML
        ];
    }

    public parse(platform: Platform, core: ICoreApi, request: RequestManager, response: AuctionResponse, session: Session, osVersion?: string): Promise<Campaign> {
        const markup = this._wrapJS ? this.getJSContent(response) : this.getHTMLContent(response);
        const campaign = <IBannerCampaign>{
            id: this.getProgrammaticCampaignId(platform),
            adType: response.getAdType(),
            correlationId: response.getCorrelationId(),
            mediaId: response.getMediaId(),
            creativeId: response.getCreativeId(),
            meta: undefined,
            session: session,
            seatId: response.getSeatId(),
            willExpireAt: response.getCacheTTL(),
            markup: markup,
            trackingUrls: response.getTrackingUrls(),
            width: response.getWidth(),
            height: response.getHeight()
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
