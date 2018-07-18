import { CampaignParser } from 'Parsers/CampaignParser';
import { Request } from 'Utilities/Request';
import { Campaign, ICampaign } from 'Models/Campaign';
import { NativeBridge } from 'Native/NativeBridge';
import { DisplayInterstitialCampaign, IDisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { ABGroup } from 'Models/ABGroup';

export class ProgrammaticStaticInterstitialParser extends CampaignParser {
    public static ContentTypeHtml = 'programmatic/static-interstitial-html';
    public static ContentTypeJs = 'programmatic/static-interstitial-js';
    private _wrapWithScriptTag: boolean;

    constructor(wrapWithScriptTag: boolean) {
        super();
        this._wrapWithScriptTag = wrapWithScriptTag;
    }

    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, abGroup: ABGroup): Promise<Campaign> {
        let dynamicMarkup = decodeURIComponent(response.getContent());
        if (this._wrapWithScriptTag) {
            dynamicMarkup = '<script>' + dynamicMarkup + '</script>';
        }
        const cacheTTL = response.getCacheTTL();

        const baseCampaignParams: ICampaign = {
            id: this.getProgrammaticCampaignId(nativeBridge),
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
            height: response.getHeight() || undefined
        };

        return Promise.resolve(new DisplayInterstitialCampaign(displayInterstitialParams));

    }
}
