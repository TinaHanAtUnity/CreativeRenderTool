import { Model } from 'Core/Models/Model';

export enum PrivacyMethod {
    DEFAULT = 'default',
    LEGITIMATE_INTEREST = 'legitimate_interest',
    UNITY_CONSENT = 'unity_consent',
    DEVELOPER_CONSENT = 'developer_consent'
}

export interface IAllPermissions {
    all: boolean;
}

export interface IPrivacyPermissions {
    [key: string]: boolean;
    gameExp: boolean;
    ads: boolean;
    external: boolean;
}

export function isPrivacyPermissions(permissions: IPrivacyPermissions): permissions is IPrivacyPermissions {
    return (permissions.gameExp !== undefined &&
        permissions.ads !== undefined &&
        permissions.external !== undefined);
}

export interface IProfilingPermissions {
    profiling: boolean;
}

export const CurrentUnityConsentVersion = 20181106;

export interface IRawGamePrivacy {
    method: string | undefined;
}

interface IGamePrivacy {
    method: PrivacyMethod;
}

export class GamePrivacy extends Model<IGamePrivacy> {

    constructor(data: IRawGamePrivacy) {
        super('GamePrivacy', {
            method: ['string']
        });

        this.set('method', <PrivacyMethod>data.method);
    }

    public getMethod(): PrivacyMethod {
        return this.get('method');
    }

    public setMethod(method: PrivacyMethod): void {
        this.set('method', method);
    }

    public getVersion(): number {
        if (this.getMethod() === PrivacyMethod.UNITY_CONSENT) {
            return CurrentUnityConsentVersion;
        }
        return 0;
    }

    public getDTO(): { [key: string]: unknown } {
        return {
            'method': this.getMethod(),
            'version': this.getVersion()
        };
    }
}

export interface IRawUserPrivacy {
    method: string;
    version: number;
    permissions: IPrivacyPermissions;
}

interface IUserPrivacy {
    method: PrivacyMethod;
    version: number;
    permissions: IPrivacyPermissions;
}

export class UserPrivacy extends Model<IUserPrivacy> {
    public static readonly PERM_ALL_TRUE: IPrivacyPermissions = Object.freeze({ads: true, external: true, gameExp: true});
    public static readonly PERM_ALL_FALSE: IPrivacyPermissions = Object.freeze({ads: false, external: false, gameExp: false});
    public static readonly PERM_SKIPPED_LEGITIMATE_INTEREST: IPrivacyPermissions = Object.freeze({ads: true, external: true, gameExp: true});
    public static readonly PERM_OPTIN_LEGITIMATE_INTEREST: IPrivacyPermissions = Object.freeze({ads: true, external: true, gameExp: true});
    public static readonly PERM_SKIPPED_LEGITIMATE_INTEREST_GDPR: IPrivacyPermissions = Object.freeze({ads: true, external: false, gameExp: true});
    public static readonly PERM_OPTIN_LEGITIMATE_INTEREST_GDPR: IPrivacyPermissions = Object.freeze({ads: true, external: false, gameExp: true});
    public static readonly PERM_DEVELOPER_CONSENTED: IPrivacyPermissions = Object.freeze({ads: true, external: true, gameExp: true});

    public static createFromLegacy(method: PrivacyMethod, optOutRecorded: boolean, optOutEnabled: boolean): UserPrivacy {
        if (!optOutRecorded) {
            return this.createUnrecorded();
        }

        switch (method) {
            case PrivacyMethod.DEVELOPER_CONSENT:
            case PrivacyMethod.LEGITIMATE_INTEREST:
                // it's unknown if user actually gave a consent (i.e. was game using developer_consent during that session)
                // or an opt-out therefore the optOutEnabled value is ambiguous. Therefore `external` can't be set to !optOutEnabled.
                return new UserPrivacy({
                    method: method,
                    version: 0,
                    permissions: {
                        gameExp: false,
                        ads: !optOutEnabled,
                        external: false
                    }
                });
            default:
                throw new Error('Unsupported privacy method');
        }
    }

    public static createUnrecorded(): UserPrivacy {
        return new UserPrivacy({
            method: PrivacyMethod.DEFAULT,
            version: 0,
            permissions: this.PERM_ALL_FALSE
        });
    }

    public static permissionsEql(permissions1: IPrivacyPermissions, permissions2: IPrivacyPermissions): boolean {
        const properties = ['ads', 'external', 'gameExp'];
        for (const property of properties) {
            if (permissions1[property] !== permissions2[property]) {
                return false;
            }
        }
        return true;
    }

    constructor(data: IRawUserPrivacy) {
        super('UserPrivacy', {
            method: ['string'],
            version: ['number'],
            permissions: ['object']
        });

        this.set('method', <PrivacyMethod>data.method);
        this.set('version', data.version);
        this.set('permissions', {
            ads: data.permissions.ads,
            external: data.permissions.external,
            gameExp: data.permissions.gameExp
        });
    }

    public isRecorded(): boolean {
        if (!this.getMethod()) {
            return false;
        }
        return this.getMethod() !== PrivacyMethod.DEFAULT;
    }

    public getMethod(): PrivacyMethod {
        return this.get('method');
    }

    public setMethod(method: PrivacyMethod): void {
        this.set('method', method);
    }

    public getVersion(): number {
        return this.get('version');
    }

    public getPermissions(): IPrivacyPermissions {
        return this.get('permissions');
    }

    public setPermissions(permissions: IPrivacyPermissions): void {
        const thesePermissions = this.get('permissions');
        thesePermissions.ads = permissions.ads;
        thesePermissions.external = permissions.external;
        thesePermissions.gameExp = permissions.gameExp;
    }

    public update(data: IUserPrivacy): void {
        this.set('method', data.method);
        this.set('version', data.version);
        this.setPermissions(data.permissions);
    }

    public getDTO(): { [key: string]: unknown } {
        return {
            'method': this.getMethod(),
            'version': this.getVersion(),
            'permissions': this.getPermissions()
        };
    }
}
