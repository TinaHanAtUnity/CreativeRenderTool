import { toAbGroup } from 'Core/Models/ABGroup';
import { CoreConfiguration, ICoreConfiguration } from 'Core/Models/CoreConfiguration';

export interface IRawCoreConfiguration {
    enabled: boolean;
    country: string;
    subdivision: string;
    coppaCompliant: boolean;
    abGroup: number;
    properties: string;
    analytics?: boolean;
    test?: boolean;
    projectId: string;
    token: string;
    jaegerTracing?: boolean;
    organizationId: string;
    developerId: number;
}

export class CoreConfigurationParser {
    public static parse(configJson: IRawCoreConfiguration): CoreConfiguration {
        const configurationParams: ICoreConfiguration = {
            enabled: configJson.enabled,
            country: configJson.country,
            subdivision: configJson.subdivision || '',
            coppaCompliant: configJson.coppaCompliant,
            abGroup: toAbGroup(configJson.abGroup),
            properties: configJson.properties,
            analytics: configJson.analytics ? true : false,
            test: configJson.test ? true : false,
            projectId: configJson.projectId,
            token: configJson.token,
            jaegerTracing: configJson.jaegerTracing ? true : false,
            organizationId: configJson.organizationId,
            developerId: configJson.developerId
        };

        const coreConfig = new CoreConfiguration(configurationParams);
        if (coreConfig.getToken()) {
            return coreConfig;
        } else {
            throw new Error('gamer token missing in PLC config');
        }
    }
}
