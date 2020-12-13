import { toAbGroup } from 'Core/Models/ABGroup';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
export class CoreConfigurationParser {
    static parse(configJson) {
        const configurationParams = {
            enabled: configJson.enabled,
            country: configJson.country,
            subdivision: configJson.subdivision,
            coppaCompliant: configJson.coppaCompliant,
            abGroup: toAbGroup(configJson.abGroup),
            properties: configJson.properties,
            analytics: configJson.analytics ? true : false,
            test: configJson.test ? true : false,
            projectId: configJson.projectId,
            token: configJson.token,
            jaegerTracing: configJson.jaegerTracing ? true : false,
            organizationId: configJson.organizationId,
            developerId: configJson.developerId,
            featureFlags: configJson.flags ? configJson.flags : []
        };
        const coreConfig = new CoreConfiguration(configurationParams);
        if (coreConfig.getToken()) {
            return coreConfig;
        }
        else {
            throw new Error('gamer token missing in PLC config');
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29yZUNvbmZpZ3VyYXRpb25QYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9QYXJzZXJzL0NvcmVDb25maWd1cmF0aW9uUGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNoRCxPQUFPLEVBQUUsaUJBQWlCLEVBQXNCLE1BQU0sK0JBQStCLENBQUM7QUFtQnRGLE1BQU0sT0FBTyx1QkFBdUI7SUFDekIsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFpQztRQUNqRCxNQUFNLG1CQUFtQixHQUF1QjtZQUM1QyxPQUFPLEVBQUUsVUFBVSxDQUFDLE9BQU87WUFDM0IsT0FBTyxFQUFFLFVBQVUsQ0FBQyxPQUFPO1lBQzNCLFdBQVcsRUFBRSxVQUFVLENBQUMsV0FBVztZQUNuQyxjQUFjLEVBQUUsVUFBVSxDQUFDLGNBQWM7WUFDekMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDO1lBQ3RDLFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVTtZQUNqQyxTQUFTLEVBQUUsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLO1lBQzlDLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUs7WUFDcEMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxTQUFTO1lBQy9CLEtBQUssRUFBRSxVQUFVLENBQUMsS0FBSztZQUN2QixhQUFhLEVBQUUsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLO1lBQ3RELGNBQWMsRUFBRSxVQUFVLENBQUMsY0FBYztZQUN6QyxXQUFXLEVBQUUsVUFBVSxDQUFDLFdBQVc7WUFDbkMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7U0FDekQsQ0FBQztRQUVGLE1BQU0sVUFBVSxHQUFHLElBQUksaUJBQWlCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUM5RCxJQUFJLFVBQVUsQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUN2QixPQUFPLFVBQVUsQ0FBQztTQUNyQjthQUFNO1lBQ0gsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1NBQ3hEO0lBQ0wsQ0FBQztDQUNKIn0=