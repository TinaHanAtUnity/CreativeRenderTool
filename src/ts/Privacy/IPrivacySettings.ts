import { AgeGateChoice } from 'Ads/Managers/UserPrivacyManager';

export interface IPrivacySettings {
    user: IUserPrivacySettings;
    env: { [key: string]: unknown };
}

export interface IUserPrivacySettings {
    ads: boolean;
    external: boolean;
    gameExp: boolean;
    ageGateChoice: AgeGateChoice;
    agreementMethod: string;
}
