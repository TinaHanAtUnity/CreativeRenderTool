import { CurrentUnityConsentVersion, GamePrivacy, PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { LegalFramework } from 'Ads/Managers/UserPrivacyManager';
export class PrivacyParser {
    static parse(configJson, clientInfo, deviceInfo) {
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
    static parseAgeGateLimit(ageGateLimit, gamePrivacy, configJson, limitAdTracking) {
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
    static parseGamePrivacy(rawGamePrivacy, gdprEnabled) {
        if (rawGamePrivacy && rawGamePrivacy.method) {
            return new GamePrivacy(rawGamePrivacy);
        }
        if (gdprEnabled === true) {
            Diagnostics.trigger('ads_configuration_game_privacy_missing', {
                userPrivacy: JSON.stringify('NA'),
                gamePrivacy: JSON.stringify(rawGamePrivacy)
            });
            // TODO: Remove when all games have a correct method in dashboard and configuration always contains correct method
            return new GamePrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST });
        }
        return new GamePrivacy({ method: PrivacyMethod.DEFAULT });
    }
    static getValidRawUserPrivacy(rawUserPrivacy) {
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
        if (rawUserPrivacy.permissions.all === true) {
            return {
                method: rawUserPrivacy.method,
                version: rawUserPrivacy.version,
                permissions: UserPrivacy.PERM_ALL_TRUE
            };
        }
        // Handle old style 'profiling'-privacy
        const profiling = rawUserPrivacy.permissions.profiling;
        if (profiling !== undefined) {
            let permissions;
            if (profiling) {
                if (rawUserPrivacy.method === PrivacyMethod.LEGITIMATE_INTEREST) {
                    permissions = UserPrivacy.PERM_OPTIN_LEGITIMATE_INTEREST_GDPR;
                }
                if (rawUserPrivacy.method === PrivacyMethod.DEVELOPER_CONSENT) {
                    permissions = UserPrivacy.PERM_DEVELOPER_CONSENTED;
                }
            }
            else {
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
    static parseUserPrivacy(rawUserPrivacy, gamePrivacy, optOutRecorded, optOutEnabled, limitAdTracking) {
        rawUserPrivacy = this.getValidRawUserPrivacy(rawUserPrivacy);
        if (limitAdTracking) {
            const gPmethod = gamePrivacy.getMethod();
            return new UserPrivacy({
                method: gPmethod || PrivacyMethod.DEFAULT,
                version: gPmethod === PrivacyMethod.UNITY_CONSENT ? CurrentUnityConsentVersion : 0,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeVBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Qcml2YWN5L1BhcnNlcnMvUHJpdmFjeVBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQ0gsMEJBQTBCLEVBQzFCLFdBQVcsRUFNWCxhQUFhLEVBQ2IsV0FBVyxFQUNkLE1BQU0saUJBQWlCLENBQUM7QUFFekIsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRXpELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFakUsTUFBTSxPQUFPLGFBQWE7SUFDZixNQUFNLENBQUMsS0FBSyxDQUFDLFVBQWdDLEVBQUUsVUFBc0IsRUFBRSxVQUFzQjtRQUNoRyxJQUFJLGVBQWUsR0FBRyxLQUFLLENBQUM7UUFDNUIsSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLGtCQUFrQixFQUFFLEVBQUU7WUFDL0MsZUFBZSxHQUFHLElBQUksQ0FBQztTQUMxQjtRQUNELE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUM7UUFDM0MsTUFBTSxjQUFjLEdBQUcsVUFBVSxDQUFDLGNBQWMsQ0FBQztRQUNqRCxNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDO1FBQy9DLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxRixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUMvSCxNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMs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