import { IParserModule } from '../Ads/Modules/IParserModule';
import { ProgrammaticVastParser } from './Parsers/ProgrammaticVastParser';
import { VastAdUnitFactory } from './AdUnits/VastAdUnitFactory';

export class VAST implements IParserModule {

    private readonly _parser: ProgrammaticVastParser;
    private readonly _adUnitFactory: VastAdUnitFactory;

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
