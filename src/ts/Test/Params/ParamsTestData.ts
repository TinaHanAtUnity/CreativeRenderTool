// import ParamsSpec from '../../../../params/params.json';
import AdRequestSpec from '../../../../params/adPlan_requests.json';

export interface EventParameter {
    parameter: string;
    required: string;
    queryString: boolean;
    body: boolean;
}

interface EventJson {
    event: string;
    parameters: EventParameter[];
}

export interface EventSpec {
    [parameter: string]: EventParameter
}

export class ParamsTestData {
    public static getAdRequestParams(): EventSpec {
        let spec: EventSpec = { };
        let parsedSpec: EventJson = JSON.parse(AdRequestSpec);
        let params: EventParameter[] = parsedSpec.parameters;

        for(let i: number = 0; i < params.length; i++) {
            spec[params[i].parameter] = params[i];
        }

        return spec;
    }
}