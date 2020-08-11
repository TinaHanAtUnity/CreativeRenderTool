import { IRawAdsConfiguration } from 'Ads/Models/AdsConfiguration';
import {
    CurrentUnityConsentVersion,
    GamePrivacy,
    IAllPermissions,
    IPrivacyPermissions,
    IProfilingPermissions,
    IRawGamePrivacy,
    IRawUserPrivacy,
    PrivacyMethod,
    UserPrivacy
} from 'Privacy/Privacy';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { LegalFramework } from 'Ads/Managers/UserPrivacyManager';

export class PrivacyParser {
    public static parse(configJson: IRawAdsConfiguration, clientInfo: ClientInfo, deviceInfo: DeviceInfo): PrivacySDK {
        let limitAdTracking = false;
        if (deviceInfo && deviceInfo.getLimitAdTracking()) {
            limitAdTracking = true;
        }
        const gdprEnabled = configJson.gdprEnabled;
        const optOutRecorded = configJson.optOutRecorded;
        const optOutEnabled = configJson.optOutEnabled;
        const gamePrivacy = this.parseGamePrivacy(configJson.gamePrivacy, configJson.gdprEnabled);
        const userPrivacy = this.parseUserPrivacy(configJson.userPrivacy, gamePrivacy, optOutRecorded, optOutEnabled, limitAdTracking);
        const legalFramework = configJson.legalFramework ? configJson.legalFramework : LegalFramework.NONE;
        const ageGateLimit = this.parseAgeGateLimit(configJson.ageGateLimit, gamePrivacy, configJson, limitAdTracking);
        const useUnityAttDialog = configJson.useUnityAttDialog ? configJson.useUnityAttDialog : false;

        return new PrivacySDK(gamePrivacy, userPrivacy, gdprEnabled, ageGateLimit, legalFramework, useUnityAttDialog);
    }

    private static parseAgeGateLimit(ageGateLimit: number | undefined, gamePrivacy: GamePrivacy, configJson: IRawAdsConfiguration, limitAdTracking: boolean): number {
        ageGateLimit = ageGateLimit ? ageGateLimit : 0;
        if (ageGateLimit === 0) {
            return 0;
        }

        if (gamePrivacy.getMethod() !== PrivacyMethod.LEGITIMATE_INTEREST &&
            gamePrivacy.getMethod() !== PrivacyMethod.UNITY_CONSENT) {
            ageGateLimit = 0;

            Diagnostics.trigger('age_gate_wrong_privacy_method', { config: JSON.stringify(configJson) });
        }

        if (limitAdTracking) {
            ageGateLimit = 0;
        }

        return ageGateLimit;
    }

    private static parseGamePrivacy(rawGamePrivacy: IRawGamePrivacy | undefined, gdprEnabled: boolean): GamePrivacy {
        if (rawGamePrivacy && rawGamePrivacy.method) {
            return new GamePrivacy(rawGamePrivacy);
        }

        if (gdprEnabled === true) {
            Diagnostics.trigger('ads_configuration_game_privacy_missing', {
                userPrivacy: JSON.stringify('NA'),
                gamePrivacy: JSON.stringify(rawGamePrivacy) });
            // TODO: Remove when all games have a correct method in dashboard and configuration always contains correct method
            return new GamePrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST });
        }
        return new GamePrivacy({ method: PrivacyMethod.DEFAULT });
    }

    private static getValidRawUserPrivacy(rawUserPrivacy: IRawUserPrivacy | undefined): IRawUserPrivacy | undefined {
        if (!rawUserPrivacy) {
            return undefined;
        }

        if (!Object.values(PrivacyMethod).includes(rawUserPrivacy.method)) {
            return undefined;
        }

        if (isNaN(rawUserPrivacy.version)) {
            return undefined;
        }

        if (!rawUserPrivacy.permissions) {
            return undefined;
        }

        // Handle current granular permissions
        if (rawUserPrivacy.permissions.ads !== undefined &&
            rawUserPrivacy.permissions.external !== undefined &&
            rawUserPrivacy.permissions.gameExp !== undefined) {
            return {
                method: rawUserPrivacy.method,
                version: rawUserPrivacy.version,
                permissions: {
                    ads: rawUserPrivacy.permissions.ads,
                    external: rawUserPrivacy.permissions.external,
                    gameExp: rawUserPrivacy.permissions.gameExp
                }
            };
        }

        // Handle old style 'all'-privacy
        if ((<IAllPermissions><unknown>rawUserPrivacy.permissions).all === true) {
            return {
                method: rawUserPrivacy.method,
                version: rawUserPrivacy.version,
                permissions: UserPrivacy.PERM_ALL_TRUE
            };
        }

        // Handle old style 'profiling'-privacy
        const profiling = (<IProfilingPermissions><unknown>rawUserPrivacy.permissions).profiling;
        if (profiling !== undefined) {
            let permissions: IPrivacyPermissions | undefined;
            if (profiling) {
                if (rawUserPrivacy.method === PrivacyMethod.LEGITIMATE_INTEREST) {
                    permissions = UserPrivacy.PERM_OPTIN_LEGITIMATE_INTEREST_GDPR;
                }
                if (rawUserPrivacy.method === PrivacyMethod.DEVELOPER_CONSENT) {
                    permissions = UserPrivacy.PERM_DEVELOPER_CONSENTED;
                }
            } else {
                permissions = UserPrivacy.PERM_ALL_FALSE;
            }

            if (permissions) {
                return {
                    method: rawUserPrivacy.method,
                    version: rawUserPrivacy.version,
                    permissions: permissions
                };
            }
        }

        return undefined;
    }

    private static parseUserPrivacy(rawUserPrivacy: IRawUserPrivacy | undefined, gamePrivacy: GamePrivacy,
                                    optOutRecorded: boolean, optOutEnabled: boolean, limitAdTracking: boolean): UserPrivacy {
        rawUserPrivacy = this.getValidRawUserPrivacy(rawUserPrivacy);

        if (limitAdTracking) {
            const gPmethod = gamePrivacy.getMethod();
            return new UserPrivacy({
                method: gPmethod || PrivacyMethod.DEFAULT,
                version:  gPmethod === PrivacyMethod.UNITY_CONSENT ? CurrentUnityConsentVersion : 0,
                permissions: UserPrivacy.PERM_ALL_FALSE
            });
        }

        if (rawUserPrivacy && rawUserPrivacy.method === PrivacyMethod.DEVELOPER_CONSENT) {
            gamePrivacy.setMethod(PrivacyMethod.DEVELOPER_CONSENT);
        }

        if (!rawUserPrivacy) {
            return UserPrivacy.createUnrecorded();
        }

        // reset outdated user privacy if the game privacy method has been changed, first ad request will be contextual
        const methodHasChanged = rawUserPrivacy.method !== gamePrivacy.getMethod();
        if (gamePrivacy.getMethod() !== PrivacyMethod.DEFAULT && methodHasChanged) {
            return UserPrivacy.createUnrecorded();
        }

        return new UserPrivacy(rawUserPrivacy);
    }
}
