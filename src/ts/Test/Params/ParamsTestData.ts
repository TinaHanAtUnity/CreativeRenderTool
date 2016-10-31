import ConfigRequestSpec from 'json/events/ConfigRequest.json';
import AdRequestSpec from 'json/events/AdRequest.json';
import VideoEventSpec from 'json/events/VideoEvents.json';
import ClickEventSpec from 'json/events/ClickEvent.json';
import SkipEventSpec from 'json/events/SkipEvent.json';

export interface IEventParameter {
    parameter: string;
    required: string;
    queryString: boolean;
    body: boolean;
}

interface IEventJson {
    event: string;
    parameters: IEventParameter[];
}

export interface IEventSpec {
    [parameter: string]: IEventParameter;
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

    public static getSkipEventParams(): IEventSpec {
        return ParamsTestData.getEventSpec(SkipEventSpec);
    }

    private static getEventSpec(rawData: any): IEventSpec {
        const spec: IEventSpec = { };
        const parsedSpec: IEventJson = JSON.parse(rawData);
        const params: IEventParameter[] = parsedSpec.parameters;

        for(let i: number = 0; i < params.length; i++) {
            spec[params[i].parameter] = params[i];
        }

        return spec;
    }
}