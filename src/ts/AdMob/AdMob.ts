import { AdMobAdUnitFactory } from 'AdMob/AdUnits/AdMobAdUnitFactory';
import { ProgrammaticAdMobParser } from 'AdMob/Parsers/ProgrammaticAdMobParser';
import { IParserModule } from 'Ads/Modules/IParserModule';

export class AdMob implements IParserModule {

    private readonly _parser: ProgrammaticAdMobParser;
    private readonly _adUnitFactory: AdMobAdUnitFactory;

    constructor() {
        this._parser = new ProgrammaticAdMobParser();
        this._adUnitFactory = new AdMobAdUnitFactory();
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
