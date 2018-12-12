import { AdsConfiguration, IAdsConfiguration, IRawAdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Placement } from 'Ads/Models/Placement';
import { GamePrivacy, PrivacyMethod, UserPrivacy } from 'Ads/Models/Privacy';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CacheMode } from 'Core/Models/CoreConfiguration';

export class AdsConfigurationParser {
    public static parse(configJson: IRawAdsConfiguration, clientInfo?: ClientInfo): AdsConfiguration {
        const configPlacements = configJson.placements;
        const placements: { [id: string]: Placement } = {};
        let defaultPlacement: Placement | undefined;
        let defaultBannerPlacement: Placement | undefined;

        if (configPlacements) {
            configPlacements.forEach(rawPlacement => {
                const placement = new Placement(rawPlacement);
                placements[placement.getId()] = placement;
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

        let gamePrivacy : GamePrivacy;
        let userPrivacy : UserPrivacy | undefined;
        const configGamePrivacy = configJson.gamePrivacy;
        const configUserPrivacy = configJson.userPrivacy;

        if (configGamePrivacy) {
            gamePrivacy = new GamePrivacy(configGamePrivacy);
        } else {
            gamePrivacy = new GamePrivacy({ method: PrivacyMethod.DEFAULT });
        }
        if (configUserPrivacy) {
            userPrivacy = new UserPrivacy(configUserPrivacy);
        }

        const configurationParams: IAdsConfiguration = {
            cacheMode: this.parseCacheMode(configJson),
            placements: placements,
            defaultPlacement: defaultPlacement,
            gdprEnabled: configJson.gdprEnabled,
            optOutRecorded: configJson.optOutRecorded,
            optOutEnabled: configJson.optOutEnabled,
            defaultBannerPlacement: defaultBannerPlacement,
            gamePrivacy: gamePrivacy,
            userPrivacy: userPrivacy
        };
        return new AdsConfiguration(configurationParams);
    }

    private static parseCacheMode(configJson: IRawAdsConfiguration): CacheMode {
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
