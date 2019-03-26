import { Model } from 'Core/Models/Model';

export enum PrivacyMethod {
    DEFAULT = 'default',
    LEGITIMATE_INTEREST = 'legitimate_interest',
    UNITY_CONSENT = 'unity_consent',
    DEVELOPER_CONSENT = 'developer_consent'
}

export interface IAllPermissions {
    all: true;
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

export type IPermissions = IUnityConsentPermissions | IProfilingPermissions;

const CurrentUnityConsentVersion = 20181106;

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
}

interface IUserPrivacy {
    method: PrivacyMethod;
    version: number;
    permissions: IPermissions;
}

export class UserPrivacy extends Model<IUserPrivacy> {

    constructor(data: IRawUserPrivacy) {
        super('UserPrivacy', {
            method: ['string'],
            version: ['number'],
            permissions: ['object']
        });

        this.set('method', <PrivacyMethod>data.method);
        this.set('version', data.version);
        this.set('permissions', data.permissions);
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

    public clear(): void {
        this.set('method', PrivacyMethod.DEFAULT);
        this.set('version', 0);
        this.set('permissions', { profiling: false });
    }

    public getDTO(): { [key: string]: unknown } {
        return {
            'method': this.getMethod(),
            'version': this.getVersion(),
            'permissions': this.getPermissions()
        };
    }
}
