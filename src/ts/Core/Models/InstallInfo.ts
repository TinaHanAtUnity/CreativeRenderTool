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
        promises.push(this.getPreferenceString(idfiKey)
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
     * If the IDFI is undefined or empty, generate and save a IDFI, otherwise return.
     */
    private verifyIdfi(idfi: string): Promise<string> {
        if (idfi === undefined || idfi === '') {
            return this._api.DeviceInfo.getUniqueEventId().then(newIdfi => {
                this.setPreferenceString(idfiKey, newIdfi);
                return newIdfi;
            });
        }
        return Promise.resolve(idfi);
    }

    /**
     * Looks the value up from preferences.  If not found an empty string is returned.
     */
    private getPreferenceString(key: string): Promise<string> {
        // const handleNotFound = ((e: any | undefined) => {
        //     if ( e === null || e === undefined || e === getStringNotFoundError) {
        //         return Promise.resolve('');
        //     }
        //     return Promise.reject(new Error(e));
        // });

        const handleNotFound = ((e: string) => {
            if (e === getStringNotFoundError) {
                return Promise.resolve('');
            }
            return Promise.reject(new Error(e));
        });

        if (this._platform === Platform.IOS) {
            return this._api.iOS!.Preferences.getString(key).catch(handleNotFound);
        } else if (this._platform === Platform.ANDROID) {
            return this._api.Android!.Preferences.getString(androidSettingsFile, key).catch(handleNotFound);
        }
        return Promise.reject(new Error('Preferences API is not supported on current platform'));
    }

    /**
     * Set the value for the key provided in preferences.
     */
    private setPreferenceString(key: string, value: string): Promise<void> {
        if (this._platform === Platform.IOS) {
            return this._api.iOS!.Preferences.setString(value.toLowerCase(), key);
        } else if (this._platform === Platform.ANDROID) {
            return this._api.Android!.Preferences.setString(androidSettingsFile, key, value.toLowerCase());
        }
        return Promise.reject(new Error('Preferences API is not supported on current platform'));
    }

    /**
     * Handle errors.
     */
    private handleInstallInfoError(error: unknown): Promise<unknown> {
        this._api.Sdk.logError(`InstalledInfo failed due to reason: ${error}`);
        return Promise.reject(error);
    }
}
