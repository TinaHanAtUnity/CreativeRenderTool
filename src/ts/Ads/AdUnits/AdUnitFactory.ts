import { ProgrammaticAdMobParser } from 'AdMob/Parsers/ProgrammaticAdMobParser';
import { ProgrammaticStaticInterstitialParser } from 'Display/Parsers/ProgrammaticStaticInterstitialParser';
import { ProgrammaticMraidParser } from 'MRAID/Parsers/ProgrammaticMraidParser';
import { ProgrammaticMraidUrlParser } from 'MRAID/Parsers/ProgrammaticMraidUrlParser';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';
import { PromoCampaignParser } from 'Promo/Parsers/PromoCampaignParser';
import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';
import { ProgrammaticVPAIDParser } from 'VPAID/Parsers/ProgrammaticVPAIDParser';
import { XPromoCampaignParser } from 'XPromo/Parsers/XPromoCampaignParser';
import { AbstractAdUnitFactory } from './AbstractAdUnitFactory';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { XPromoAdUnitFactory } from 'XPromo/AdUnits/XPromoAdUnitFactory';
import { VastAdUnitFactory } from 'VAST/AdUnits/VastAdUnitFactory';
import { MRAIDAdUnitFactory } from 'MRAID/AdUnits/MRAIDAdUnitFactory';
import { DisplayInterstitialAdUnitFactory } from 'Display/AdUnits/DisplayInterstitialAdUnitFactory';
import { AdMobAdUnitFactory } from 'AdMob/AdUnits/AdMobAdUnitFactory';
import { VPAIDAdUnitFactory } from 'VPAID/AdUnits/VPAIDAdUnitFactory';
import { PromoAdUnitFactory } from 'Promo/AdUnits/PromoAdUnitFactory';

export class AdUnitFactory {
    public static getAdUnitFactory(contentType: string): AbstractAdUnitFactory {
        switch (contentType) {
            case CometCampaignParser.ContentType:
            case CometCampaignParser.ContentTypeVideo:
            case CometCampaignParser.ContentTypeMRAID:
                return new PerformanceAdUnitFactory();
            case XPromoCampaignParser.ContentType:
                return new XPromoAdUnitFactory();
            case ProgrammaticVastParser.ContentType:
                return new VastAdUnitFactory();
            case ProgrammaticMraidUrlParser.ContentType:
            case ProgrammaticMraidParser.ContentType:
                return new MRAIDAdUnitFactory();
            case ProgrammaticStaticInterstitialParser.ContentTypeHtml:
            case ProgrammaticStaticInterstitialParser.ContentTypeJs:
                return new DisplayInterstitialAdUnitFactory();
            case ProgrammaticAdMobParser.ContentType:
                return new AdMobAdUnitFactory();
            case ProgrammaticVPAIDParser.ContentType:
                return new VPAIDAdUnitFactory();
            case PromoCampaignParser.ContentType:
                return new PromoAdUnitFactory();
            default:
        }
        throw new Error(`Unsupported content-type: ${contentType}`);
    }
}
