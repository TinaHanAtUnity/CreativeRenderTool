import { AdsConfiguration, IAdsConfiguration, IRawAdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Placement } from 'Ads/Models/Placement';
import { CacheMode } from 'Core/Models/CoreConfiguration';

export class AdsConfigurationParser {
    private static _isBrowserBuild: boolean = false;

    public static setIsBrowserBuild(isBrowserBuild: boolean): void {
        this._isBrowserBuild = isBrowserBuild;
    }

    public static parse(configJson: IRawAdsConfiguration): AdsConfiguration {
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

        // Browser Build Testing Requires CacheMode to be Disabled
        const cacheMode = this._isBrowserBuild ? CacheMode.DISABLED : this.parseCacheMode(configJson);

        const configurationParams: IAdsConfiguration = {
            cacheMode: cacheMode,
            placements: placements,
            defaultPlacement: defaultPlacement,
            gdprEnabled: configJson.gdprEnabled,
            optOutRecorded: configJson.optOutRecorded,
            optOutEnabled: configJson.optOutEnabled,
            defaultBannerPlacement: defaultBannerPlacement,
            hidePrivacy: configJson.hidePrivacy
        };

        return new AdsConfiguration(configurationParams);
    }

    private static parseCacheMode(configJson: IRawAdsConfiguration): CacheMode {
        switch (configJson.assetCaching) {
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
