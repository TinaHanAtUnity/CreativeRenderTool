import { Ads, AdsModule } from '../Ads/Ads';
import { IParserModule } from '../Ads/Modules/IParserModule';
import { ProgrammaticAdMobParser } from './Parsers/ProgrammaticAdMobParser';
import { AdMobAdUnitFactory } from './AdUnits/AdMobAdUnitFactory';

export class AdMob extends AdsModule implements IParserModule {

    private readonly _parser: ProgrammaticAdMobParser;
    private readonly _adUnitFactory: AdMobAdUnitFactory;

    constructor(ads: Ads) {
        super(ads);
        this._parser = new ProgrammaticAdMobParser();
        this._adUnitFactory = new AdMobAdUnitFactory();
    }

    public initialize() {
        this._initialized = true;
    }

    public canParse(contentType: string): boolean {
        return contentType === ProgrammaticAdMobParser.ContentType;
    }

    public getParser() {
        return this._parser;
    }

    public getParsers() {
        return [this._parser];
    }

    public getAdUnitFactory() {
        return this._adUnitFactory;
    }

}
