export class Environment extends PrivacyTemplate {
    private _env: { [key: string]: unknown };

    constructor (env: { [key: string]: unknown }) {
        super();
        this._env = env;
    }

    public getJson(): { [key: string]: unknown } {
        const retObj: { [key: string]: unknown } = {};
        if (this._env) {
            Object.keys(retObj).forEach(key => {
                retObj[key] = this.getValueFor(this._env[key]);
            });
        }

        return retObj;
    }
}
