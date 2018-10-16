import { IParserModule } from '../Ads/Modules/IParserModule';
import { ProgrammaticVPAIDParser } from './Parsers/ProgrammaticVPAIDParser';
import { VPAIDAdUnitFactory } from './AdUnits/VPAIDAdUnitFactory';

export class VPAID implements IParserModule {

    private readonly _parser: ProgrammaticVPAIDParser;
    private readonly _adUnitFactory: VPAIDAdUnitFactory;

    constructor() {
        this._parser = new ProgrammaticVPAIDParser();
        this._adUnitFactory = new VPAIDAdUnitFactory();
    }

    public canParse(contentType: string) {
        return contentType === ProgrammaticVPAIDParser.ContentType;
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
