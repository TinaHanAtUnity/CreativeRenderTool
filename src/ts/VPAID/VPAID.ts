import { IParserModule } from 'Ads/Modules/IParserModule';
import { VPAIDAdUnitFactory } from 'VPAID/AdUnits/VPAIDAdUnitFactory';
import { ProgrammaticVPAIDParser } from 'VPAID/Parsers/ProgrammaticVPAIDParser';

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
