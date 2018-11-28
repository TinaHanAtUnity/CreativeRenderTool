import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { VPAIDAdUnitFactory } from 'VPAID/AdUnits/VPAIDAdUnitFactory';
import { ProgrammaticVPAIDParser } from 'VPAID/Parsers/ProgrammaticVPAIDParser';

export class VPAID extends AbstractParserModule {

    constructor() {
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        contentTypeHandlerMap[ProgrammaticVPAIDParser.ContentType] = {
            parser: new ProgrammaticVPAIDParser(),
            factory: new VPAIDAdUnitFactory()
        };
        super(contentTypeHandlerMap);
    }

}
