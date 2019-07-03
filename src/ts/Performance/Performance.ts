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
import { SliderEndCardExperiment } from 'Core/Models/ABGroup';
import { CometCampaignParserWithSliderSupport } from 'Performance/Parsers/CometCampaignParserWithSliderSupport';

export class Performance extends AbstractParserModule {
    constructor(ar: IARApi, core: ICore, ads: IAds, china?: IChina) {
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        let parser;
        if (SliderEndCardExperiment.isValid(core.Config.getAbGroup())) {
            parser = new CometCampaignParserWithSliderSupport(core);
        } else {
            parser = new CometCampaignParser(core);
        }
        contentTypeHandlerMap[CometCampaignParser.ContentType] = {
            parser,
            factory: new PerformanceAdUnitFactory(new PerformanceAdUnitParametersFactory(core, ads, china))
        };
        contentTypeHandlerMap[CometCampaignParser.ContentTypeMRAID] = {
            parser,
            factory: new MRAIDAdUnitFactory(new MRAIDAdUnitParametersFactory(ar, core, ads))
        };
        super(contentTypeHandlerMap);
    }
}
