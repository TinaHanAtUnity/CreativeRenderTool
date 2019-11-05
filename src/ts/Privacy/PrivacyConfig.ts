import { Environment } from 'Privacy/Environment';

export interface IPrivacyConfigJson {
    env: { [key: string]: unknown };
    user: { [key: string]: unknown };
    webView: { [key: string]: unknown };
}

export class PrivacyConfig {
    private _env: Environment;

    constructor(configJson: IPrivacyConfigJson) {
        this._env = new Environment(configJson.env);
    }

    public getEnv(): Environment {
        return this._env;
    }
}
