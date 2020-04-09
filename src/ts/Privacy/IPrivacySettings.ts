export interface IPrivacySettings {
    user: IUserPrivacySettings;
    env: { [key: string]: unknown };
}

export interface IUserPrivacySettings {
    ads: boolean;
    external: boolean;
    gameExp: boolean;
    agreedOverAgeLimit: boolean;
    agreementMethod: string;
}

export interface IPrivacyFetchUrlParams {
    url: string;
    property: string;
}
