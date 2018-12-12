import { Model } from 'Core/Models/Model';

export enum PrivacyMethod {
    DEFAULT = 'default',
    LEGITIMATE_INTEREST = 'legitimate_interest',
    UNITY_CONSENT = 'unity_consent',
    DEVELOPER_CONSENT = 'developer_consent'
}

export interface IRequestPrivacy {
    method: PrivacyMethod;
    firstRequest: boolean;
    permissions: IPermissions;
}

export interface IAllPermissions {
    all: boolean;
}

export interface IGranularPermissions {
    gameExp: boolean;
    ads: boolean;
    external: boolean;
}

type IUnityConsentPermissions = IAllPermissions | IGranularPermissions;

export function isUnityConsentPermissions(permissions: IPermissions): permissions is IUnityConsentPermissions {
    return (<IAllPermissions>permissions).all === true || (
        (<IGranularPermissions>permissions).gameExp !== undefined &&
        (<IGranularPermissions>permissions).ads !== undefined &&
        (<IGranularPermissions>permissions).external !== undefined);
}

export interface IProfilingPermissions {
    profiling: boolean;
}

export type IPermissions = IAllPermissions | IGranularPermissions | IProfilingPermissions | {};

const CurrentUnityConsentVersion = 20181106;

interface IGamePrivacy {
    method: PrivacyMethod;
}

export class GamePrivacy extends Model<IGamePrivacy> {

    constructor(data: any) {
        super('GamePrivacy', {
            method: ['string']
        });

        this.set('method', data.method);
    }

    public isEnabled(): boolean {
        // TODO: add support for other privacy methods
        return this.getMethod() === PrivacyMethod.UNITY_CONSENT;
    }

    public getMethod(): PrivacyMethod {
        return this.get('method');
    }

    public getVersion(): number {
        if (this.getMethod() === PrivacyMethod.UNITY_CONSENT) {
            return CurrentUnityConsentVersion;
        }
        return 0;
    }

    public getDTO(): { [key: string]: any } {
        return {
            'method': this.getMethod(),
            'version': this.getVersion()
        };
    }
}

interface IUserPrivacy {
    method: PrivacyMethod;
    version: number;
    permissions: IPermissions;
}

export class UserPrivacy extends Model<IUserPrivacy> {

    constructor(data: any) {
        super('UserPrivacy', {
            method: ['string'],
            version: ['number'],
            permissions: ['object']
        });

        this.set('method', data.method);
        this.set('version', data.version);
        this.set('permissions', data.permissions);
    }

    public isEnabled(): boolean {
        return this.getMethod() === PrivacyMethod.UNITY_CONSENT;
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

    public setPermissions(permissions: IPermissions): void {
        return this.set('permissions', permissions);
    }

    public getDTO(): { [key: string]: unknown } {
        return {
            'method': this.getMethod(),
            'version': this.getVersion()
        };
    }
}
