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

export interface IGranularPermissions {
    gameExp: boolean;
    ads: boolean;
    external: boolean;
}

type IUnityConsentPermissions = IGranularPermissions;

export function isUnityConsentPermissions(permissions: IPermissions): permissions is IUnityConsentPermissions {
    return ((<IGranularPermissions>permissions).gameExp !== undefined &&
        (<IGranularPermissions>permissions).ads !== undefined &&
        (<IGranularPermissions>permissions).external !== undefined);
}

export interface IProfilingPermissions {
    profiling: boolean;
}

export type IPermissions = IUnityConsentPermissions;

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

    public isEnabled(): boolean {
        // TODO: add support for other privacy methods
        return this.getMethod() === PrivacyMethod.UNITY_CONSENT;
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
    permissions: IPermissions;
    agreedAll: boolean;
}

interface IUserPrivacy {
    method: PrivacyMethod;
    version: number;
    permissions: IPermissions;
    agreedAll: boolean;
}

export class UserPrivacy extends Model<IUserPrivacy> {
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
                    agreedAll: false,
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
            agreedAll: false,
            permissions: {
                gameExp: false,
                ads: false,
                external: false
            }
        });
    }

    constructor(data: IRawUserPrivacy) {
        super('UserPrivacy', {
            method: ['string'],
            version: ['number'],
            permissions: ['object'],
            agreedAll: ['boolean']
        });

        this.set('method', <PrivacyMethod>data.method);
        this.set('version', data.version);
        this.set('permissions', data.permissions);
        this.set('agreedAll', data.agreedAll);
    }

    public isRecorded(): boolean {
        return this.getMethod() !== PrivacyMethod.DEFAULT;
    }

    public getMethod(): PrivacyMethod {
        return this.get('method');
    }

    public getVersion(): number {
        return this.get('version');
    }

    public getPermissions(): IPermissions {
        return this.get('permissions');
    }

    public update(data: IUserPrivacy): void {
        this.set('method', data.method);
        this.set('version', data.version);
        this.set('permissions', data.permissions);
    }

    public getDTO(): { [key: string]: unknown } {
        return {
            'method': this.getMethod(),
            'version': this.getVersion(),
            'permissions': this.getPermissions()
        };
    }
}
