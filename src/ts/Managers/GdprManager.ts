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

    private static GdprLastConsentValueStorageKey = 'gdpr.consentlastsent';
    private static GdprConsentStorageKey = 'gdpr.consent.value';

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

        this._nativeBridge.Storage.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, data));
    }

    public getConsentAndUpdateConfiguration(): Promise<boolean> {
        return this.getConsent().then((consent: boolean) => {
            this.updateConfigurationWithConsent(consent);
            this.pushConsent(consent);
            return consent;
        });
    }

    public pushConsent(consent: boolean): Promise<void> {
        // get last state of gdpr consent
        return this._nativeBridge.Storage.get(StorageType.PRIVATE, GdprManager.GdprLastConsentValueStorageKey).then((consentLastSentToKafka) => {
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

    public retrievePersonalInformation(): Promise<IGdprPersonalProperties> {
        const url = `https://tracking.adsx.unityads.unity3d.com/user-summary?gameId=${this._clientInfo.getGameId()}&adid=${this._deviceInfo.getAdvertisingIdentifier()}&projectId=${this._configuration.getUnityProjectId()}&storeId=${this._deviceInfo.getStores()}`;

        // Test url which should respond with : {"adsSeenInGameThisWeek":27,"gamePlaysThisWeek":39,"installsFromAds":0}
        // const url = `https://tracking.adsx.unityads.unity3d.com/user-summary?gameId=1501434&adid=BC5BAF66-713E-44A5-BE8E-56497B6B6E0A&projectId=567&storeId=google`;
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

    private getConsent(): Promise<boolean> {
        return this._nativeBridge.Storage.get(StorageType.PUBLIC, GdprManager.GdprConsentStorageKey).then((data: any) => {
            const value: boolean | undefined = this.getConsentTypeHack(data);
            if(typeof(value) !== 'undefined') {
                return Promise.resolve(value);
            } else {
                throw new Error('gdpr.consent.value is undefined');
            }
        });
    }

    private updateConfigurationWithConsent(consent: boolean) {
        this._configuration.setGDPREnabled(true);
        this._configuration.setOptOutEnabled(!consent);
        this._configuration.setOptOutRecorded(true);
    }

    private onStorageSet(eventType: string, data: any) {
        if(data && data.gdpr && data.gdpr.consent) {
            const value: boolean | undefined = this.getConsentTypeHack(data.gdpr.consent.value);

            if(typeof(value) !== 'undefined') {
                this.updateConfigurationWithConsent(value);
                this.pushConsent(value);
            }
        }
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

    private sendGdprEvent(consent: boolean): Promise<void> {
        const action: string = consent ? 'consent' : 'optout';
        return OperativeEventManager.sendGDPREvent(action, this._deviceInfo, this._clientInfo, this._configuration).then(() => {
            return this._nativeBridge.Storage.set(StorageType.PRIVATE, GdprManager.GdprLastConsentValueStorageKey, consent).then(() => {
                return this._nativeBridge.Storage.write(StorageType.PRIVATE);
            });
        });
    }
}
