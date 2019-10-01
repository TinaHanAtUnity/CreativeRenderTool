import { IRawAdsConfiguration } from 'Ads/Models/AdsConfiguration';
import {
    CurrentUnityConsentVersion,
    GamePrivacy,
    IProfilingPermissions,
    IGranularPermissions,
    PrivacyMethod,
    UserPrivacy,
    IAllPermissions, IRawGamePrivacy, IRawUserPrivacy
} from 'Privacy/Privacy';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { PrivacySDK } from 'Privacy/PrivacySDK';

export class PrivacyParser {
    private static _updateUserPrivacyForIncident: boolean = false;

    public static parse(configJson: IRawAdsConfiguration, clientInfo: ClientInfo, deviceInfo: DeviceInfo): PrivacySDK {

        const sanitizedConfigJson = this.sanitizePrivacyAndOptOutDesynchronized(configJson);
        if (sanitizedConfigJson.optOutEnabled !== configJson.optOutEnabled) {
            this._updateUserPrivacyForIncident = true;
        }

        let limitAdTracking = false;
        if (deviceInfo && deviceInfo.getLimitAdTracking()) {
            limitAdTracking = true;
        }

        const gamePrivacy = this.parseGamePrivacy(sanitizedConfigJson.gamePrivacy, sanitizedConfigJson.gdprEnabled);
        const userPrivacy = this.parseUserPrivacy(sanitizedConfigJson.userPrivacy, sanitizedConfigJson.gamePrivacy,
            sanitizedConfigJson.optOutEnabled, limitAdTracking);
        const gdprEnabled = sanitizedConfigJson.gdprEnabled;
        const optOutRecorded = sanitizedConfigJson.optOutRecorded;
        const optOutEnabled = sanitizedConfigJson.optOutEnabled;
        const ageGateLimit = sanitizedConfigJson.ageGateLimit ? sanitizedConfigJson.ageGateLimit : 0;

        return new PrivacySDK(gamePrivacy, userPrivacy, gdprEnabled, optOutRecorded, optOutEnabled, ageGateLimit);
    }

    // For #incident-20190516-2
    public static isUpdateUserPrivacyForIncidentNeeded(): boolean {
        return this._updateUserPrivacyForIncident;
    }

    // For #incident-20190516-2
    private static sanitizePrivacyAndOptOutDesynchronized(rawAdsConfiguration: IRawAdsConfiguration): IRawAdsConfiguration {
        const rawUserPrivacy = rawAdsConfiguration.userPrivacy;
        const rawGamePrivacy = rawAdsConfiguration.gamePrivacy;
        const optOutEnabled = rawAdsConfiguration.optOutEnabled;
        const optOutRecorded = rawAdsConfiguration.optOutRecorded;
        const sanitizedConfiguration = JSON.parse(JSON.stringify(rawAdsConfiguration));
        if (!rawUserPrivacy) {
            return sanitizedConfiguration;
        }
        if (!optOutRecorded) {
            return sanitizedConfiguration;
        }
        if (!rawGamePrivacy) {
            return sanitizedConfiguration;
        }
        if (rawGamePrivacy.method !== PrivacyMethod.LEGITIMATE_INTEREST) {
            return sanitizedConfiguration;
        }
        const uPP = rawUserPrivacy.permissions;
        if (uPP.hasOwnProperty('profiling') && uPP.hasOwnProperty('ads')) {
            Diagnostics.trigger('ads_configuration_user_privacy_inconsistent', {
                userPrivacy: JSON.stringify(rawUserPrivacy),
                gamePrivacy: JSON.stringify(rawGamePrivacy)});
            rawAdsConfiguration.userPrivacy = undefined;
            return sanitizedConfiguration;
        }

        let adsAllowed = false;
        if (uPP.hasOwnProperty('all')) {
            adsAllowed = (<IAllPermissions>uPP).all;
        }
        if (uPP.hasOwnProperty('profiling')) {
            adsAllowed = (<IProfilingPermissions>uPP).profiling;
        }
        if (uPP.hasOwnProperty('ads')) {
            adsAllowed = (<IGranularPermissions>uPP).ads;
        }
        if (adsAllowed === false && optOutEnabled === false) {
            Diagnostics.trigger('ads_configuration_sanitization_needed', JSON.stringify(rawAdsConfiguration));
            sanitizedConfiguration.optOutEnabled = true;
            return sanitizedConfiguration;
        }
        return sanitizedConfiguration;
    }

    private static parseGamePrivacy(rawGamePrivacy: IRawGamePrivacy | undefined, gdprEnabled: boolean): GamePrivacy {
        if (rawGamePrivacy && rawGamePrivacy.method) {
            return new GamePrivacy(rawGamePrivacy);
        }

        if (gdprEnabled === true) {
            Diagnostics.trigger('ads_configuration_game_privacy_missing', {
                userPrivacy: JSON.stringify('NA'),
                gamePrivacy: JSON.stringify(rawGamePrivacy)});
            // TODO: Remove when all games have a correct method in dashboard and configuration always contains correct method
            return new GamePrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST });
        }
        return new GamePrivacy({ method: PrivacyMethod.DEFAULT });
    }

    private static parseUserPrivacy(rawUserPrivacy: IRawUserPrivacy | undefined, rawGamePrivacy: IRawGamePrivacy | undefined,
                                    optOutEnabled: boolean, limitAdTracking: boolean): UserPrivacy {
        // TODO: Handle limitAdTracking on Ads SDK side
        if (limitAdTracking) {
            const gPmethod = rawGamePrivacy && rawGamePrivacy.method ? rawGamePrivacy.method : undefined;
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

        if (!rawGamePrivacy || !rawUserPrivacy) {
            return new UserPrivacy({ method: PrivacyMethod.DEFAULT, version: 0, permissions: {
                    all: false,
                    gameExp: false,
                    ads: false,
                    external: false
                }});
        }

        if (rawGamePrivacy.method === PrivacyMethod.LEGITIMATE_INTEREST ||
            rawGamePrivacy.method === PrivacyMethod.DEVELOPER_CONSENT) {
            return new UserPrivacy({
                method: rawGamePrivacy.method,
                version: 0,
                permissions: {
                    all: false,
                    gameExp: false,
                    ads: !optOutEnabled,
                    external: false
                }
            });
        }

        // reset outdated user privacy if the game privacy method has been changed, first ad request will be contextual
        const methodHasChanged = rawUserPrivacy.method !== rawGamePrivacy.method;
        if (rawGamePrivacy.method !== PrivacyMethod.DEFAULT && methodHasChanged) {
            return new UserPrivacy({ method: PrivacyMethod.DEFAULT, version: 0, permissions: {
                    all: false,
                    gameExp: false,
                    ads: false,
                    external: false
                }});
        }

        return new UserPrivacy(rawUserPrivacy);
    }
}
