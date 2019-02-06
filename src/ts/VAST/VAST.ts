import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { VastAdUnitFactory } from 'VAST/AdUnits/VastAdUnitFactory';
import { ProgrammaticVastParser, ProgrammaticVastParserStrict } from 'VAST/Parsers/ProgrammaticVastParser';
import { VastParsingStrictTest } from 'Core/Models/ABGroup';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';
import { VastAdUnitParametersFactory } from 'VAST/AdUnits/VastAdUnitParametersFactory';

export class VAST extends AbstractParserModule {

    constructor(core: ICore, ads: IAds) {
        const paramsFactory = new VastAdUnitParametersFactory(core, ads);
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        let parser: ProgrammaticVastParser;
        // switch parsers based on ABGroup
        if (VastParsingStrictTest.isValid(core.Config.getAbGroup())) {
            parser = new ProgrammaticVastParserStrict(core);
        } else {
            parser = new ProgrammaticVastParser(core);
        }
        contentTypeHandlerMap[ProgrammaticVastParser.ContentType] = {
            parser: parser,
            factory: new VastAdUnitFactory(paramsFactory)
        };
        super(contentTypeHandlerMap);
    }

}
