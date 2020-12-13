import { AbstractParserModule } from 'Ads/Modules/AbstractParserModule';
import { VastAdUnitFactory } from 'VAST/AdUnits/VastAdUnitFactory';
import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';
import { VastAdUnitParametersFactory } from 'VAST/AdUnits/VastAdUnitParametersFactory';
export class VAST extends AbstractParserModule {
    constructor(core, ads) {
        const paramsFactory = new VastAdUnitParametersFactory(core, ads);
        const contentTypeHandlerMap = {};
        const parser = new ProgrammaticVastParser(core);
        contentTypeHandlerMap[ProgrammaticVastParser.ContentType] = {
            parser: parser,
            factory: new VastAdUnitFactory(paramsFactory)
        };
        super(contentTypeHandlerMap);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkFTVC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90cy9WQVNUL1ZBU1QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLG9CQUFvQixFQUF1QixNQUFNLGtDQUFrQyxDQUFDO0FBQzdGLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ25FLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRzdFLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBRXZGLE1BQU0sT0FBTyxJQUFLLFNBQVEsb0JBQW9CO0lBRTFDLFlBQVksSUFBVyxFQUFFLEdBQVM7UUFDOUIsTUFBTSxhQUFhLEdBQUcsSUFBSSwyQkFBMkIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakUsTUFBTSxxQkFBcUIsR0FBMkMsRUFBRSxDQUFDO1FBQ3pFLE1BQU0sTUFBTSxHQUFHLElBQUksc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEQscUJBQXFCLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLEdBQUc7WUFDeEQsTUFBTSxFQUFFLE1BQU07WUFDZCxPQUFPLEVBQUUsSUFBSSxpQkFBaUIsQ0FBQyxhQUFhLENBQUM7U0FDaEQsQ0FBQztRQUNGLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7Q0FFSiJ9