import { AbstractParserModule } from 'Ads/Modules/AbstractParserModule';
import { VPAIDAdUnitFactory } from 'VPAID/AdUnits/VPAIDAdUnitFactory';
import { ProgrammaticVPAIDParser } from 'VPAID/Parsers/ProgrammaticVPAIDParser';
import { VPAIDAdUnitParametersFactory } from 'VPAID/AdUnits/VPAIDAdUnitParametersFactory';
export class VPAID extends AbstractParserModule {
    constructor(core, ads) {
        const paramFactory = new VPAIDAdUnitParametersFactory(core, ads);
        const contentTypeHandlerMap = {};
        contentTypeHandlerMap[ProgrammaticVPAIDParser.ContentType] = {
            parser: new ProgrammaticVPAIDParser(core),
            factory: new VPAIDAdUnitFactory(paramFactory)
        };
        super(contentTypeHandlerMap);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBBSUQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdHMvVlBBSUQvVlBBSUQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLG9CQUFvQixFQUF1QixNQUFNLGtDQUFrQyxDQUFDO0FBQzdGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ3RFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQ2hGLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBSTFGLE1BQU0sT0FBTyxLQUFNLFNBQVEsb0JBQW9CO0lBRTNDLFlBQVksSUFBVyxFQUFFLEdBQVM7UUFDOUIsTUFBTSxZQUFZLEdBQUcsSUFBSSw0QkFBNEIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakUsTUFBTSxxQkFBcUIsR0FBMkMsRUFBRSxDQUFDO1FBQ3pFLHFCQUFxQixDQUFDLHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxHQUFHO1lBQ3pELE1BQU0sRUFBRSxJQUFJLHVCQUF1QixDQUFDLElBQUksQ0FBQztZQUN6QyxPQUFPLEVBQUUsSUFBSSxrQkFBa0IsQ0FBQyxZQUFZLENBQUM7U0FDaEQsQ0FBQztRQUNGLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7Q0FFSiJ9