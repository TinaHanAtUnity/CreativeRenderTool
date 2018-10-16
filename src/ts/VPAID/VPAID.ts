import { Ads, AdsModule } from '../Ads/Ads';
import { IParserModule } from '../Ads/Modules/IParserModule';
import { ProgrammaticVPAIDParser } from './Parsers/ProgrammaticVPAIDParser';
import { VPAIDAdUnitFactory } from './AdUnits/VPAIDAdUnitFactory';

export class VPAID extends AdsModule implements IParserModule {

    private readonly _parser: ProgrammaticVPAIDParser;
    private readonly _adUnitFactory: VPAIDAdUnitFactory;

    constructor(ads: Ads) {
        super(ads);
        this._parser = new ProgrammaticVPAIDParser();
        this._adUnitFactory = new VPAIDAdUnitFactory();
    }

    public initialize() {
        this._initialized = true;
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
