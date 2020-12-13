import { AbstractParserModule } from 'Ads/Modules/AbstractParserModule';
import { XPromoAdUnitFactory } from 'XPromo/AdUnits/XPromoAdUnitFactory';
import { XPromoCampaignParser } from 'XPromo/Parsers/XPromoCampaignParser';
import { XPromoAdUnitParametersFactory } from 'XPromo/AdUnits/XPromoAdUnitParametersFactory';
export class XPromo extends AbstractParserModule {
    constructor(core, ads) {
        const contentTypeHandlerMap = {};
        contentTypeHandlerMap[XPromoCampaignParser.ContentType] = {
            parser: new XPromoCampaignParser(core.NativeBridge.getPlatform()),
            factory: new XPromoAdUnitFactory(new XPromoAdUnitParametersFactory(core, ads))
        };
        super(contentTypeHandlerMap);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWFByb21vLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3RzL1hQcm9tby9YUHJvbW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLG9CQUFvQixFQUF1QixNQUFNLGtDQUFrQyxDQUFDO0FBQzdGLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQzNFLE9BQU8sRUFBRSw2QkFBNkIsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBSTdGLE1BQU0sT0FBTyxNQUFPLFNBQVEsb0JBQW9CO0lBQzVDLFlBQVksSUFBVyxFQUFFLEdBQVM7UUFDOUIsTUFBTSxxQkFBcUIsR0FBMkMsRUFBRSxDQUFDO1FBQ3pFLHFCQUFxQixDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxHQUFHO1lBQ3RELE1BQU0sRUFBRSxJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDakUsT0FBTyxFQUFFLElBQUksbUJBQW1CLENBQUMsSUFBSSw2QkFBNkIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDakYsQ0FBQztRQUNGLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7Q0FFSiJ9