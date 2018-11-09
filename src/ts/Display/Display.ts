import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { DisplayInterstitialAdUnitFactory } from 'Display/AdUnits/DisplayInterstitialAdUnitFactory';
import { ProgrammaticStaticInterstitialParser } from 'Display/Parsers/ProgrammaticStaticInterstitialParser';

export class Display extends AbstractParserModule {

    constructor() {
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        const adUnitFactory = new DisplayInterstitialAdUnitFactory();
        contentTypeHandlerMap[ProgrammaticStaticInterstitialParser.ContentTypeHtml] = {
            parser: new ProgrammaticStaticInterstitialParser(false),
            adUnitFactory
        };
        contentTypeHandlerMap[ProgrammaticStaticInterstitialParser.ContentTypeJs] = {
            parser: new ProgrammaticStaticInterstitialParser(true),
            adUnitFactory
        };
        super(contentTypeHandlerMap);
    }

}
