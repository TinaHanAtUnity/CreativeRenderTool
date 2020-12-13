import AdRequestSpec from 'json/events/AdRequest.json';
import ClickEventSpec from 'json/events/ClickEvent.json';
import ConfigRequestSpec from 'json/events/ConfigRequest.json';
import ParameterSpec from 'json/events/Parameters.json';
import VideoEventSpec from 'json/events/VideoEvents.json';
export class ParamsTestData {
    static getConfigRequestParams() {
        return ParamsTestData.getEventSpec(ConfigRequestSpec);
    }
    static getAdRequestParams() {
        return ParamsTestData.getEventSpec(AdRequestSpec);
    }
    static getVideoEventParams() {
        return ParamsTestData.getEventSpec(VideoEventSpec);
    }
    static getClickEventParams() {
        return ParamsTestData.getEventSpec(ClickEventSpec);
    }
    static getEventSpec(rawData) {
        const spec = {};
        const parsedSpec = rawData;
        const parsedParams = ParameterSpec;
        const params = parsedSpec.parameters;
        const types = {};
        for (const parsedParam of parsedParams) {
            types[parsedParam.key] = parsedParam.type;
        }
        for (const param of params) {
            spec[param.parameter] = {
                parameter: param.parameter,
                required: param.required,
                queryString: param.queryString,
                body: param.body,
                type: types[param.parameter]
            };
        }
        return spec;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyYW1zVGVzdERhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L0Z1bmN0aW9uYWwvUGFyYW1zL1BhcmFtc1Rlc3REYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sYUFBYSxNQUFNLDRCQUE0QixDQUFDO0FBQ3ZELE9BQU8sY0FBYyxNQUFNLDZCQUE2QixDQUFDO0FBQ3pELE9BQU8saUJBQWlCLE1BQU0sZ0NBQWdDLENBQUM7QUFDL0QsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUM7QUFDeEQsT0FBTyxjQUFjLE1BQU0sOEJBQThCLENBQUM7QUFrQzFELE1BQU0sT0FBTyxjQUFjO0lBQ2hCLE1BQU0sQ0FBQyxzQkFBc0I7UUFDaEMsT0FBTyxjQUFjLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVNLE1BQU0sQ0FBQyxrQkFBa0I7UUFDNUIsT0FBTyxjQUFjLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFTSxNQUFNLENBQUMsbUJBQW1CO1FBQzdCLE9BQU8sY0FBYyxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRU0sTUFBTSxDQUFDLG1CQUFtQjtRQUM3QixPQUFPLGNBQWMsQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVPLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBWTtRQUNwQyxNQUFNLElBQUksR0FBZSxFQUFFLENBQUM7UUFDNUIsTUFBTSxVQUFVLEdBQWtCLE9BQU8sQ0FBQztRQUMxQyxNQUFNLFlBQVksR0FBb0IsYUFBYSxDQUFDO1FBQ3BELE1BQU0sTUFBTSxHQUF5QixVQUFVLENBQUMsVUFBVSxDQUFDO1FBQzNELE1BQU0sS0FBSyxHQUEyQixFQUFFLENBQUM7UUFFekMsS0FBSyxNQUFNLFdBQVcsSUFBSSxZQUFZLEVBQUU7WUFDcEMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDO1NBQzdDO1FBRUQsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7WUFDeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRztnQkFDcEIsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTO2dCQUMxQixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7Z0JBQ3hCLFdBQVcsRUFBRSxLQUFLLENBQUMsV0FBVztnQkFDOUIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO2dCQUNoQixJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7YUFDL0IsQ0FBQztTQUNMO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKIn0=