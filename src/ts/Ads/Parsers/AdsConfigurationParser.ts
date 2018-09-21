import { AdsConfiguration, IAdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Placement } from 'Ads/Models/Placement';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { MixedPlacementUtility } from 'Ads/Utilities/MixedPlacementUtility';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CacheMode } from 'Core/Models/CoreConfiguration';

export class AdsConfigurationParser {
    public static parse(configJson: any, clientInfo?: ClientInfo): AdsConfiguration {
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

        const configurationParams: IAdsConfiguration = {
            cacheMode: this.parseCacheMode(configJson),
            placements: placements,
            defaultPlacement: defaultPlacement,
            gdprEnabled: configJson.gdprEnabled,
            optOutRecorded: configJson.optOutRecorded,
            optOutEnabled: configJson.optOutEnabled,
            defaultBannerPlacement: defaultBannerPlacement
        };
        return new AdsConfiguration(configurationParams);
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
