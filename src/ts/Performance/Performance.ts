import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';
import { MRAIDAdUnitFactory } from 'MRAID/AdUnits/MRAIDAdUnitFactory';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';
import { PerformanceAdUnitParametersFactory } from 'Performance/AdUnits/PerformanceAdUnitParametersFactory';
import { MRAIDAdUnitParametersFactory } from 'MRAID/AdUnits/MRAIDAdUnitParametersFactory';
import { IARApi } from 'AR/AR';
import { IChina } from 'China/IChina';
import { PerformanceAdUnitWithAutomatedExperimentParametersFactory } from 'Performance/AdUnits/PerformanceAdUnitWithAutomatedExperimentParametersFactory';
import { MabDecisionButtonTest } from 'Core/Models/ABGroup';
import { PerformanceAdUnitWithAutomatedExperimentFactory } from 'Performance/AdUnits/PerformanceAdUnitWithAutomatedExperimentFactory';

export class Performance extends AbstractParserModule {
    constructor(ar: IARApi, core: ICore, ads: IAds, china?: IChina) {
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        const parser = new CometCampaignParser(core);

        let performanceFactory: PerformanceAdUnitFactory;
        if (MabDecisionButtonTest.isValid(core.Config.getAbGroup())) {
            performanceFactory = new PerformanceAdUnitWithAutomatedExperimentFactory(
                new PerformanceAdUnitWithAutomatedExperimentParametersFactory(core, china));
        } else {
            performanceFactory = new PerformanceAdUnitFactory(new PerformanceAdUnitParametersFactory(core, ads, china));
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
