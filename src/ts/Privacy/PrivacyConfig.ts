import { Environment } from 'Privacy/Environment';
import { PrivacyUserSettings } from 'Privacy/PrivacyUserSettings';

export interface IPrivacyConfigJson {
    env: { [key: string]: unknown };
    webViewUrl: string;
}

export class PrivacyConfig {
    private _env: Environment;
    private _webViewUrl: string;
    private _userSettings: PrivacyUserSettings;

    constructor(configJson: IPrivacyConfigJson, userSettings: PrivacyUserSettings) {
        this._env = new Environment(configJson.env);
        this._webViewUrl = configJson.webViewUrl;
        this._userSettings = userSettings;
    }

    public getEnv(): Environment {
        return this._env;
    }

    public getWebViewUrl(): string {
        return this._webViewUrl;
    }

    public getUserSettings(): PrivacyUserSettings {
        return this._userSettings;
    }
}
