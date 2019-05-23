import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { VPAIDAdUnitFactory } from 'VPAID/AdUnits/VPAIDAdUnitFactory';
import { ProgrammaticVPAIDParser } from 'VPAID/Parsers/ProgrammaticVPAIDParser';
import { VPAIDAdUnitParametersFactory } from 'VPAID/AdUnits/VPAIDAdUnitParametersFactory';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';
import { CampaignContentType } from 'Ads/Utilities/CampaignContentType';

export class VPAID extends AbstractParserModule {

    constructor(core: ICore, ads: IAds) {
        const paramFactory = new VPAIDAdUnitParametersFactory(core, ads);
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        contentTypeHandlerMap[CampaignContentType.ProgrammaticVPAID] = {
            parser: new ProgrammaticVPAIDParser(core),
            factory: new VPAIDAdUnitFactory(paramFactory)
        };
        super(contentTypeHandlerMap);
    }

}
