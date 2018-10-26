import { IParserModule } from 'Ads/Modules/IParserModule';
import { VastAdUnitFactory } from 'VAST/AdUnits/VastAdUnitFactory';
import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';

export class VAST implements IParserModule {

    private readonly _parser: ProgrammaticVastParser;
    private readonly _adUnitFactory: VastAdUnitFactory;

    constructor() {
        this._parser = new ProgrammaticVastParser();
        this._adUnitFactory = new VastAdUnitFactory();
    }

    public canParse(contentType: string) {
        return contentType === ProgrammaticVastParser.ContentType;
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
