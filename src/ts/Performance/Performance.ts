import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';
import { MRAIDAdUnitFactory } from 'MRAID/AdUnits/MRAIDAdUnitFactory';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';
import { PerformanceAdUnitParametersFactory } from 'Performance/AdUnits/PerformanceAdUnitParametersFactory';
import { MRAIDAdUnitParametersFactory } from 'MRAID/AdUnits/MRAIDAdUnitParametersFactory';
import { IARApi } from 'AR/AR';
import { PerformanceAdUnitWithAutomatedExperimentParametersFactory } from 'Performance/AdUnits/PerformanceAdUnitWithAutomatedExperimentParametersFactory';
import { PerformanceAdUnitWithAutomatedExperimentFactory } from 'Performance/AdUnits/PerformanceAdUnitWithAutomatedExperimentFactory';
import { MabDisabledABTest } from 'Core/Models/ABGroup';

export class Performance extends AbstractParserModule {
    constructor(ar: IARApi, core: ICore, ads: IAds) {
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        const parser = new CometCampaignParser(core);

        let performanceFactory: PerformanceAdUnitFactory;
        if (MabDisabledABTest.isValid(core.Config.getAbGroup())) {
            performanceFactory = new PerformanceAdUnitFactory(new PerformanceAdUnitParametersFactory(core, ads));
        } else {
            performanceFactory = new PerformanceAdUnitWithAutomatedExperimentFactory(
                new PerformanceAdUnitWithAutomatedExperimentParametersFactory(core));
        }

        contentTypeHandlerMap[CometCampaignParser.ContentType] = {
            parser,
            factory: performanceFactory
        };
        contentTypeHandlerMap[CometCampaignParser.ContentTypeMRAID] = {
            parser,
            factory: new MRAIDAdUnitFactory(new MRAIDAdUnitParametersFactory(ar, core, ads))
        };
        super(contentTypeHandlerMap);
    }
}
