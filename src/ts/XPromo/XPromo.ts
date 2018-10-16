import { IParserModule } from '../Ads/Modules/IParserModule';
import { XPromoCampaignParser } from './Parsers/XPromoCampaignParser';
import { XPromoAdUnitFactory } from './AdUnits/XPromoAdUnitFactory';

export class XPromo implements IParserModule {

    private readonly _parser: XPromoCampaignParser;
    private readonly _adUnitFactory: XPromoAdUnitFactory;

    constructor() {
        this._parser = new XPromoCampaignParser();
        this._adUnitFactory = new XPromoAdUnitFactory();
    }

    public canParse(contentType: string) {
        return contentType === XPromoCampaignParser.ContentType;
    }

    public getParser(contentType: string) {
        return this._parser;
    }

    public getParsers() {
        return [this._parser];
    }

    public getAdUnitFactory() {
        return this._adUnitFactory;
    }

}
