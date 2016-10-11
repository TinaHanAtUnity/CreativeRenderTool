// import ParamsSpec from '../../../../params/params.json';
import AdRequestSpec from '../../../../params/adPlan_requests.json';

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
    public static getAdRequestParams(): IEventSpec {
        let spec: IEventSpec = { };
        let parsedSpec: IEventJson = JSON.parse(AdRequestSpec);
        let params: IEventParameter[] = parsedSpec.parameters;

        for(let i: number = 0; i < params.length; i++) {
            spec[params[i].parameter] = params[i];
        }

        return spec;
    }
}