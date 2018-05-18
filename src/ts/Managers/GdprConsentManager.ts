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

        this._nativeBridge.Storage.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, data));
    }

    public fetch(): Promise<void> {
        return this._nativeBridge.Storage.get(StorageType.PUBLIC, 'gdpr.consent.value').then((data: any) => {
            if (typeof(data) === 'boolean') {
                this.setConsent(data);
            }
        }).catch((error) => {
            // do nothing
            // error happens when value not found
        });
    }

    private onStorageSet(eventType: string, data: any) {
        if(data && data.gdpr && data.gdpr.consent && typeof(data.gdpr.consent.value) === 'boolean') {
            this.setConsent(data.gdpr.consent.value);
        }
    }

    private setConsent(consent: boolean) {
        this._configuration.setGDPREnabled(true);
        this._configuration.setOptOutEnabled(!consent); // update opt out to reflect the consent choice
        this._configuration.setOptOutRecorded(true); // prevent banner from showing in the future
        // get last state of gdpr consent
        this._nativeBridge.Storage.get(StorageType.PRIVATE, GdprConsentManager.GDPR_LAST_VALUE_STORAGE_KEY).then((consentLastSentToKafka) => {
            // only if consent has changed push to kafka
            if (consentLastSentToKafka !== consent) {
                this.sendGdprEvent(consent);
            }
        }).catch((error) => {
            // there has not been last state of consent
            // IE this is the first consent value we have seen
            // and should push this to kafka
            this.sendGdprEvent(consent);
        });
    }

    private sendGdprEvent(consent: boolean) {
        const action: string = consent ? 'consent' : 'optout';
        OperativeEventManager.sendGDPREvent(action, this._deviceInfo, this._clientInfo, this._configuration).then(() => {
            this._nativeBridge.Storage.set(StorageType.PRIVATE, GdprConsentManager.GDPR_LAST_VALUE_STORAGE_KEY, consent);
            this._nativeBridge.Storage.write(StorageType.PRIVATE);
        });
    }
}
