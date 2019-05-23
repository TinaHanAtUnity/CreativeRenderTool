import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { VastAdUnitFactory } from 'VAST/AdUnits/VastAdUnitFactory';
import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';
import { VastAdUnitParametersFactory } from 'VAST/AdUnits/VastAdUnitParametersFactory';
import { CampaignContentType } from 'Ads/Utilities/CampaignContentType';

export class VAST extends AbstractParserModule {

    constructor(core: ICore, ads: IAds) {
        const paramsFactory = new VastAdUnitParametersFactory(core, ads);
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        const parser = new ProgrammaticVastParser(core);
        contentTypeHandlerMap[CampaignContentType.ProgrammaticVAST] = {
            parser: parser,
            factory: new VastAdUnitFactory(paramsFactory)
        };
        super(contentTypeHandlerMap);
    }

}
