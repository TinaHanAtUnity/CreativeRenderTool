import { ProgrammaticAdMobParser } from 'AdMob/Parsers/ProgrammaticAdMobParser';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { ProgrammaticStaticInterstitialParser } from 'Display/Parsers/ProgrammaticStaticInterstitialParser';
import { ProgrammaticMraidParser } from 'MRAID/Parsers/ProgrammaticMraidParser';
import { ProgrammaticMraidUrlParser } from 'MRAID/Parsers/ProgrammaticMraidUrlParser';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';
import { PromoCampaignParser } from 'Promo/Parsers/PromoCampaignParser';
import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';
import { ProgrammaticVPAIDParser } from 'VPAID/Parsers/ProgrammaticVPAIDParser';
import { XPromoCampaignParser } from 'XPromo/Parsers/XPromoCampaignParser';

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
