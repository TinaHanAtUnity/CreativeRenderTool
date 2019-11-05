import { Environment } from 'Privacy/Environment';

export interface IPrivacyConfigJson {
    env: { [key: string]: unknown };
    user: { [key: string]: unknown };
    webViewUrl: string;
}

export class PrivacyConfig {
    private _env: Environment;
    private _webViewUrl: string;
    private _userSettings: { [key: string]: unknown };

    constructor(configJson: IPrivacyConfigJson) {
        this._env = new Environment(configJson.env);
        console.log('WEBVIEW_URL: ' + configJson.webViewUrl);
        this._webViewUrl = configJson.webViewUrl;
        this._userSettings = configJson.user;
    }

    public getEnv(): Environment {
        return this._env;
    }

    public getWebViewUrl(): string {
        return this._webViewUrl;
    }

    public getUserSettings(): { [key: string]: unknown } {
        return this._userSettings;
    }
}
