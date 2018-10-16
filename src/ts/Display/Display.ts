import { Ads, AdsModule } from '../Ads/Ads';
import { IParserModule } from '../Ads/Modules/IParserModule';
import { ProgrammaticStaticInterstitialParser } from './Parsers/ProgrammaticStaticInterstitialParser';
import { DisplayInterstitialAdUnitFactory } from './AdUnits/DisplayInterstitialAdUnitFactory';

export class Display extends AdsModule implements IParserModule {

    private readonly _htmlParser: ProgrammaticStaticInterstitialParser;
    private readonly _jsParser: ProgrammaticStaticInterstitialParser;
    private readonly _adUnitFactory: DisplayInterstitialAdUnitFactory;

    constructor(ads: Ads) {
        super(ads);
        this._htmlParser = new ProgrammaticStaticInterstitialParser(false);
        this._jsParser = new ProgrammaticStaticInterstitialParser(true);
        this._adUnitFactory = new DisplayInterstitialAdUnitFactory();
    }

    public initialize() {
        this._initialized = true;
    }

    public canParse(contentType: string): boolean {
        return contentType === ProgrammaticStaticInterstitialParser.ContentTypeHtml || contentType === ProgrammaticStaticInterstitialParser.ContentTypeJs;
    }

    public getParser(contentType: string) {
        switch(contentType) {
            case ProgrammaticStaticInterstitialParser.ContentTypeHtml:
                return this._htmlParser;
            case ProgrammaticStaticInterstitialParser.ContentTypeJs:
                return this._jsParser;
            default:
                throw new Error('Display module cannot handle content type: ' + contentType);
        }
    }

    public getParsers() {
        return [
            this._htmlParser,
            this._jsParser
        ];
    }

    public getAdUnitFactory() {
        return this._adUnitFactory;
    }

}
