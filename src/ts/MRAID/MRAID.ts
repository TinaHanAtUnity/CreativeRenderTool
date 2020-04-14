import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { MRAIDAdUnitFactory } from 'MRAID/AdUnits/MRAIDAdUnitFactory';
import { ProgrammaticMraidParser } from 'MRAID/Parsers/ProgrammaticMraidParser';
import { ProgrammaticMraidUrlParser } from 'MRAID/Parsers/ProgrammaticMraidUrlParser';
import { MRAIDAdUnitParametersFactory } from 'MRAID/AdUnits/MRAIDAdUnitParametersFactory';
import { IARApi } from 'AR/AR';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';
import { AutomatedExperimentManager } from 'MABOptimization/AutomatedExperimentManager';

export class MRAID extends AbstractParserModule {

    constructor(ar: IARApi, core: ICore, aem: AutomatedExperimentManager, ads: IAds) {
        const paramsFactory = new MRAIDAdUnitParametersFactory(ar, core, ads, aem);
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        const factory = new MRAIDAdUnitFactory(paramsFactory);
        contentTypeHandlerMap[ProgrammaticMraidParser.ContentType] = {
            parser: new ProgrammaticMraidParser(core.NativeBridge.getPlatform()),
            factory
        };
        contentTypeHandlerMap[ProgrammaticMraidUrlParser.ContentType] = {
            parser: new ProgrammaticMraidUrlParser(core.NativeBridge.getPlatform()),
            factory
        };
        super(contentTypeHandlerMap);
    }

}
