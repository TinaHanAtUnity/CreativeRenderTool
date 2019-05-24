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
import { CampaignContentType } from 'Ads/Utilities/CampaignContentType';

export class Performance extends AbstractParserModule {
    constructor(ar: IARApi, core: ICore, ads: IAds, china?: IChina) {
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        const parser = new CometCampaignParser(core);
        contentTypeHandlerMap[CampaignContentType.CometVideo] = {
            parser,
            factory: new PerformanceAdUnitFactory(new PerformanceAdUnitParametersFactory(core, ads, china))
        };
        contentTypeHandlerMap[CampaignContentType.CometMRAIDUrl] = {
            parser,
            factory: new MRAIDAdUnitFactory(new MRAIDAdUnitParametersFactory(ar, core, ads))
        };
        super(contentTypeHandlerMap);
    }
}
