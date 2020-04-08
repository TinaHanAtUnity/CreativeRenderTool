export interface IPrivacyCompletedParams {
    user: IUserPrivacySettings;
    error?: string;
}

export interface IUserPrivacySettings {
    ads: boolean;
    external: boolean;
    gameExp: boolean;
    agreedOverAgeLimit: boolean;
    agreementMethod: string;
}
