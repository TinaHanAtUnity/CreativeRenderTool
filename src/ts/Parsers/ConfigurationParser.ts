import { IConfiguration, Configuration, CacheMode } from 'Models/Configuration';
import { Placement } from 'Models/Placement';
import { ABGroup } from 'Models/ABGroup';
import { MixedPlacementUtility, MixedPlacementTypes } from 'Utilities/MixedPlacementUtility';
import { ClientInfo } from 'Models/ClientInfo';
import { CustomFeatures } from 'Utilities/CustomFeatures';

export class ConfigurationParser {
    public static parse(configJson: any, clientInfo?: ClientInfo): Configuration {
        const configPlacements = configJson.placements;
        const placements: { [id: string]: Placement } = {};
        let defaultPlacement: Placement | undefined;

        if (configPlacements) {
            configPlacements.forEach((rawPlacement: any): void => {
                const placement: Placement = new Placement(rawPlacement);
                if(clientInfo && CustomFeatures.isMixedPlacementExperiment(clientInfo.getGameId()) && MixedPlacementUtility.isMixedIAP2(placement.getAdTypes())) {
                    MixedPlacementUtility.createMixedPlacements(rawPlacement, placements);
                } else {
                    placements[placement.getId()] = placement;
                }
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
            abGroup: ABGroup.getAbGroup(configJson.abGroup),
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
            optOutEnabled: configJson.optOutEnabled
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
}
