import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { DisplayInterstitialAdUnitFactory } from 'Display/AdUnits/DisplayInterstitialAdUnitFactory';
import { ProgrammaticStaticInterstitialParser } from 'Display/Parsers/ProgrammaticStaticInterstitialParser';

export class Display extends AbstractParserModule {

    constructor() {
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        const factory = new DisplayInterstitialAdUnitFactory();
        contentTypeHandlerMap[ProgrammaticStaticInterstitialParser.ContentTypeHtml] = {
            parser: new ProgrammaticStaticInterstitialParser(false),
            factory
        };
        contentTypeHandlerMap[ProgrammaticStaticInterstitialParser.ContentTypeJs] = {
            parser: new ProgrammaticStaticInterstitialParser(true),
            factory
        };
        super(contentTypeHandlerMap);
    }

}
