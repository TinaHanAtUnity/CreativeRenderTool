import { IParserModule } from 'Ads/Modules/IParserModule';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';

export class Performance implements IParserModule {

    private readonly _parser: CometCampaignParser;
    private readonly _adUnitFactory: PerformanceAdUnitFactory;

    constructor() {
        this._parser = new CometCampaignParser();
        this._adUnitFactory = new PerformanceAdUnitFactory();
    }

    public canParse(contentType: string) {
        return contentType === CometCampaignParser.ContentType || contentType === CometCampaignParser.ContentTypeVideo || contentType === CometCampaignParser.ContentTypeMRAID;
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
