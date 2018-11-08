import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { DisplayInterstitialCampaign, IDisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';

export class ProgrammaticStaticInterstitialParser extends CampaignParser {

    public static ContentTypeHtml = 'programmatic/static-interstitial-html';
    public static ContentTypeJs = 'programmatic/static-interstitial-js';

    private _wrapWithScriptTag: boolean;

    constructor(wrapWithScriptTag: boolean) {
        super();
        this._wrapWithScriptTag = wrapWithScriptTag;
    }

    public getContentTypes() {
        if(this._wrapWithScriptTag) {
            return [ProgrammaticStaticInterstitialParser.ContentTypeJs];
        }
        return [ProgrammaticStaticInterstitialParser.ContentTypeHtml];
    }

    public parse(platform: Platform, core: ICoreApi, request: RequestManager, response: AuctionResponse, session: Session): Promise<Campaign> {
        let dynamicMarkup = decodeURIComponent(response.getContent());
        if (this._wrapWithScriptTag) {
            dynamicMarkup = '<script>' + dynamicMarkup + '</script>';
        }
        const cacheTTL = response.getCacheTTL();

        const baseCampaignParams: ICampaign = {
            id: this.getProgrammaticCampaignId(platform),
            willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
            contentType: this._wrapWithScriptTag ? ProgrammaticStaticInterstitialParser.ContentTypeJs : ProgrammaticStaticInterstitialParser.ContentTypeHtml,
            adType: response.getAdType() || undefined,
            correlationId: response.getCorrelationId() || undefined,
            creativeId: response.getCreativeId() || undefined,
            seatId: response.getSeatId() || undefined,
            meta: undefined,
            session: session,
            mediaId: response.getMediaId(),
            trackingUrls: response.getTrackingUrls() || {}
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
