import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { BannerCampaignParser } from 'Banners/Parsers/BannerCampaignParser';
import { Platform } from 'Core/Constants/Platform';

export class BannerCampaignParserFactory {
    public static getCampaignParser(platform: Platform, contentType: string): CampaignParser {
        switch (contentType) {
            case BannerCampaignParser.ContentTypeJS:
                return new BannerCampaignParser(platform, true);
            case BannerCampaignParser.ContentTypeHTML:
                return new BannerCampaignParser(platform);
            default:
                throw new Error(`Unsupported content-type: ${contentType}`);
        }
    }
}
