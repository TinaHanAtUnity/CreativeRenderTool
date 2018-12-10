import { Model } from 'Core/Models/Model';

export enum PrivacyMethod {
    DEFAULT = 'default',
    LEGITIMATE_INTEREST = 'legitimate_interest',
    UNITY_CONSENT = 'unity_consent',
    DEVELOPER_CONSENT = 'developer_consent'
}

export interface IPrivacy {
    method: PrivacyMethod;
    firstRequest: boolean;
    permissions: IPermissions;
}

export interface IAllPermissions {
    all: boolean;
}

export interface IPersonalizedConsent {
    gameExp: boolean;
    ads: boolean;
    external: boolean;
}

export function isIPersonalizedConsent(consent: IPermissions): consent is IPersonalizedConsent {
  return (<IPersonalizedConsent>consent).gameExp !== undefined;
}

export interface IUnityConsentProfiling {
    profiling: boolean;
}

export type IPermissions = IPersonalizedConsent | IUnityConsentProfiling | IAllPermissions | {};

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
    method: PrivacyMethod; // TODO: should 'default' from PrivacyMethod be allowed?
    privacy: IPermissions;
}

export class UserPrivacy extends Model<IUserPrivacy> {

    constructor(data: any) {
        super('UserPrivacy', {
            method: ['string'],
            privacy: ['object']
        });

        this.set('method', data.method);
        this.set('privacy', data.privacy);
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

    public getPrivacy(): IPermissions {
        return this.get('privacy');
    }

    public setPrivacy(privacy: IPermissions): void {
        return this.set('privacy', privacy);
    }

    public getDTO(): { [key: string]: any } {
        return {
            'method': this.getMethod(),
            'version': this.getVersion()
        };
    }
}
