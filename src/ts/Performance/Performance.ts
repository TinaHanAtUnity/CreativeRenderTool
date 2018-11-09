import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';
import { MRAIDAdUnitFactory } from 'MRAID/AdUnits/MRAIDAdUnitFactory';

export class Performance extends AbstractParserModule {

    constructor() {
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        const parser = new CometCampaignParser();
        contentTypeHandlerMap[CometCampaignParser.ContentType] = {
            parser,
            adUnitFactory: new PerformanceAdUnitFactory()
        };
        contentTypeHandlerMap[CometCampaignParser.ContentTypeMRAID] = {
            parser,
            adUnitFactory: new MRAIDAdUnitFactory()
        };
        super(contentTypeHandlerMap);
    }

}
