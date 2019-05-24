import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { BannerCampaignParser } from 'Banners/Parsers/BannerCampaignParser';
import { Platform } from 'Core/Constants/Platform';
import { CampaignContentType } from 'Ads/Utilities/CampaignContentType';

export class BannerCampaignParserFactory {
    public static getCampaignParser(platform: Platform, contentType: string): CampaignParser {
        switch (contentType) {
            case CampaignContentType.ProgrammaticJSBanner:
                return new BannerCampaignParser(platform, true);
            case CampaignContentType.ProgrammaticHTMLBanner:
                return new BannerCampaignParser(platform);
            default:
                throw new Error(`Unsupported content-type: ${contentType}`);
        }
    }
}
