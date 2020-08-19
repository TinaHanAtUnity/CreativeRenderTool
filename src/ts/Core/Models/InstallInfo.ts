import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { ISchema, Model } from 'Core/Models/Model';

export interface IInstallInfo {
    idfi: string;
}

const ANDROID_SETTINGS_FILE = 'unityads-installinfo';
const IDFI_KEY = 'unityads-idfi';
const COULDNT_GET_VALUE = 'COULDNT_GET_VALUE';

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
        promises.push(this.getPreferenceString(IDFI_KEY)
            .catch(err => this.handlePreferenceError(err))
            .then(idfi => this.verifyIdfi(idfi))
            .then(idfi => this.set('idfi', idfi))
            .catch(err => this.handleInstallInfoError(err)));
        return Promise.all(promises);
    }

    /**
     * Get IDFI (Identifier for Install) from cached value.
     */
    public getIdfi(): string {
        return this.get('idfi');
    }

    /**
     * Get the data transfer object.
     */
    public getDTO(): { [key: string]: unknown } {
        return {
            'idfi': this.get('idfi')
        };
    }

    /**
     * Looks the value up from preferences.
     */
    private getPreferenceString(key: string): Promise<string> {
        if (this._platform === Platform.IOS) {
            return this._api.iOS!.Preferences.getString(key);
        } else if (this._platform === Platform.ANDROID) {
            return this._api.Android!.Preferences.getString(ANDROID_SETTINGS_FILE, key);
        }
        return Promise.reject(new Error('Preferences API is not supported on current platform'));
    }

    /**
     * If preferences rejected the promise due to not finding the key, return an empty string and continue.
     */
    private handlePreferenceError(err: unknown): Promise<string> {
        if (this._platform === Platform.IOS && err === COULDNT_GET_VALUE) {
            return Promise.resolve('');
        } else if (this._platform === Platform.ANDROID) {
            const errList = <string[]>err;
            if (errList.length > 0 && errList[0] === COULDNT_GET_VALUE) {
                return Promise.resolve('');
            }
        }
        return Promise.reject(err);
    }

    /**
     * If the IDFI is empty, generate and save a IDFI, otherwise return.
     */
    private verifyIdfi(idfi: string): Promise<string> {
        if (idfi === '') {
            return this._api.DeviceInfo.getUniqueEventId().then(newIdfi => {
                newIdfi = newIdfi.toLowerCase();
                this.setPreferenceString(IDFI_KEY, newIdfi);
                return newIdfi;
            });
        }
        return Promise.resolve(idfi);
    }

    /**
     * Set the value for the key provided in preferences.
     */
    private setPreferenceString(key: string, value: string): Promise<void> {
        if (this._platform === Platform.IOS) {
            return this._api.iOS!.Preferences.setString(value, key);
        } else if (this._platform === Platform.ANDROID) {
            return this._api.Android!.Preferences.setString(ANDROID_SETTINGS_FILE, key, value);
        }
        return Promise.reject(new Error('Preferences API is not supported on current platform'));
    }

    /**
     * Handle errors.
     */
    private handleInstallInfoError(err: unknown) {
        this._api.Sdk.logError(`InstalledInfo failed due to: ${JSON.stringify(err)}`);
    }
}
