import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { MRAIDAdUnitFactory } from 'MRAID/AdUnits/MRAIDAdUnitFactory';
import { ProgrammaticMraidParser } from 'MRAID/Parsers/ProgrammaticMraidParser';
import { ProgrammaticMraidUrlParser } from 'MRAID/Parsers/ProgrammaticMraidUrlParser';

export class MRAID extends AbstractParserModule {

    constructor() {
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        const adUnitFactory = new MRAIDAdUnitFactory();
        contentTypeHandlerMap[ProgrammaticMraidParser.ContentType] = {
            parser: new ProgrammaticMraidParser(),
            adUnitFactory
        };
        contentTypeHandlerMap[ProgrammaticMraidUrlParser.ContentType] = {
            parser: new ProgrammaticMraidUrlParser(),
            adUnitFactory
        };
        super(contentTypeHandlerMap);
    }

}
