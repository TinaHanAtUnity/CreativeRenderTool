import { IRawAdsConfiguration } from 'Ads/Models/AdsConfiguration';
import {
    CurrentUnityConsentVersion,
    GamePrivacy,
    IAllPermissions,
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
        const userPrivacy = this.parseUserPrivacy(configJson.userPrivacy, configJson.gamePrivacy, gdprEnabled, optOutRecorded, optOutEnabled, limitAdTracking);
        const legalFramework = configJson.legalFramework ? configJson.legalFramework : LegalFramework.DEFAULT;

        let ageGateLimit = configJson.ageGateLimit !== undefined ? configJson.ageGateLimit : 0;
        if (ageGateLimit > 0 && gamePrivacy.getMethod() !== PrivacyMethod.LEGITIMATE_INTEREST) {
            ageGateLimit = 0;

            Diagnostics.trigger('age_gate_wrong_privacy_method', {config: JSON.stringify(configJson)});
        }

        if (limitAdTracking) {
            ageGateLimit = 0;
        }

        return new PrivacySDK(gamePrivacy, userPrivacy, gdprEnabled, ageGateLimit, legalFramework);
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
                                    gdprEnabled: boolean, optOutRecorded: boolean, optOutEnabled: boolean, limitAdTracking: boolean): UserPrivacy {
        // handle old style 'all'-privacy
        if (rawUserPrivacy && rawUserPrivacy.permissions && (<IAllPermissions><unknown>rawUserPrivacy.permissions).all === true) {
            rawUserPrivacy = {
                method: rawUserPrivacy.method,
                version: rawUserPrivacy.version,
                permissions: {ads: true, gameExp: true, external: true},
                agreedAll: true
            };
        }

        // TODO: Handle limitAdTracking on Ads SDK side
        if (limitAdTracking) {
            const gPmethod = rawGamePrivacy && rawGamePrivacy.method ? rawGamePrivacy.method : undefined;
            return new UserPrivacy({
                method: gPmethod ? gPmethod : PrivacyMethod.DEFAULT,
                version:  gPmethod === PrivacyMethod.UNITY_CONSENT ? CurrentUnityConsentVersion : 0,
                agreedAll: false,
                permissions: {
                    gameExp: false,
                    ads: false,
                    external: false
                }
            });
        }

        if (!rawGamePrivacy || !rawUserPrivacy) {
            let consent = false;
            let method = PrivacyMethod.DEFAULT;
            if (gdprEnabled) {
                method = PrivacyMethod.LEGITIMATE_INTEREST;
            }
            if (rawGamePrivacy && optOutRecorded) {
                consent = !optOutEnabled;
                if (rawGamePrivacy.method && Object.values(PrivacyMethod).includes(rawGamePrivacy.method)) {
                    method = <PrivacyMethod>rawGamePrivacy.method;
                }
            }

            return new UserPrivacy({ method: method, version: 0, agreedAll: false, permissions: {
                    gameExp: false,
                    ads: consent,
                    external: consent
                }});
        }

        if (rawGamePrivacy.method === PrivacyMethod.LEGITIMATE_INTEREST ||
            rawGamePrivacy.method === PrivacyMethod.DEVELOPER_CONSENT) {
            return new UserPrivacy({
                method: rawGamePrivacy.method,
                version: 0,
                agreedAll: false,
                permissions: {
                    gameExp: false,
                    ads: optOutRecorded ? !optOutEnabled : false,
                    external: optOutRecorded ? !optOutEnabled : false
                }
            });
        }

        // reset outdated user privacy if the game privacy method has been changed, first ad request will be contextual
        const methodHasChanged = rawUserPrivacy.method !== rawGamePrivacy.method;
        if (rawGamePrivacy.method !== PrivacyMethod.DEFAULT && methodHasChanged) {
            return new UserPrivacy({ method: PrivacyMethod.DEFAULT, version: 0, agreedAll: false, permissions: {
                    gameExp: false,
                    ads: false,
                    external: false
                }});
        }

        return new UserPrivacy(rawUserPrivacy);
    }
}
