import { IConfiguration, Configuration, CacheMode } from 'Models/Configuration';
import { Placement } from 'Models/Placement';
import { AdUnitStyle } from 'Models/AdUnitStyle';
import { Diagnostics } from 'Utilities/Diagnostics';

export class ConfigurationParser {
    public static parse(configJson: any): Configuration {
        const configPlacements = configJson.placements;
        const placements: { [id: string]: Placement } = {};
        let defaultPlacement: Placement | undefined;

        if (configPlacements) {
            configPlacements.forEach((rawPlacement: any): void => {
                const placement: Placement = new Placement(rawPlacement);
                placements[placement.getId()] = placement;
                if (placement.isDefault()) {
                    defaultPlacement = placement;
                }
            });
        } else {
            throw Error('No placements in configuration response');
        }

        if (!defaultPlacement) {
            throw Error('No default placement in configuration response');
        }

        const configurationParams: IConfiguration = {
            enabled: configJson.enabled,
            country: configJson.country,
            coppaCompliant: configJson.coppaCompliant,
            abGroup: configJson.abGroup,
            gamerId: configJson.gamerId,
            properties: configJson.properties,
            cacheMode: this.parseCacheMode(configJson),
            placements: placements,
            defaultPlacement: defaultPlacement,
            analytics: configJson.analytics ? true : false,
            test: configJson.test ? true : false,
            projectId: configJson.projectId,
            token: configJson.token,
            jaegerTracing: configJson.jaegerTracing ? true : false,
            organizationId: configJson.organizationId,
            gdprEnabled: configJson.gdprEnabled,
            optOutRecorded: configJson.optOutRecorded,
            optOutEnabled: configJson.optOutEnabled,
            adUnitStyle: this.parseAdUnitStyle(configJson.adUnitStyle)
        };
        return new Configuration(configurationParams);
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

    private static parseAdUnitStyle(adUnitStyleJson: any): AdUnitStyle | undefined {
        let adUnitStyle: AdUnitStyle | undefined;
        try {
            if (!adUnitStyleJson) {
                throw new Error('No adUnitStyle was provided in configuration');
            }
            adUnitStyle = new AdUnitStyle(adUnitStyleJson);
        } catch(error) {
            Diagnostics.trigger('configuration_ad_unit_style_parse_error', {
                response: adUnitStyleJson,
                error: error
            });
        }
        return adUnitStyle;
    }
}
