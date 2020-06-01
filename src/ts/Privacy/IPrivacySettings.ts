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

export interface IPrivacyReadyCallbackParams {
    locale: { [key: string]: unknown };
    startNode: string;
    nodes: { [key: string]: unknown };
    state: {
        env: { [key: string]: unknown };
        user: IUserPrivacySettings;
    };
}

export interface IPrivacyFetchUrlParams {
    url: string;
    property: string;
}
