// import ParamsSpec from '../../../../params/params.json';
import ConfigRequestSpec from '../../../../params/configuration.json';
import AdRequestSpec from '../../../../params/adPlan_requests.json';
import VideoEventSpec from '../../../../params/video_start-video_end_requests.json';
import ClickEventSpec from '../../../../params/click_event.json';

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

    private static getEventSpec(rawData: any): IEventSpec {
        let spec: IEventSpec = { };
        let parsedSpec: IEventJson = JSON.parse(rawData);
        let params: IEventParameter[] = parsedSpec.parameters;

        for(let i: number = 0; i < params.length; i++) {
            spec[params[i].parameter] = params[i];
        }

        return spec;
    }
}