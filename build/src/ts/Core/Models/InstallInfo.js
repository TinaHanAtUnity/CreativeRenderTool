import { Platform } from 'Core/Constants/Platform';
import { Model } from 'Core/Models/Model';
const ANDROID_SETTINGS_FILE = 'unityads-installinfo';
const IDFI_KEY = 'unityads-idfi';
const COULDNT_GET_VALUE = 'COULDNT_GET_VALUE';
/**
 * InstallInfo contains information about the install.
 */
export class InstallInfo extends Model {
    constructor(platform, api) {
        super('InstallInfo', InstallInfo.Schema);
        this._platform = platform;
        this._api = api;
    }
    /**
     * Fetch and cache all properties.
     */
    fetch() {
        const promises = [];
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
    getIdfi() {
        return this.get('idfi');
    }
    /**
     * Get the data transfer object.
     */
    getDTO() {
        return {
            'idfi': this.get('idfi')
        };
    }
    /**
     * Looks the value up from preferences.
     */
    getPreferenceString(key) {
        if (this._platform === Platform.IOS) {
            return this._api.iOS.Preferences.getString(key);
        }
        else if (this._platform === Platform.ANDROID) {
            return this._api.Android.Preferences.getString(ANDROID_SETTINGS_FILE, key);
        }
        return Promise.reject(new Error('Preferences API is not supported on current platform'));
    }
    /**
     * If preferences rejected the promise due to not finding the key, return an empty string and continue.
     */
    handlePreferenceError(err) {
        if (this._platform === Platform.IOS && err === COULDNT_GET_VALUE) {
            return Promise.resolve('');
        }
        else if (this._platform === Platform.ANDROID) {
            const errList = err;
            if (errList.length > 0 && errList[0] === COULDNT_GET_VALUE) {
                return Promise.resolve('');
            }
        }
        return Promise.reject(err);
    }
    /**
     * If the IDFI is empty, generate and save a IDFI, otherwise return.
     */
    verifyIdfi(idfi) {
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
    setPreferenceString(key, value) {
        if (this._platform === Platform.IOS) {
            return this._api.iOS.Preferences.setString(value, key);
        }
        else if (this._platform === Platform.ANDROID) {
            return this._api.Android.Preferences.setString(ANDROID_SETTINGS_FILE, key, value);
        }
        return Promise.reject(new Error('Preferences API is not supported on current platform'));
    }
    /**
     * Handle errors.
     */
    handleInstallInfoError(err) {
        this._api.Sdk.logError(`InstalledInfo failed due to: ${JSON.stringify(err)}`);
    }
}
InstallInfo.Schema = {
    idfi: ['string']
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5zdGFsbEluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9Nb2RlbHMvSW5zdGFsbEluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBVyxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQU1uRCxNQUFNLHFCQUFxQixHQUFHLHNCQUFzQixDQUFDO0FBQ3JELE1BQU0sUUFBUSxHQUFHLGVBQWUsQ0FBQztBQUNqQyxNQUFNLGlCQUFpQixHQUFHLG1CQUFtQixDQUFDO0FBRTlDOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFdBQVksU0FBUSxLQUFtQjtJQVFoRCxZQUFZLFFBQWtCLEVBQUUsR0FBYTtRQUN6QyxLQUFLLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV6QyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMxQixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztJQUNwQixDQUFDO0lBRUQ7O09BRUc7SUFDSSxLQUFLO1FBQ1IsTUFBTSxRQUFRLEdBQXVCLEVBQUUsQ0FBQztRQUN4QyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUM7YUFDM0MsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzdDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDcEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVEOztPQUVHO0lBQ0ksT0FBTztRQUNWLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQ7O09BRUc7SUFDSSxNQUFNO1FBQ1QsT0FBTztZQUNILE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztTQUMzQixDQUFDO0lBQ04sQ0FBQztJQUVEOztPQUVHO0lBQ0ssbUJBQW1CLENBQUMsR0FBVztRQUNuQyxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNqQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDcEQ7YUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDLE9BQU8sRUFBRTtZQUM1QyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBUSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDL0U7UUFDRCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsc0RBQXNELENBQUMsQ0FBQyxDQUFDO0lBQzdGLENBQUM7SUFFRDs7T0FFRztJQUNLLHFCQUFxQixDQUFDLEdBQVk7UUFDdEMsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxHQUFHLElBQUksR0FBRyxLQUFLLGlCQUFpQixFQUFFO1lBQzlELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUM5QjthQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUMsT0FBTyxFQUFFO1lBQzVDLE1BQU0sT0FBTyxHQUFhLEdBQUcsQ0FBQztZQUM5QixJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxpQkFBaUIsRUFBRTtnQkFDeEQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQzlCO1NBQ0o7UUFDRCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVEOztPQUVHO0lBQ0ssVUFBVSxDQUFDLElBQVk7UUFDM0IsSUFBSSxJQUFJLEtBQUssRUFBRSxFQUFFO1lBQ2IsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDMUQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDNUMsT0FBTyxPQUFPLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7U0FDTjtRQUNELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRUQ7O09BRUc7SUFDSyxtQkFBbUIsQ0FBQyxHQUFXLEVBQUUsS0FBYTtRQUNsRCxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNqQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQzNEO2FBQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxPQUFPLEVBQUU7WUFDNUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQVEsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN0RjtRQUNELE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxzREFBc0QsQ0FBQyxDQUFDLENBQUM7SUFDN0YsQ0FBQztJQUVEOztPQUVHO0lBQ0ssc0JBQXNCLENBQUMsR0FBWTtRQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0NBQWdDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7O0FBckdhLGtCQUFNLEdBQTBCO0lBQzFDLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQztDQUNuQixDQUFDIn0=