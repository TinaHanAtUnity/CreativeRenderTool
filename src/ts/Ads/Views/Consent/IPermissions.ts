export interface IPermissions {
    all?: boolean;
    personalizedConsent?: IPersonalizedConsent;
    profiling?: boolean;
}

export interface IPersonalizedConsent {
    gameExp: boolean;
    ads: boolean;
    external: boolean;
}
