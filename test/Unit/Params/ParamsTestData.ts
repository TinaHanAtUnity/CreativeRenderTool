import AdRequestSpec from 'json/events/AdRequest.json';
import ClickEventSpec from 'json/events/ClickEvent.json';
import ConfigRequestSpec from 'json/events/ConfigRequest.json';
import ParameterSpec from 'json/events/Parameters.json';
import RealtimeAdsRequestSpec from 'json/events/RealtimeAdRequest.json';
import VideoEventSpec from 'json/events/VideoEvents.json';

export interface IEventParameter {
    parameter: string;
    required: string;
    queryString: boolean;
    body: boolean;
    type: string;
}

export interface IEventSpec {
    [parameter: string]: IEventParameter;
}

interface IRawEventParameter {
    parameter: string;
    required: string;
    queryString: boolean;
    body: boolean;
}

interface IRawEventJson {
    event: string;
    parameters: IRawEventParameter[];
}

interface IRawParamDesc {
    key: string;
    type: string;
    description: string;
    provider: string;
    platforms: string;
}

export class ParamsTestData {
    public static getConfigRequestParams(): IEventSpec {
        return ParamsTestData.getEventSpec(ConfigRequestSpec);
    }

    public static getAdRequestParams(): IEventSpec {
        return ParamsTestData.getEventSpec(AdRequestSpec);
    }

    public static getVideoEventParams(): IEventSpec {
        return ParamsTestData.getEventSpec(VideoEventSpec);
    }

    public static getClickEventParams(): IEventSpec {
        return ParamsTestData.getEventSpec(ClickEventSpec);
    }

    public static getRealtimeAdRequestParams(): IEventSpec {
        return ParamsTestData.getEventSpec(RealtimeAdsRequestSpec);
    }

    private static getEventSpec(rawData: any): IEventSpec {
        const spec: IEventSpec = {};
        const parsedSpec: IRawEventJson = JSON.parse(rawData);
        const parsedParams: IRawParamDesc[] = JSON.parse(ParameterSpec);
        const params: IRawEventParameter[] = parsedSpec.parameters;
        const types: { [key: string]: any } = {};

        for(const parsedParam of parsedParams) {
            types[parsedParam.key] = parsedParam.type;
        }

        for(const param of params) {
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
