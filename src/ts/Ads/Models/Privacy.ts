import { Model } from 'Core/Models/Model';

export enum PrivacyMethod {
    DISABLED = 'disabled',
    LEGITIMATE_INTEREST = 'legitimate_interest',
    UNITY_CONSENT = 'unity_consent',
    DEVELOPER_CONSENT = 'developer_consent'
}

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
