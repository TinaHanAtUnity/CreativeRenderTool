export interface IPermissions {
    all?: true;
    personalizedConsent?: IPersonalizedConsent;
    profiling?: boolean;
}

export interface IPersonalizedConsent {
    gameExp: boolean;
    ads: boolean;
    external: boolean;
}
