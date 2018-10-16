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
import { VastAdUnitFactory } from '../../VAST/AdUnits/VastAdUnitFactory';
import { PerformanceAdUnitFactory } from '../../Performance/AdUnits/PerformanceAdUnitFactory';
import { XPromoAdUnitFactory } from '../../XPromo/AdUnits/XPromoAdUnitFactory';
import { MRAIDAdUnitFactory } from '../../MRAID/AdUnits/MRAIDAdUnitFactory';
import { DisplayInterstitialAdUnitFactory } from '../../Display/AdUnits/DisplayInterstitialAdUnitFactory';
import { AdMobAdUnitFactory } from '../../AdMob/AdUnits/AdMobAdUnitFactory';
import { VPAIDAdUnitFactory } from '../../VPAID/AdUnits/VPAIDAdUnitFactory';
import { PromoAdUnitFactory } from '../../Promo/AdUnits/PromoAdUnitFactory';

export class CampaignParserFactory {
    public static getCampaignParser(contentType: string): CampaignParser {
        switch (contentType) {
            case PerformanceAdUnitFactory.ContentType:
            case PerformanceAdUnitFactory.ContentTypeVideo:
            case PerformanceAdUnitFactory.ContentTypeMRAID:
                return new CometCampaignParser();
            case XPromoAdUnitFactory.ContentType:
                return new XPromoCampaignParser();
            case VastAdUnitFactory.ContentType:
                return new ProgrammaticVastParser();
            case MRAIDAdUnitFactory.ContentTypeURL:
                return new ProgrammaticMraidUrlParser();
            case MRAIDAdUnitFactory.ContentType:
                return new ProgrammaticMraidParser();
            case DisplayInterstitialAdUnitFactory.ContentTypeHtml:
                return new ProgrammaticStaticInterstitialParser(false);
            case DisplayInterstitialAdUnitFactory.ContentTypeJs:
                return new ProgrammaticStaticInterstitialParser(true);
            case AdMobAdUnitFactory.ContentType:
                return new ProgrammaticAdMobParser();
            case VPAIDAdUnitFactory.ContentType:
                return new ProgrammaticVPAIDParser();
            case PromoAdUnitFactory.ContentType:
                return new PromoCampaignParser();
            default:
        }
        throw new Error(`Unsupported content-type: ${contentType}`);
    }
}
