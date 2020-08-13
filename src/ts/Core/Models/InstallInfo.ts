import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { ISchema, Model } from 'Core/Models/Model';

export interface IInstallInfo {
    idfi: string;
}

/**
 * InstallInfo contains information about the install.
 */
export class InstallInfo extends Model<IInstallInfo> {

    private static _androidSettingsFile = 'uads-instllinfo';
    private static _idfiKey = 'uads-idfi';

    public static Schema: ISchema<IInstallInfo> = {
        idfi: ['string']
    };

    protected _platform: Platform;
    protected _api: ICoreApi;

    constructor(platform: Platform, api: ICoreApi) {
        super('InstallInfo', InstallInfo.Schema);

        this._platform = platform;
        this._api = api;
    }

    /**
     * Fetch and cache all properties.
     */
    public fetch(): Promise<unknown[]> {
        const promises: Promise<unknown>[] = [];
        promises.push(this.getValidIdentifierForInstall().catch(err => this.handleInstallInfoError(err)));
        return Promise.all(promises);
    }

    /**
     * Get Identifier for Install from cached value.
     */
    public getIdentifierForInstall(): string {
        return this.get('idfi');
    }

    /**
     * Get the data transfer object.
     */
    public getDTO(): Promise<{ [key: string]: unknown }> {
        return this.getValidIdentifierForInstall().then(idfi => {
            return {
                'idfi': idfi
            };
        });
    }

    /**
     * Returns the stored idfi, if not found, one is generated and stored.
     */
    private getValidIdentifierForInstall(): Promise<string> {
        return this.getValueFromPreferences(InstallInfo._idfiKey).then(idfi => {
            if (idfi) {
                return idfi;
            } else {
                return this._api.DeviceInfo.getUniqueEventId().then(newIdfi => {
                    this.setValueInPreferences(InstallInfo._idfiKey, newIdfi);
                    return newIdfi;
                });
            }
        }).then(idfi => {
            this.set('idfi', idfi);
            return idfi;
        });
    }

    /**
     * Looks the value up from preferences.  If not found an empty string is returned.
     */
    private getValueFromPreferences(key: string): Promise<string> {
        let nativeIdfiPromise: Promise<string>;
        if (this._platform === Platform.IOS) {
            nativeIdfiPromise = this._api.iOS!.Preferences.getString(key);
        } else {
            nativeIdfiPromise = this._api.Android!.Preferences.getString(InstallInfo._androidSettingsFile, key);
        }
        return nativeIdfiPromise.then(value => {
            if (value === undefined) {
                return Promise.resolve('');
             }
            return Promise.resolve(value);
        }).catch(e => {
            return Promise.resolve('');
         });
    }

    /**
     * Set the value for the key provided in preferences.
     */
    private setValueInPreferences(key: string, value: string): Promise<void> {
        let nativeIdfiPromise: Promise<void>;
        if (this._platform === Platform.IOS) {
            nativeIdfiPromise = this._api.iOS!.Preferences.setString(value.toLowerCase(), key);
        } else {
            nativeIdfiPromise = this._api.Android!.Preferences.setString(InstallInfo._androidSettingsFile, key, value.toLowerCase());
        }
        return nativeIdfiPromise.catch(e => {
            return Promise.reject(e);
        });
    }

    /**
     * Handle errors.
     */
    private handleInstallInfoError(error: unknown) {
        this._api.Sdk.logWarning(JSON.stringify(error));
    }
}
