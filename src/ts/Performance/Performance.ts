import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';
import { MRAIDAdUnitFactory } from 'MRAID/AdUnits/MRAIDAdUnitFactory';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';
import { PerformanceAdUnitParametersFactory } from 'Performance/AdUnits/PerformanceAdUnitParametersFactory';
import { MRAIDAdUnitParametersFactory } from 'MRAID/AdUnits/MRAIDAdUnitParametersFactory';
import { IARApi } from 'AR/AR';
import { PerformanceAdUnitWithAutomatedExperimentParametersFactory } from 'MabExperimentation/Performance/PerformanceAdUnitWithAutomatedExperimentParametersFactory';
import { PerformanceAdUnitWithAutomatedExperimentFactory } from 'MabExperimentation/Performance/PerformanceAdUnitWithAutomatedExperimentFactory';
import { AutomatedExperimentManager } from 'MabExperimentation/AutomatedExperimentManager';
import { MabReverseABTest, ExternalMRAIDEndScreenABTest } from 'Core/Models/ABGroup';

export class Performance extends AbstractParserModule {
    constructor(ar: IARApi, core: ICore, aem: AutomatedExperimentManager, ads: IAds) {
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        const parser = new CometCampaignParser(core);

        let performanceFactory: PerformanceAdUnitFactory;
        const abGroup = core.Config.getAbGroup();
        if (ExternalMRAIDEndScreenABTest.isValid(abGroup)) {
            performanceFactory = new PerformanceAdUnitFactory(new PerformanceAdUnitParametersFactory(core, ads));
        } else if (MabReverseABTest.isValid(abGroup)) {
            performanceFactory = new PerformanceAdUnitWithAutomatedExperimentFactory(
                new PerformanceAdUnitWithAutomatedExperimentParametersFactory(core, aem));
        } else {
            performanceFactory = new PerformanceAdUnitFactory(new PerformanceAdUnitParametersFactory(core, ads));
        }

        contentTypeHandlerMap[CometCampaignParser.ContentType] = {
            parser,
            factory: performanceFactory
        };
        contentTypeHandlerMap[CometCampaignParser.ContentTypeMRAID] = {
            parser,
            factory: new MRAIDAdUnitFactory(new MRAIDAdUnitParametersFactory(ar, core, ads, aem))
        };
        super(contentTypeHandlerMap);
    }
}
