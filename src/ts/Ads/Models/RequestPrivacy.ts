import {
    GamePrivacy,
    IAllPermissions,
    IGranularPermissions,
    IPermissions,
    IProfilingPermissions,
    PrivacyMethod,
    UserPrivacy
} from 'Ads/Models/Privacy';

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

function isProfilingPermissions(permissions: IPermissions | { [key: string]: never }): permissions is IProfilingPermissions {
    return (<IProfilingPermissions>permissions).profiling !== undefined;
}

export class RequestPrivacyFactory {
    public static create(userPrivacy: UserPrivacy, gamePrivacy: GamePrivacy): IRequestPrivacy {
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
            permissions: RequestPrivacyFactory.toGranularPermissions(userPrivacy)
        };
    }

    private static toGranularPermissions(userPrivacy: UserPrivacy): IGranularPermissions {
        //TODO: Add other methods after hotfix is working
        if (userPrivacy.getMethod() !== PrivacyMethod.UNITY_CONSENT) {
            return <IGranularPermissions>{};
        }
        const permissions = userPrivacy.getPermissions();

        if ((<IAllPermissions>permissions).all === true) {
            return {
                gameExp: true,
                ads: true,
                external: true
            };
        }

        return <IGranularPermissions>permissions;
    }

    public static createLegacy(privacy: IRequestPrivacy): ILegacyRequestPrivacy {
        if (privacy.method === PrivacyMethod.DEFAULT) {
            return {
                gdprEnabled: false,
                optOutRecorded: false,
                optOutEnabled: false
            };
        }
        return {
            gdprEnabled: true,
            optOutRecorded: !privacy.firstRequest,
            optOutEnabled: this.IsOptOutEnabled(privacy)
        };
    }

    private static IsOptOutEnabled(privacy: IRequestPrivacy) {
        if (privacy.method === PrivacyMethod.LEGITIMATE_INTEREST && privacy.firstRequest) {
            return false;
        }

        return isProfilingPermissions(privacy.permissions) ? !privacy.permissions.profiling : true;
    }
}
