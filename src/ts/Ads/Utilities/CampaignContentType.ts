import { CampaignParseError } from 'Ads/Utilities/ProgrammaticTrackingService';

export enum CampaignContentType {
    ProgrammaticVAST = 'programmatic/vast',
    ProgrammaticMRAID = 'programmatic/mraid',
    ProgrammaticMRAIDUrl = 'programmatic/mraid-url',
    ProgrammaticVPAID = 'programmatic/vast-vpaid',
    ProgrammaticAdmobVideo = 'programmatic/admob-video',
    ProgrammaticJSBanner = 'programmatic/banner-js',
    ProgrammaticHTMLBanner = 'programmatic/banner-html',
    ProgrammaticHTMLStaticInterstitial = 'programmatic/static-interstitial-html',
    CometVideo = 'comet/campaign',
    CometMRAIDUrl = 'comet/mraid-url',
    IAPPromotion = 'purchasing/iap',
    XPromoVideo = 'xpromo/video'
}

export class ContentType {

    private static errorMap: { [key: string]: CampaignParseError } = {};

    public static initializeContentMapping(contentTypes: string[]) {
        contentTypes.forEach(contentType => {
            const parseError = `parse_campaign_${contentType.replace(/[\/-]/g, '_')}_error`;
            const isValidContentType = contentTypes.includes(contentType);
            const hasValidCampaignParseError = Object.values(CampaignParseError).includes(parseError);
            if (isValidContentType && hasValidCampaignParseError) {
                this.errorMap[contentType] = <CampaignParseError>parseError;
            }
        });
    }

    public static getCampaignParseError(contentType: string): CampaignParseError {
        return this.errorMap[contentType] || CampaignParseError.UnknownParseError;
    }
}
