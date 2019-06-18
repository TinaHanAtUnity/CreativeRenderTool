import { AdsConfiguration, IAdsConfiguration, IRawAdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Placement } from 'Ads/Models/Placement';
import { CurrentUnityConsentVersion, GamePrivacy, IProfilingPermissions, IGranularPermissions, PrivacyMethod, UserPrivacy } from 'Ads/Models/Privacy';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

export class AdsConfigurationParser {
    private static _updateUserPrivacyForIncident: boolean = false;
    public static parse(configJson: IRawAdsConfiguration, clientInfo?: ClientInfo, deviceInfo?: DeviceInfo): AdsConfiguration {
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

        if (this.isUserPrivacyAndOptOutDesynchronized(configJson)) {
            configJson.optOutEnabled = true;
            this._updateUserPrivacyForIncident = true;
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
            userPrivacy: this.parseUserPrivacy(configJson, deviceInfo)
        };

        return new AdsConfiguration(configurationParams);
    }

    // For #incident-20190516-2
    public static isUpdateUserPrivacyForIncidentNeeded(): boolean {
        return this._updateUserPrivacyForIncident;
    }

    // For #incident-20190516-2
    public static isUserPrivacyAndOptOutDesynchronized(configJson: IRawAdsConfiguration) {
        if (!configJson.userPrivacy) {
            return false;
        }
        if (!configJson.optOutRecorded) {
            return false;
        }
        if (!configJson.gamePrivacy) {
            return false;
        }
        if (configJson.gamePrivacy.method !== PrivacyMethod.LEGITIMATE_INTEREST) {
            return false;
        }

        let adsAllowed = false;
        const uPP = configJson.userPrivacy.permissions;
        if (uPP.hasOwnProperty('profiling')) {
            adsAllowed = (<IProfilingPermissions>uPP).profiling;
        }
        if (uPP.hasOwnProperty('ads')) {
            adsAllowed = (<IGranularPermissions>uPP).ads;
        }
        if (adsAllowed === false && configJson.optOutEnabled === false) {
            return true;
        }
        return false;
    }

    private static parseGamePrivacy(configJson: IRawAdsConfiguration) {
        if (configJson.gamePrivacy && configJson.gamePrivacy.method) {
            return new GamePrivacy(configJson.gamePrivacy);
        }

        if (configJson.gdprEnabled === true) {
            Diagnostics.trigger('ads_configuration_game_privacy_missing', {
                userPrivacy: JSON.stringify(configJson.userPrivacy),
                gamePrivacy: JSON.stringify(configJson.gamePrivacy)});
            // TODO: Remove when all games have a correct method in dashboard and configuration always contains correct method
            return new GamePrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST });
        }
        return new GamePrivacy({ method: PrivacyMethod.DEFAULT });
    }

    private static parseUserPrivacy(configJson: IRawAdsConfiguration, deviceInfo?: DeviceInfo) {
        if (deviceInfo && deviceInfo.getLimitAdTracking()) {
            const gPmethod = configJson.gamePrivacy && configJson.gamePrivacy.method ? configJson.gamePrivacy.method : undefined;
            return new UserPrivacy({
                method: gPmethod ? gPmethod : PrivacyMethod.DEFAULT,
                version:  gPmethod === PrivacyMethod.UNITY_CONSENT ? CurrentUnityConsentVersion : 0,
                permissions: {
                    all: false,
                    gameExp: false,
                    ads: false,
                    external: false
                }
            });
        }
        if (!configJson.gamePrivacy || !configJson.userPrivacy) {
            return new UserPrivacy({ method: PrivacyMethod.DEFAULT, version: 0, permissions: {
                    all: false,
                    gameExp: false,
                    ads: false,
                    external: false
            }});
        }

        if (configJson.gamePrivacy.method === PrivacyMethod.LEGITIMATE_INTEREST ||
            configJson.gamePrivacy.method === PrivacyMethod.DEVELOPER_CONSENT) {
                return new UserPrivacy({
                    method: configJson.gamePrivacy.method,
                    version: 0,
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
