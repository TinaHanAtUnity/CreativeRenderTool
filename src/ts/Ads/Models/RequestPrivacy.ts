import {
    IPrivacyPermissions,
    PrivacyMethod, UserPrivacy
} from 'Privacy/Privacy';
import { PrivacySDK } from 'Privacy/PrivacySDK';

export interface IRequestPrivacy {
    method: PrivacyMethod;
    firstRequest: boolean;
    permissions: IPrivacyPermissions | { [key: string]: never };
}

export interface ILegacyRequestPrivacy {
    gdprEnabled: boolean;
    optOutRecorded: boolean;
    optOutEnabled: boolean;
}

export class RequestPrivacyFactory {
    public static create(privacySDK: PrivacySDK, limitAdTracking: boolean | undefined): IRequestPrivacy {
        let method: PrivacyMethod;
        let permissions: IPrivacyPermissions = UserPrivacy.PERM_ALL_FALSE;
        const isRecorded = privacySDK.isOptOutRecorded();

        if (isRecorded) {
            const userPrivacy = privacySDK.getUserPrivacy();
            method = userPrivacy.getMethod();
            permissions = userPrivacy.getPermissions();
        } else {
            const gamePrivacyMethod = privacySDK.getGamePrivacy().getMethod();
            switch (gamePrivacyMethod) {
                case PrivacyMethod.UNITY_CONSENT: permissions = UserPrivacy.PERM_ALL_FALSE;
                    break;
                case PrivacyMethod.LEGITIMATE_INTEREST: permissions = UserPrivacy.PERM_ALL_FALSE;
                    break;
                case PrivacyMethod.DEVELOPER_CONSENT: permissions = UserPrivacy.PERM_ALL_FALSE;
                    break;
                case PrivacyMethod.DEFAULT: permissions = UserPrivacy.PERM_ALL_TRUE;
                    break;
                default: permissions = UserPrivacy.PERM_ALL_FALSE;
            }
            method = gamePrivacyMethod;
        }

        if (limitAdTracking) {
            permissions = UserPrivacy.PERM_ALL_FALSE;
        }

        return {
            method: method,
            firstRequest: !isRecorded,
            permissions: {
                ads: permissions.ads,
                external: permissions.external,
                gameExp: permissions.gameExp
            }
        };
    }

    public static createLegacy(privacySDK: PrivacySDK): ILegacyRequestPrivacy {
        return {
            gdprEnabled: privacySDK.isGDPREnabled(),
            optOutRecorded: privacySDK.isOptOutRecorded(),
            optOutEnabled: privacySDK.isOptOutEnabled()
        };
    }
}
