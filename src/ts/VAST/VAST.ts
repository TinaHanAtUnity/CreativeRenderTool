import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { VastAdUnitFactory } from 'VAST/AdUnits/VastAdUnitFactory';
import { ProgrammaticVastParser, ProgrammaticVastParserStrict } from 'VAST/Parsers/ProgrammaticVastParser';
import { ICore } from 'Core/ICore';
import { VastParsingStrictTest } from 'Core/Models/ABGroup';

export class VAST extends AbstractParserModule {

    constructor(core: ICore) {
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        let parser: ProgrammaticVastParser;
        // switch parsers based on ABGroup
        if (VastParsingStrictTest.isValid(core.Config.getAbGroup())) {
            parser = new ProgrammaticVastParserStrict();
        } else {
            parser = new ProgrammaticVastParser();
        }
        contentTypeHandlerMap[ProgrammaticVastParser.ContentType] = {
            parser: parser,
            factory: new VastAdUnitFactory()
        };
        super(contentTypeHandlerMap);
    }

}
