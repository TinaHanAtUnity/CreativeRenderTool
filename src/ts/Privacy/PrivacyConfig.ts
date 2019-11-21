import { IUserPrivacySettings } from 'Privacy/IPrivacySettings';

export interface IPrivacyConfigJson {
    flow: { [key: string]: unknown };
    webViewUrl: string;
}

export class PrivacyConfig {
    private _env: { [key: string]: unknown };
    private _userSettings: IUserPrivacySettings;
    private _configJson: IPrivacyConfigJson;
    private _html: string;

    constructor(configJson: IPrivacyConfigJson, userSettings: IUserPrivacySettings, env: { [key: string]: unknown }, privacyHtml: string) {
        this._env = env;
        this._configJson = configJson;
        this._userSettings = userSettings;
        this._html = privacyHtml;
    }

    public getEnv(): { [key: string]: unknown } {
        return this._env;
    }

    public getFlow(): { [key: string]: unknown } {
        return this._configJson.flow;
    }

    public getWebViewUrl(): string {
        return this._configJson.webViewUrl;
    }

    public getUserSettings(): IUserPrivacySettings {
        return this._userSettings;
    }

    public getHtml(): string {
        return this._html;
    }
}
