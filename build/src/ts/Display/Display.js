import { AbstractParserModule } from 'Ads/Modules/AbstractParserModule';
import { DisplayInterstitialAdUnitFactory } from 'Display/AdUnits/DisplayInterstitialAdUnitFactory';
import { ProgrammaticStaticInterstitialParser } from 'Display/Parsers/ProgrammaticStaticInterstitialParser';
import { DisplayInterstitialAdUnitParametersFactory } from 'Display/AdUnits/DisplayInterstitialAdUnitParametersFactory';
export class Display extends AbstractParserModule {
    constructor(core, ads) {
        const contentTypeHandlerMap = {};
        const factory = new DisplayInterstitialAdUnitFactory(new DisplayInterstitialAdUnitParametersFactory(core, ads));
        contentTypeHandlerMap[ProgrammaticStaticInterstitialParser.ContentTypeHtml] = {
            parser: new ProgrammaticStaticInterstitialParser(core.NativeBridge.getPlatform()),
            factory
        };
        contentTypeHandlerMap[ProgrammaticStaticInterstitialParser.ContentTypeJs] = {
            parser: new ProgrammaticStaticInterstitialParser(core.NativeBridge.getPlatform()),
            factory
        };
        super(contentTypeHandlerMap);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzcGxheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90cy9EaXNwbGF5L0Rpc3BsYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLG9CQUFvQixFQUF1QixNQUFNLGtDQUFrQyxDQUFDO0FBQzdGLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ3BHLE9BQU8sRUFBRSxvQ0FBb0MsRUFBRSxNQUFNLHNEQUFzRCxDQUFDO0FBQzVHLE9BQU8sRUFBRSwwQ0FBMEMsRUFBRSxNQUFNLDREQUE0RCxDQUFDO0FBSXhILE1BQU0sT0FBTyxPQUFRLFNBQVEsb0JBQW9CO0lBRTdDLFlBQVksSUFBVyxFQUFFLEdBQVM7UUFDOUIsTUFBTSxxQkFBcUIsR0FBMkMsRUFBRSxDQUFDO1FBQ3pFLE1BQU0sT0FBTyxHQUFHLElBQUksZ0NBQWdDLENBQUMsSUFBSSwwQ0FBMEMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNoSCxxQkFBcUIsQ0FBQyxvQ0FBb0MsQ0FBQyxlQUFlLENBQUMsR0FBRztZQUMxRSxNQUFNLEVBQUUsSUFBSSxvQ0FBb0MsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2pGLE9BQU87U0FDVixDQUFDO1FBQ0YscUJBQXFCLENBQUMsb0NBQW9DLENBQUMsYUFBYSxDQUFDLEdBQUc7WUFDeEUsTUFBTSxFQUFFLElBQUksb0NBQW9DLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNqRixPQUFPO1NBQ1YsQ0FBQztRQUNGLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7Q0FFSiJ9