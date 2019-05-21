import { CampaignParseError } from 'Ads/Utilities/ProgrammaticTrackingService';

export enum CampaignContentType {
    ProgrammaticVAST = 'programmatic/vast',
    ProgrammaticMRAID = 'programmatic/mraid',
    ProgrammaticMRAIDUrl = 'programmatic/mraid-url',
    ProgrammaticVPAID = 'programmatic/vast-vpaid',
    ProgrammaticAdmobVideo = 'programmatic/admob-video',
    ProgrammaticJSBanner = 'programmatic/banner-js',
    ProgrammaticHTMLBanner = 'programmatic/banner-html',
    ProgrammaticJSStaticInterstitial = 'programmatic/static-interstitial-js',
    ProgrammaticHTMLStaticInterstitial = 'programmatic/static-interstitial-html',
    CometVideo = 'comet/campaign',
    CometMRAIDUrl = 'comet/mraid-url',
    IAPPromotion = 'purchasing/iap',
    XPromoVideo = 'xpromo/video'
}

export class ContentType {
    public static getCampaignParseError(contentType: string): CampaignParseError {
        let errorType = CampaignParseError.UnknownParseError;
        const parseError = `parse_campaign_${contentType.replace(/[\/-]/g, '_')}_error`;
        if (Object.values(CampaignContentType).includes(contentType) && Object.values(CampaignParseError).includes(parseError)) {
            errorType = <CampaignParseError>parseError;
        }
        return errorType;
    }
}
