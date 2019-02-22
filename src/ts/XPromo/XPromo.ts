import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { XPromoAdUnitFactory } from 'XPromo/AdUnits/XPromoAdUnitFactory';
import { XPromoCampaignParser } from 'XPromo/Parsers/XPromoCampaignParser';
import { XPromoAdUnitParametersFactory } from 'XPromo/AdUnits/XPromoAdUnitParametersFactory';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';

export class XPromo extends AbstractParserModule {
    constructor(core: ICore, ads: IAds) {
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        contentTypeHandlerMap[XPromoCampaignParser.ContentType] = {
            parser: new XPromoCampaignParser(core.NativeBridge.getPlatform()),
            factory: new XPromoAdUnitFactory(new XPromoAdUnitParametersFactory(core, ads))
        };
        super(contentTypeHandlerMap);
    }

}
