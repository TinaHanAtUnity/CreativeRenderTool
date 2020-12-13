import { AbstractParserModule } from 'Ads/Modules/AbstractParserModule';
import { MRAIDAdUnitFactory } from 'MRAID/AdUnits/MRAIDAdUnitFactory';
import { ProgrammaticMraidParser } from 'MRAID/Parsers/ProgrammaticMraidParser';
import { ProgrammaticMraidUrlParser } from 'MRAID/Parsers/ProgrammaticMraidUrlParser';
import { MRAIDAdUnitParametersFactory } from 'MRAID/AdUnits/MRAIDAdUnitParametersFactory';
export class MRAID extends AbstractParserModule {
    constructor(ar, core, aem, ads) {
        const paramsFactory = new MRAIDAdUnitParametersFactory(ar, core, ads, aem);
        const contentTypeHandlerMap = {};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSUQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdHMvTVJBSUQvTVJBSUQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLG9CQUFvQixFQUF1QixNQUFNLGtDQUFrQyxDQUFDO0FBQzdGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ3RFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQ2hGLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBQ3RGLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBTTFGLE1BQU0sT0FBTyxLQUFNLFNBQVEsb0JBQW9CO0lBRTNDLFlBQVksRUFBVSxFQUFFLElBQVcsRUFBRSxHQUErQixFQUFFLEdBQVM7UUFDM0UsTUFBTSxhQUFhLEdBQUcsSUFBSSw0QkFBNEIsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMzRSxNQUFNLHFCQUFxQixHQUEyQyxFQUFFLENBQUM7UUFDekUsTUFBTSxPQUFPLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN0RCxxQkFBcUIsQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsR0FBRztZQUN6RCxNQUFNLEVBQUUsSUFBSSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3BFLE9BQU87U0FDVixDQUFDO1FBQ0YscUJBQXFCLENBQUMsMEJBQTBCLENBQUMsV0FBVyxDQUFDLEdBQUc7WUFDNUQsTUFBTSxFQUFFLElBQUksMEJBQTBCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2RSxPQUFPO1NBQ1YsQ0FBQztRQUNGLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7Q0FFSiJ9