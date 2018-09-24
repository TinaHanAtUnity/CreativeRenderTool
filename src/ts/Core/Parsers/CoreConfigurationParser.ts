import { ABGroupBuilder } from 'Core/Models/ABGroup';
import { CoreConfiguration, ICoreConfiguration } from 'Core/Models/CoreConfiguration';

export class CoreConfigurationParser {
    public static parse(configJson: any): CoreConfiguration {
        const configurationParams: ICoreConfiguration = {
            enabled: configJson.enabled,
            country: configJson.country,
            coppaCompliant: configJson.coppaCompliant,
            abGroup: ABGroupBuilder.getAbGroup(configJson.abGroup),
            properties: configJson.properties,
            analytics: configJson.analytics ? true : false,
            test: configJson.test ? true : false,
            projectId: configJson.projectId,
            token: configJson.token,
            jaegerTracing: configJson.jaegerTracing ? true : false,
            organizationId: configJson.organizationId
        };

        const coreConfig = new CoreConfiguration(configurationParams);
        if(coreConfig.getToken()) {
            return coreConfig;
        } else {
            throw new Error('gamer token missing in PLC config');
        }
    }
}
