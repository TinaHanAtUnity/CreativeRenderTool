import { ABGroupBuilder } from 'Core/Models/ABGroup';
import { CacheMode, CoreConfiguration, ICoreConfiguration } from 'Core/Models/CoreConfiguration';

export class CoreConfigurationParser {
    public static parse(configJson: any): CoreConfiguration {
        const configurationParams: ICoreConfiguration = {
            enabled: configJson.enabled,
            country: configJson.country,
            coppaCompliant: configJson.coppaCompliant,
            abGroup: ABGroupBuilder.getAbGroup(configJson.abGroup),
            properties: configJson.properties,
            cacheMode: this.parseCacheMode(configJson),
            analytics: !!configJson.analytics,
            test: !!configJson.test,
            projectId: configJson.projectId,
            token: configJson.token,
            jaegerTracing: !!configJson.jaegerTracing,
            organizationId: configJson.organizationId
        };
        return new CoreConfiguration(configurationParams, 'CoreConfiguration', CoreConfiguration.Schema);
    }

    private static parseCacheMode(configJson: any): CacheMode {
        switch(configJson.assetCaching) {
            case 'forced':
                return CacheMode.FORCED;
            case 'allowed':
                return CacheMode.ALLOWED;
            case 'disabled':
                return CacheMode.DISABLED;
            case 'adaptive':
                return CacheMode.ADAPTIVE;
            default:
                throw new Error('Unknown assetCaching value "' + configJson.assetCaching + '"');
        }
    }
}
