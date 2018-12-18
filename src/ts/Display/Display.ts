import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { DisplayInterstitialAdUnitFactory } from 'Display/AdUnits/DisplayInterstitialAdUnitFactory';
import { ProgrammaticStaticInterstitialParser } from 'Display/Parsers/ProgrammaticStaticInterstitialParser';
import { DisplayInterstitialAdUnitParametersFactory } from 'Display/AdUnits/DisplayInterstitialAdUnitParametersFactory';
import { IAds } from 'Ads/IAds';
import { ICore } from 'Core/ICore';

export class Display extends AbstractParserModule {

    constructor(core: ICore, ads: IAds) {
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        const factory = new DisplayInterstitialAdUnitFactory(new DisplayInterstitialAdUnitParametersFactory(core, ads));
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
