import { IParserModule } from '../Ads/Modules/IParserModule';
import { ProgrammaticMraidParser } from './Parsers/ProgrammaticMraidParser';
import { ProgrammaticMraidUrlParser } from './Parsers/ProgrammaticMraidUrlParser';
import { MRAIDAdUnitFactory } from './AdUnits/MRAIDAdUnitFactory';

export class MRAID implements IParserModule {

    private readonly _parser: ProgrammaticMraidParser;
    private readonly _urlParser: ProgrammaticMraidUrlParser;
    private readonly _adUnitFactory: MRAIDAdUnitFactory;

    constructor() {
        this._parser = new ProgrammaticMraidParser();
        this._urlParser = new ProgrammaticMraidUrlParser();
        this._adUnitFactory = new MRAIDAdUnitFactory();
    }

    public canParse(contentType: string) {
        return contentType === ProgrammaticMraidParser.ContentType || contentType === ProgrammaticMraidUrlParser.ContentType;
    }

    public getParser(contentType: string) {
        switch(contentType) {
            case ProgrammaticMraidParser.ContentType:
                return this._parser;
            case ProgrammaticMraidUrlParser.ContentType:
                return this._urlParser;
            default:
                throw new Error('MRAID module cannot handle content type: ' + contentType);
        }
    }

    public getParsers() {
        return [
            this._parser,
            this._urlParser
        ];
    }

    public getAdUnitFactory() {
        return this._adUnitFactory;
    }

}
