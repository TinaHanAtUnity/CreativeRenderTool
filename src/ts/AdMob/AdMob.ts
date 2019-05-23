import { AdMobAdUnitFactory } from 'AdMob/AdUnits/AdMobAdUnitFactory';
import { ProgrammaticAdMobParser } from 'AdMob/Parsers/ProgrammaticAdMobParser';
import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';
import { AdMobAdUnitParametersFactory } from 'AdMob/AdUnits/AdMobAdUnitParametersFactory';
import { CampaignContentType } from 'Ads/Utilities/CampaignContentType';

export class AdMob extends AbstractParserModule {

    constructor(core: ICore, ads: IAds) {
        const paramsFactory = new AdMobAdUnitParametersFactory(core, ads);
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        contentTypeHandlerMap[CampaignContentType.ProgrammaticAdmobVideo] = {
            parser: new ProgrammaticAdMobParser(core),
            factory: new AdMobAdUnitFactory(paramsFactory)
        };
        super(contentTypeHandlerMap);
    }

}
