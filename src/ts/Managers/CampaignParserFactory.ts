import { CampaignParser } from 'Parsers/CampaignParser';
import { CometCampaignParser } from 'Parsers/CometCampaignParser';
import { XPromoCampaignParser } from 'Parsers/XPromoCampaignParser';
import { ProgrammaticVastParser } from 'Parsers/ProgrammaticVastParser';
import { ProgrammaticMraidUrlParser } from 'Parsers/ProgrammaticMraidUrlParser';
import { ProgrammaticMraidParser } from 'Parsers/ProgrammaticMraidParser';
import { ProgrammaticStaticInterstitialParser } from 'Parsers/ProgrammaticStaticInterstitialParser';
import { ProgrammaticAdMobParser } from 'Parsers/ProgrammaticAdMobParser';
import { ProgrammaticVPAIDParser } from 'Parsers/ProgrammaticVPAIDParser';
import { PromoCampaignParser } from 'Parsers/PromoCampaignParser';
import { BannerCampaignParser } from 'AdTypes/Banner/Parsers/BannerCampaignParser';

export class CampaignParserFactory {
    public static getCampaignParser(contentType: string): CampaignParser {
        switch (contentType) {
            case CometCampaignParser.ContentType:
            case CometCampaignParser.ContentTypeVideo:
            case CometCampaignParser.ContentTypeMRAID:
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
