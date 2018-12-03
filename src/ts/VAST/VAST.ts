import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { VastAdUnitFactory } from 'VAST/AdUnits/VastAdUnitFactory';
import { ProgrammaticVastParser, ProgrammaticVastParserStrict } from 'VAST/Parsers/ProgrammaticVastParser';
import { VastParsingStrictTest, ABGroup } from 'Core/Models/ABGroup';

export class VAST extends AbstractParserModule {

    constructor(abGroup: ABGroup) {
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        let parser: ProgrammaticVastParser;
        // switch parsers based on ABGroup
        if (VastParsingStrictTest.isValid(abGroup)) {
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
