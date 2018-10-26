import { IParserModule } from 'Ads/Modules/IParserModule';
import { DisplayInterstitialAdUnitFactory } from 'Display/AdUnits/DisplayInterstitialAdUnitFactory';
import { ProgrammaticStaticInterstitialParser } from 'Display/Parsers/ProgrammaticStaticInterstitialParser';

export class Display implements IParserModule {

    private readonly _htmlParser: ProgrammaticStaticInterstitialParser;
    private readonly _jsParser: ProgrammaticStaticInterstitialParser;
    private readonly _adUnitFactory: DisplayInterstitialAdUnitFactory;

    constructor() {
        this._htmlParser = new ProgrammaticStaticInterstitialParser(false);
        this._jsParser = new ProgrammaticStaticInterstitialParser(true);
        this._adUnitFactory = new DisplayInterstitialAdUnitFactory();
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
