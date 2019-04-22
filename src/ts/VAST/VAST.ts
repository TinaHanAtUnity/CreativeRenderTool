import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { VastAdUnitFactory } from 'VAST/AdUnits/VastAdUnitFactory';
import { ProgrammaticVastParserStrict } from 'VAST/Parsers/ProgrammaticVastParser';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';
import { VastAdUnitParametersFactory } from 'VAST/AdUnits/VastAdUnitParametersFactory';

export class VAST extends AbstractParserModule {

    constructor(core: ICore, ads: IAds) {
        const paramsFactory = new VastAdUnitParametersFactory(core, ads);
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        const parser = new ProgrammaticVastParserStrict(core);
        contentTypeHandlerMap[ProgrammaticVastParserStrict.ContentType] = {
            parser: parser,
            factory: new VastAdUnitFactory(paramsFactory)
        };
        super(contentTypeHandlerMap);
    }

}
