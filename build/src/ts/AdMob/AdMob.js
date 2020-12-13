import { AdMobAdUnitFactory } from 'AdMob/AdUnits/AdMobAdUnitFactory';
import { ProgrammaticAdMobParser } from 'AdMob/Parsers/ProgrammaticAdMobParser';
import { AbstractParserModule } from 'Ads/Modules/AbstractParserModule';
import { AdMobAdUnitParametersFactory } from 'AdMob/AdUnits/AdMobAdUnitParametersFactory';
export class AdMob extends AbstractParserModule {
    constructor(core, ads) {
        const paramsFactory = new AdMobAdUnitParametersFactory(core, ads);
        const contentTypeHandlerMap = {};
        contentTypeHandlerMap[ProgrammaticAdMobParser.ContentType] = {
            parser: new ProgrammaticAdMobParser(core),
            factory: new AdMobAdUnitFactory(paramsFactory)
        };
        super(contentTypeHandlerMap);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRNb2IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdHMvQWRNb2IvQWRNb2IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDdEUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDaEYsT0FBTyxFQUFFLG9CQUFvQixFQUF1QixNQUFNLGtDQUFrQyxDQUFDO0FBRzdGLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBRTFGLE1BQU0sT0FBTyxLQUFNLFNBQVEsb0JBQW9CO0lBRTNDLFlBQVksSUFBVyxFQUFFLEdBQVM7UUFDOUIsTUFBTSxhQUFhLEdBQUcsSUFBSSw0QkFBNEIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbEUsTUFBTSxxQkFBcUIsR0FBMkMsRUFBRSxDQUFDO1FBQ3pFLHFCQUFxQixDQUFDLHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxHQUFHO1lBQ3pELE1BQU0sRUFBRSxJQUFJLHVCQUF1QixDQUFDLElBQUksQ0FBQztZQUN6QyxPQUFPLEVBQUUsSUFBSSxrQkFBa0IsQ0FBQyxhQUFhLENBQUM7U0FDakQsQ0FBQztRQUNGLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7Q0FFSiJ9