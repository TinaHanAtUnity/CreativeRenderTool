import { AgeGateChoice } from 'Ads/Managers/UserPrivacyManager';

export interface IUserPrivacySettings {
    ads: boolean;
    external: boolean;
    gameExp: boolean;
    ageGateChoice: AgeGateChoice;
    agreementMethod: string;
}

export interface IPrivacyCompletedParams {
    user: IUserPrivacySettings;
    error?: string;
}

export interface IPrivacyFetchUrlParams {
    url: string;
    property: string;
}
