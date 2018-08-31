import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { CometCampaignParser } from 'Ads/Parsers/CometCampaignParser';
import { XPromoCampaignParser } from 'Ads/Parsers/XPromoCampaignParser';
import { ProgrammaticVastParser } from 'Ads/Parsers/ProgrammaticVastParser';
import { ProgrammaticMraidUrlParser } from 'Ads/Parsers/ProgrammaticMraidUrlParser';
import { ProgrammaticMraidParser } from 'Ads/Parsers/ProgrammaticMraidParser';
import { ProgrammaticStaticInterstitialParser } from 'Ads/Parsers/ProgrammaticStaticInterstitialParser';
import { ProgrammaticAdMobParser } from 'Ads/Parsers/ProgrammaticAdMobParser';
import { ProgrammaticVPAIDParser } from 'Ads/Parsers/ProgrammaticVPAIDParser';
import { PromoCampaignParser } from 'Ads/Parsers/PromoCampaignParser';

export class CampaignParserFactory {
    public static getCampaignParser(contentType: string): CampaignParser {
        switch (contentType) {
            case CometCampaignParser.ContentType:
                return new CometCampaignParser();
            case XPromoCampaignParser.ContentType:
                return new XPromoCampaignParser();
            case ProgrammaticVastParser.ContentType:
                return new ProgrammaticVastParser();
            case ProgrammaticMraidUrlParser.ContentType:
                return new ProgrammaticMraidUrlParser();
            case ProgrammaticMraidParser.ContentType:
                return new ProgrammaticMraidParser();
            case ProgrammaticStaticInterstitialParser.ContentTypeHtml:
                return new ProgrammaticStaticInterstitialParser(false);
            case ProgrammaticStaticInterstitialParser.ContentTypeJs:
                return new ProgrammaticStaticInterstitialParser(true);
            case ProgrammaticAdMobParser.ContentType:
                return new ProgrammaticAdMobParser();
            case ProgrammaticVPAIDParser.ContentType:
                return new ProgrammaticVPAIDParser();
            case PromoCampaignParser.ContentType:
                return new PromoCampaignParser();
            default:
        }
        throw new Error(`Unsupported content-type: ${contentType}`);
    }
}
