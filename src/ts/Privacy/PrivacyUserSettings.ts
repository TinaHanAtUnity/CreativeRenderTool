export class PrivacyUserSettings {
    private _userSettings: { [key: string]: unknown };

    constructor(userSettings: { [key: string]: unknown }) {
        this._userSettings = userSettings;
    }

    public getGameExp(): boolean {
        if (this._userSettings.hasOwnProperty('gameExp')) {
            return <boolean>this._userSettings.gamExp;
        }

        return false;
    }

    public getAds(): boolean {
        if (this._userSettings.hasOwnProperty('ads')) {
            return <boolean>this._userSettings.ads;
        }

        return false;
    }

    public getThirdParty(): boolean {
        if (this._userSettings.hasOwnProperty('thirdParty')) {
            return <boolean>this._userSettings.thirdParty;
        }

        return false;
    }

    public getJson(): { [key: string]: unknown } {
        return this._userSettings;
    }
}
