import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Request } from 'Core/Utilities/Request';
import { DisplayInterstitialCampaign, IDisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';

export class ProgrammaticStaticInterstitialParser extends CampaignParser {
    public static ContentTypeHtml = 'programmatic/static-interstitial-html';
    public static ContentTypeJs = 'programmatic/static-interstitial-js';
    private _wrapWithScriptTag: boolean;

    constructor(wrapWithScriptTag: boolean) {
        super();
        this._wrapWithScriptTag = wrapWithScriptTag;
    }

    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session): Promise<Campaign> {

        this._creativeID = response.getCreativeId();
        this._seatID = response.getSeatId();

        let dynamicMarkup = decodeURIComponent(response.getContent());
        if (this._wrapWithScriptTag) {
            dynamicMarkup = '<script>' + dynamicMarkup + '</script>';
        }
        const cacheTTL = response.getCacheTTL();

        const baseCampaignParams: ICampaign = {
            id: this.getProgrammaticCampaignId(nativeBridge),
            willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
            adType: response.getAdType() || undefined,
            correlationId: response.getCorrelationId() || undefined,
            creativeId: this._creativeID,
            seatId: this._seatID,
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
