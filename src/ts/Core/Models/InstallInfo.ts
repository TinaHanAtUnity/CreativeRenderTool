import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { ISchema, Model } from 'Core/Models/Model';

export interface IInstallInfo {
    idfi: string;
}

const androidSettingsFile = 'unityads-installinfo';
const idfiKey = 'unityads-idfi';
const getStringNotFoundError = 'COULDNT_GET_VALUE';

/**
 * InstallInfo contains information about the install.
 */
export class InstallInfo extends Model<IInstallInfo> {
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
     * Returns the stored idfi, if not found, one is generated and stored and returned.
     */
    private getValidIdentifierForInstall(): Promise<string> {
        return this.getPreferenceString(idfiKey).then(idfi => {
            if (idfi !== '') {
                return idfi;
            }
            return '';
        }).catch(e => {
            if (e === getStringNotFoundError) {
                return Promise.resolve('');
            }
            return Promise.reject(e);
        }).then(idfi => {
            if (idfi === '') {
                return this._api.DeviceInfo.getUniqueEventId().then(newIdfi => {
                    this.setPreferenceString(idfiKey, newIdfi);
                    return newIdfi;
                });
            }
            return Promise.resolve(idfi);
        }).then(idfi => {
            this.set('idfi', idfi);
            return idfi;
        });
    }

    /**
     * Looks the value up from preferences.  If not found an empty string is returned.
     */
    private getPreferenceString(key: string): Promise<string> {
        if (this._platform === Platform.IOS) {
           return this._api.iOS!.Preferences.getString(key);
        } else if (this._platform === Platform.ANDROID) {
            return this._api.Android!.Preferences.getString(androidSettingsFile, key);
        }
        return Promise.reject(new Error('Preferences API is not supported on current platform'));
    }

    /**
     * Set the value for the key provided in preferences.
     */
    private setPreferenceString(key: string, value: string): Promise<void> {
        let nativeIdfiPromise: Promise<void>;
        if (this._platform === Platform.IOS) {
            nativeIdfiPromise = this._api.iOS!.Preferences.setString(value.toLowerCase(), key);
        } else {
            nativeIdfiPromise = this._api.Android!.Preferences.setString(androidSettingsFile, key, value.toLowerCase());
        }
        return nativeIdfiPromise.catch(e => {
            return Promise.reject(e);
        });
    }

    /**
     * Handle errors.
     */
    private handleInstallInfoError(error: unknown) {
        this._api.Sdk.logError(`InstalledInfo failed due to reason: ${error}`);
    }
}
