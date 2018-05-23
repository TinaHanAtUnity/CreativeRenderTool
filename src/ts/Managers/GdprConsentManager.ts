import { NativeBridge } from 'Native/NativeBridge';
import { StorageType } from 'Native/Api/Storage';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { Configuration } from 'Models/Configuration';
import { OperativeEventManager } from 'Managers/OperativeEventManager';

export class GdprConsentManager {

    private static GDPR_LAST_VALUE_STORAGE_KEY = 'gdpr.consentlastsent';

    private _nativeBridge: NativeBridge;
    private _deviceInfo: DeviceInfo;
    private _clientInfo: ClientInfo;
    private _configuration: Configuration;

    constructor(nativeBridge: NativeBridge, deviceInfo: DeviceInfo, clientInfo: ClientInfo, configuration: Configuration) {
        this._nativeBridge = nativeBridge;
        this._deviceInfo = deviceInfo;
        this._clientInfo = clientInfo;
        this._configuration = configuration;

        this._nativeBridge.Storage.onSet.subscribe((eventType, data) => {
            return this.onStorageSet(eventType, data).catch((error) => {
                // do nothing
            });
        });
    }

    public fetch(): Promise<void> {
        return this._nativeBridge.Storage.get(StorageType.PUBLIC, 'gdpr.consent.value').then((data: any) => {
            const value: boolean | undefined = this.getConsentTypeHack(data);
            if(typeof(value) !== 'undefined') {
                // don't want to return promise because that will add time to init
                this.setConsent(value);
            }
        }).catch((error) => {
            // do nothing
            // error happens when value not found
        });
    }

    private onStorageSet(eventType: string, data: any): Promise<any> {
        if(data && data.gdpr && data.gdpr.consent) {
            const value: boolean | undefined = this.getConsentTypeHack(data.gdpr.consent.value);

            if(typeof(value) !== 'undefined') {
                return this.setConsent(value);
            }
        }
        return Promise.resolve();
    }

    // Android C# layer will map boolean values to Java primitive boolean types and causes reflection failure
    // with Android Java native layer method that takes Object as value
    // this hack allows anyone use both booleans and string "true" and "false" values
    private getConsentTypeHack(value: any): boolean | undefined {
        if(typeof(value) === 'boolean') {
            return value;
        } else if(typeof(value) === 'string') {
            if(value === 'true') {
                return true;
            } else if(value === 'false') {
                return false;
            }
        }

        return undefined;
    }

    private setConsent(consent: boolean): Promise<any> {
        this._configuration.setGDPREnabled(true);
        this._configuration.setOptOutEnabled(!consent); // update opt out to reflect the consent choice
        this._configuration.setOptOutRecorded(true); // prevent banner from showing in the future
        // get last state of gdpr consent
        return this._nativeBridge.Storage.get(StorageType.PRIVATE, GdprConsentManager.GDPR_LAST_VALUE_STORAGE_KEY).then((consentLastSentToKafka) => {
            // only if consent has changed push to kafka
            if (consentLastSentToKafka !== consent) {
                return this.sendGdprEvent(consent);
            }
        }).catch((error) => {
            // there has not been last state of consent
            // IE this is the first consent value we have seen
            // and should push this to kafka
            return this.sendGdprEvent(consent);
        });
    }

    private sendGdprEvent(consent: boolean): Promise<any> {
        const action: string = consent ? 'consent' : 'optout';
        return OperativeEventManager.sendGDPREvent(action, this._deviceInfo, this._clientInfo, this._configuration).then(() => {
            const setPromise = this._nativeBridge.Storage.set(StorageType.PRIVATE, GdprConsentManager.GDPR_LAST_VALUE_STORAGE_KEY, consent);
            const writePromise = this._nativeBridge.Storage.write(StorageType.PRIVATE);
            return Promise.all([setPromise, writePromise]);
        });
    }
}
