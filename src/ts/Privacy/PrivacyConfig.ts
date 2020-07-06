import { IUserPrivacySettings } from 'Privacy/IPrivacySettings';

export class PrivacyConfig {
    private _env: { [key: string]: unknown };
    private _userSettings: IUserPrivacySettings;
    private _flow: { [key: string]: unknown };
    private _html: string;
    private _startNode: string;
    private _locale: { [key: string]: unknown };

    constructor(env: { [key: string]: unknown },
                userSettings: IUserPrivacySettings,
                startNode: string,
                privacyHtml: string,
                flow: { [key: string]: unknown },
                locale: { [key: string]: unknown }) {
        this._env = env;
        this._userSettings = userSettings;
        this._startNode = startNode;
        this._html = privacyHtml;
        this._flow = flow;
        this._locale = locale;
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

    public getStartNode(): string {
        return this._startNode;
    }

    public getLocale(): { [key: string]: unknown } {
        return this._locale;
    }
}
