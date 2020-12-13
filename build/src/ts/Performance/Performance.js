import { AbstractParserModule } from 'Ads/Modules/AbstractParserModule';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';
import { MRAIDAdUnitFactory } from 'MRAID/AdUnits/MRAIDAdUnitFactory';
import { PerformanceAdUnitParametersFactory } from 'Performance/AdUnits/PerformanceAdUnitParametersFactory';
import { MRAIDAdUnitParametersFactory } from 'MRAID/AdUnits/MRAIDAdUnitParametersFactory';
import { PerformanceAdUnitWithAutomatedExperimentParametersFactory } from 'MabExperimentation/Performance/PerformanceAdUnitWithAutomatedExperimentParametersFactory';
import { PerformanceAdUnitWithAutomatedExperimentFactory } from 'MabExperimentation/Performance/PerformanceAdUnitWithAutomatedExperimentFactory';
import { MabReverseABTest, ExternalMRAIDEndScreenABTest } from 'Core/Models/ABGroup';
export class Performance extends AbstractParserModule {
    constructor(ar, core, aem, ads) {
        const contentTypeHandlerMap = {};
        const parser = new CometCampaignParser(core);
        let performanceFactory;
        const abGroup = core.Config.getAbGroup();
        if (ExternalMRAIDEndScreenABTest.isValid(abGroup)) {
            performanceFactory = new PerformanceAdUnitFactory(new PerformanceAdUnitParametersFactory(core, ads));
        }
        else if (MabReverseABTest.isValid(abGroup)) {
            performanceFactory = new PerformanceAdUnitWithAutomatedExperimentFactory(new PerformanceAdUnitWithAutomatedExperimentParametersFactory(core, aem));
        }
        else {
            performanceFactory = new PerformanceAdUnitFactory(new PerformanceAdUnitParametersFactory(core, ads));
        }
        contentTypeHandlerMap[CometCampaignParser.ContentType] = {
            parser,
            factory: performanceFactory
        };
        contentTypeHandlerMap[CometCampaignParser.ContentTypeMRAID] = {
            parser,
            factory: new MRAIDAdUnitFactory(new MRAIDAdUnitParametersFactory(ar, core, ads, aem))
        };
        super(contentTypeHandlerMap);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyZm9ybWFuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdHMvUGVyZm9ybWFuY2UvUGVyZm9ybWFuY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLG9CQUFvQixFQUF1QixNQUFNLGtDQUFrQyxDQUFDO0FBQzdGLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzlFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBR3RFLE9BQU8sRUFBRSxrQ0FBa0MsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBQzVHLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBRTFGLE9BQU8sRUFBRSx5REFBeUQsRUFBRSxNQUFNLDBGQUEwRixDQUFDO0FBQ3JLLE9BQU8sRUFBRSwrQ0FBK0MsRUFBRSxNQUFNLGdGQUFnRixDQUFDO0FBRWpKLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSw0QkFBNEIsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRXJGLE1BQU0sT0FBTyxXQUFZLFNBQVEsb0JBQW9CO0lBQ2pELFlBQVksRUFBVSxFQUFFLElBQVcsRUFBRSxHQUErQixFQUFFLEdBQVM7UUFDM0UsTUFBTSxxQkFBcUIsR0FBMkMsRUFBRSxDQUFDO1FBQ3pFLE1BQU0sTUFBTSxHQUFHLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFN0MsSUFBSSxrQkFBNEMsQ0FBQztRQUNqRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3pDLElBQUksNEJBQTRCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQy9DLGtCQUFrQixHQUFHLElBQUksd0JBQXdCLENBQUMsSUFBSSxrQ0FBa0MsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUN4RzthQUFNLElBQUksZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzFDLGtCQUFrQixHQUFHLElBQUksK0NBQStDLENBQ3BFLElBQUkseURBQXlELENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDakY7YUFBTTtZQUNILGtCQUFrQixHQUFHLElBQUksd0JBQXdCLENBQUMsSUFBSSxrQ0FBa0MsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUN4RztRQUVELHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxHQUFHO1lBQ3JELE1BQU07WUFDTixPQUFPLEVBQUUsa0JBQWtCO1NBQzlCLENBQUM7UUFDRixxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHO1lBQzFELE1BQU07WUFDTixPQUFPLEVBQUUsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLDRCQUE0QixDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3hGLENBQUM7UUFDRixLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUNqQyxDQUFDO0NBQ0oifQ==