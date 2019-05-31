import { AdsConfiguration, IAdsConfiguration, IRawAdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Placement } from 'Ads/Models/Placement';
import { GamePrivacy, PrivacyMethod, UserPrivacy } from 'Ads/Models/Privacy';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { Diagnostics } from 'Core/Utilities/Diagnostics';

export class AdsConfigurationParser {
    public static parse(configJson: IRawAdsConfiguration, clientInfo?: ClientInfo, updateUserPrivacyForIncidentCB?: () => {}): AdsConfiguration {
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

        const configurationParams: IAdsConfiguration = {
            cacheMode: this.parseCacheMode(configJson),
            placements: placements,
            defaultPlacement: defaultPlacement,
            gdprEnabled: configJson.gdprEnabled,
            optOutRecorded: configJson.optOutRecorded,
            optOutEnabled: configJson.optOutEnabled,
            defaultBannerPlacement: defaultBannerPlacement,
            gamePrivacy: this.parseGamePrivacy(configJson),
            userPrivacy: this.parseUserPrivacy(configJson)
        };

        return new AdsConfiguration(configurationParams);
    }

    private static parseGamePrivacy(configJson: IRawAdsConfiguration) {
        if (configJson.gamePrivacy && configJson.gamePrivacy.method) {
            return new GamePrivacy(configJson.gamePrivacy);
        }
        Diagnostics.trigger('ads_configuration_game_privacy_missing', {
            userPrivacy: JSON.stringify(configJson.userPrivacy),
            gamePrivacy: JSON.stringify(configJson.gamePrivacy)});
        if (configJson.gdprEnabled === true) {
            // TODO: Remove when all games have a correct method in dashboard and configuration always contains correct method
            return new GamePrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST });
        }
        return new GamePrivacy({ method: PrivacyMethod.DEFAULT });
    }

    private static parseUserPrivacy(configJson: IRawAdsConfiguration) {
        if (!configJson.gamePrivacy) {
            // This would be an unexpected case, LI is necessary not the correct option, but this makes sure we show at
            // least contextual ads
            return new UserPrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST, version: 0, permissions: {
                    all: false,
                    gameExp: false,
                    ads: !configJson.optOutEnabled,
                    external: false
                }});
        }
        if (!configJson.userPrivacy) {
            return new UserPrivacy({ method: PrivacyMethod.DEFAULT, version: 0, permissions: { profiling: false} });
        }
        if (configJson.gamePrivacy.method === PrivacyMethod.LEGITIMATE_INTEREST ||
            configJson.gamePrivacy.method === PrivacyMethod.DEVELOPER_CONSENT) {
            return new UserPrivacy({
                method: configJson.gamePrivacy.method,
                version: configJson.userPrivacy ? configJson.userPrivacy.version : 0,
                permissions: {
                    all: false,
                    gameExp: false,
                    ads: !configJson.optOutEnabled,
                    external: false
                }
            });
        }
        return new UserPrivacy(configJson.userPrivacy);
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
