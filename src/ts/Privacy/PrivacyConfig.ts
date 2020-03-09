import { IUserPrivacySettings } from 'Privacy/IPrivacySettings';

export class PrivacyConfig {
    private _env: { [key: string]: unknown };
    private _userSettings: IUserPrivacySettings;
    private _flow: { [key: string]: unknown };
    private _html: string;

    constructor(flow: { [key: string]: unknown }, userSettings: IUserPrivacySettings, env: { [key: string]: unknown }, privacyHtml: string) {
        this._env = env;
        this._flow = flow;
        this._userSettings = userSettings;
        this._html = privacyHtml;
    }

    public getEnv(): { [key: string]: unknown } {
        return this._env;
    }

    public getFlow(): { [key: string]: unknown } {
        return this._flow;
    }

    public getUserSettings(): IUserPrivacySettings {
        return this._userSettings;
    }

    public getHtml(): string {
        return this._html;
    }
}
