import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { XPromoAdUnitFactory } from 'XPromo/AdUnits/XPromoAdUnitFactory';
import { XPromoCampaignParser } from 'XPromo/Parsers/XPromoCampaignParser';

export class XPromo extends AbstractParserModule {

    constructor() {
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        contentTypeHandlerMap[XPromoCampaignParser.ContentType] = {
            parser: new XPromoCampaignParser(),
            factory: new XPromoAdUnitFactory()
        };
        super(contentTypeHandlerMap);
    }

}
