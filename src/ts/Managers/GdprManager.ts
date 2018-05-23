import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import { Configuration } from 'Models/Configuration';
import { DeviceInfo } from 'Models/DeviceInfo';
import { StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';
import { Diagnostics } from 'Utilities/Diagnostics';
import { JsonParser } from 'Utilities/JsonParser';
import { Request } from 'Utilities/Request';

export interface IGdprPersonalProperties {
    deviceModel: string;
    country: string;
    gamePlaysThisWeek: number;
    adsSeenInGameThisWeek: number;
    installsFromAds: number;
}
export class GdprManager {

    private static GDPR_LAST_VALUE_STORAGE_KEY = 'gdpr.consentlastsent';

    private _nativeBridge: NativeBridge;
    private _deviceInfo: DeviceInfo;
    private _clientInfo: ClientInfo;
    private _configuration: Configuration;
    private _request: Request;

    constructor(nativeBridge: NativeBridge, deviceInfo: DeviceInfo, clientInfo: ClientInfo, configuration: Configuration, request: Request) {
        this._nativeBridge = nativeBridge;
        this._deviceInfo = deviceInfo;
        this._clientInfo = clientInfo;
        this._configuration = configuration;
        this._request = request;

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

    public retrievePersonalInformation(): Promise<IGdprPersonalProperties> {
        const url = `https://tracking.adsx.unityads.unity3d.com/user-summary?gamerId=${this._configuration.getGamerId()}&gameId=${this._clientInfo.getGameId()}&projectId=${this._configuration.getUnityProjectId()}&storeId=${this._deviceInfo.getStores()}`;

        // Test URL with values 10, 10 , and 8.
        // const url = 'https://tracking.adsx.unityads.unity3d.com/user-summary?gameId=1468809&gamerId=5803c822936c882311570f92&projectId=567&storeId=google';

        const personalPayload = {
            deviceModel: this._deviceInfo.getModel(),
            country: this._configuration.getCountry()
        };

        return this._request.get(url).then((response) => {
            return {
                ... JsonParser.parse(response.response),
                ... personalPayload
            };
        }).catch(error => {
            Diagnostics.trigger('gdpr_request_failed', {
                url: url
            });
            this._nativeBridge.Sdk.logError('Gdpr request failed' + error);
            throw error;
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
        return this._nativeBridge.Storage.get(StorageType.PRIVATE, GdprManager.GDPR_LAST_VALUE_STORAGE_KEY).then((consentLastSentToKafka) => {
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
            const setPromise = this._nativeBridge.Storage.set(StorageType.PRIVATE, GdprManager.GDPR_LAST_VALUE_STORAGE_KEY, consent);
            const writePromise = this._nativeBridge.Storage.write(StorageType.PRIVATE);
            return Promise.all([setPromise, writePromise]);
        });
    }
}
