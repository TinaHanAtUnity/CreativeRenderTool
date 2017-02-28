import ConfigRequestSpec from 'json/events/ConfigRequest.json';
import AdRequestSpec from 'json/events/AdRequest.json';
import VideoEventSpec from 'json/events/VideoEvents.json';
import ClickEventSpec from 'json/events/ClickEvent.json';
import ParameterSpec from 'json/events/Parameters.json';

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
    key: string,
    type: string,
    description: string,
    provider: string,
    platforms: string
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

    private static getEventSpec(rawData: any): IEventSpec {
        const spec: IEventSpec = {};
        const parsedSpec: IRawEventJson = JSON.parse(rawData);
        const parsedParams: IRawParamDesc[] = JSON.parse(ParameterSpec);
        const params: IRawEventParameter[] = parsedSpec.parameters;
        const types = {};

        for(let i: number = 0; i < parsedParams.length; i++) {
            types[parsedParams[i].key] = parsedParams[i].type;
        }

        for(let i: number = 0; i < params.length; i++) {
            spec[params[i].parameter] = {
                parameter: params[i].parameter,
                required: params[i].required,
                queryString: params[i].queryString,
                body: params[i].body,
                type: types[params[i].parameter]
            };
        }

        return spec;
    }
}
