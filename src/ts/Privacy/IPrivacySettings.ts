export interface IPrivacySettings {
    user: IUserPrivacySettings;
    env: { [key: string]: unknown };
    lastInteraction: IUserLastInteraction;
}

export interface IUserPrivacySettings {
    ads: boolean;
    external: boolean;
    gameExp: boolean;
    agreedOverAgeLimit: boolean;
}

export interface IUserLastInteraction {
    id: string;
    type: string;
    timestamp: string;
}