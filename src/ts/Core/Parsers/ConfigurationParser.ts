import { CacheMode, Configuration, IConfiguration } from 'Core/Models/Configuration';
import { Placement } from 'Ads/Models/Placement';
import { ABGroupBuilder } from 'Core/Models/ABGroup';
import { MixedPlacementUtility } from 'Ads/Utilities/MixedPlacementUtility';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';

export class ConfigurationParser {
    public static parse(configJson: any, clientInfo?: ClientInfo): Configuration {
        const configPlacements = configJson.placements;
        const placements: { [id: string]: Placement } = {};
        let defaultPlacement: Placement | undefined;
        let defaultBannerPlacement: Placement | undefined;

        if (configPlacements) {
            configPlacements.forEach((rawPlacement: any): void => {
                const placement: Placement = new Placement(rawPlacement);
                if(clientInfo && CustomFeatures.isMixedPlacementExperiment(clientInfo.getGameId())) {
                    MixedPlacementUtility.originalPlacements[placement.getId()] = placement;
                    if (MixedPlacementUtility.isMixedPlacement(placement)) {
                        MixedPlacementUtility.createMixedPlacements(rawPlacement, placements);
                    } else {
                        placements[placement.getId()] = placement;
                    }
                } else {
                    placements[placement.getId()] = placement;
                }
                if (placement.isDefault()) {
                    if (placement.isBannerPlacement()) {
                        defaultBannerPlacement = placement;
                    } else {
                        defaultPlacement = placement;
                    }
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
            abGroup: ABGroupBuilder.getAbGroup(configJson.abGroup),
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
            defaultBannerPlacement: defaultBannerPlacement
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
