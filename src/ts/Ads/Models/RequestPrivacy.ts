import {
    GamePrivacy, IGranularPermissions,
    IPermissions,
    PrivacyMethod,
    UserPrivacy
} from 'Privacy/Privacy';
import { PrivacySDK } from 'Privacy/PrivacySDK';

export interface IRequestPrivacy {
    method: PrivacyMethod;
    firstRequest: boolean;
    permissions: IGranularPermissions;
}

export interface ILegacyRequestPrivacy {
    gdprEnabled: boolean;
    optOutRecorded: boolean;
    optOutEnabled: boolean;
}

export class RequestPrivacyFactory {
    public static create(userPrivacy: UserPrivacy, gamePrivacy: GamePrivacy): IRequestPrivacy | undefined {
        if (this.GameUsesConsent(gamePrivacy) === false) {
            return undefined;
        }

        if (!userPrivacy.isRecorded()) {
            return {
                method: gamePrivacy.getMethod(),
                firstRequest: true,
                permissions: {}
            };
        }
        return {
            method: userPrivacy.getMethod(),
            firstRequest: false,
            permissions: userPrivacy.getPermissions()
        };
    }

    public static createLegacy(privacySDK: PrivacySDK): ILegacyRequestPrivacy {
        return {
            gdprEnabled: privacySDK.isGDPREnabled(),
            optOutRecorded: privacySDK.isOptOutRecorded(),
            optOutEnabled: privacySDK.isOptOutEnabled()
        };
    }

    private static GameUsesConsent(gamePrivacy: GamePrivacy): boolean {
        const isDeveloperConsent: boolean = gamePrivacy.getMethod() === PrivacyMethod.DEVELOPER_CONSENT;
        return gamePrivacy.getMethod() === PrivacyMethod.UNITY_CONSENT || isDeveloperConsent;
    }
}
