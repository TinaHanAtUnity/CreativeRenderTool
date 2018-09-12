import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { BannerCampaignParser } from 'Banners/Parsers/BannerCampaignParser';

export class BannerCampaignParserFactory {
    public static getCampaignParser(contentType: string): CampaignParser {
        switch (contentType) {
            case BannerCampaignParser.ContentTypeJS:
                return new BannerCampaignParser(true);
            case BannerCampaignParser.ContentTypeHTML:
                return new BannerCampaignParser();
            default:
                throw new Error(`Unsupported content-type: ${contentType}`);
        }
    }
}
