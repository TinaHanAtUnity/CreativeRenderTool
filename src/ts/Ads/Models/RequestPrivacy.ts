import {
    IPermissions,
    PrivacyMethod
} from 'Privacy/Privacy';
import { PrivacySDK } from 'Privacy/PrivacySDK';

export interface IRequestPrivacy {
    method: PrivacyMethod;
    firstRequest: boolean;
    permissions: IPermissions | { [key: string]: never };
}

export interface ILegacyRequestPrivacy {
    gdprEnabled: boolean;
    optOutRecorded: boolean;
    optOutEnabled: boolean;
}

export class RequestPrivacyFactory {
    public static create(privacySDK: PrivacySDK, limitAdTracking: boolean | undefined): IRequestPrivacy {
        const requestUserPrivacy = privacySDK.getSubmittablePrivacy(limitAdTracking);
        const isRecorded = privacySDK.getUserPrivacy().isRecorded();
        return {
            method: requestUserPrivacy.getMethod(),
            firstRequest: !isRecorded,
            permissions: requestUserPrivacy.getPermissions()
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
