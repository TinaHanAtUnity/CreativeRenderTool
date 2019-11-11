import { Environment } from 'Privacy/Environment';
import { PrivacyUserSettings } from 'Privacy/PrivacyUserSettings';

export interface IPrivacyConfigJson {
    env: { [key: string]: unknown };
    flow: { [key: string]: unknown };
    webViewUrl: string;
}

export class PrivacyConfig {
    private _env: Environment;
    private _webViewUrl: string;
    private _userSettings: PrivacyUserSettings;
    private _flow: { [key: string]: unknown };

    constructor(configJson: IPrivacyConfigJson, userSettings: PrivacyUserSettings) {
        this._env = new Environment(configJson.env);
        this._webViewUrl = configJson.webViewUrl;
        this._userSettings = userSettings;
        this._flow = configJson.flow;
    }

    public getEnv(): Environment {
        return this._env;
    }

    public getFlow(): { [key: string]: unknown } {
        return this._flow;
    }

    public getWebViewUrl(): string {
        return this._webViewUrl;
    }

    public getUserSettings(): PrivacyUserSettings {
        return this._userSettings;
    }
}
