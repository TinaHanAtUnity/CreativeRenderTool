import { ClientInfo } from 'Models/ClientInfo';
import { Configuration } from 'Models/Configuration';
import { DeviceInfo } from 'Models/DeviceInfo';
import { StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';
import { Diagnostics } from 'Utilities/Diagnostics';
import { JsonParser } from 'Utilities/JsonParser';
import { Request } from 'Utilities/Request';
import { Platform } from 'Constants/Platform';
import { HttpKafka, KafkaCommonObjectType } from 'Utilities/HttpKafka';

export interface IGdprPersonalProperties {
    deviceModel: string;
    country: string;
    gamePlaysThisWeek: number;
    adsSeenInGameThisWeek: number;
    installsFromAds: number;
}

export enum GDPREventSource {
    METADATA = 'metadata',
    USER = 'user'
}

export enum GDPREventAction {
    SKIP = 'skip',
    CONSENT = 'consent',
    OPTOUT = 'optout',
    OPTIN = 'optin'
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

    public sendGDPREvent(action: GDPREventAction, source?: GDPREventSource): Promise<void> {
        let infoJson: any = {
            'adid': this._deviceInfo.getAdvertisingIdentifier(),
            'action': action,
            'projectId': this._configuration.getUnityProjectId(),
            'platform': Platform[this._clientInfo.getPlatform()].toLowerCase(),
            'gameId': this._clientInfo.getGameId()
        };
        if (source) {
            infoJson = {
                ... infoJson,
                'source': source
            };
        }

        return HttpKafka.sendEvent('ads.events.optout.v1.json', KafkaCommonObjectType.EMPTY, infoJson).then(() => {
            return Promise.resolve();
        });
    }

    public getConsentAndUpdateConfiguration(): Promise<boolean> {
        if (this._configuration.isGDPREnabled()) {
            // get consent only if gdpr is enabled
            return this.getConsent().then((consent: boolean) => {
                // check gdpr enabled again in case it has changed
                if (this._configuration.isGDPREnabled()) {
                    this.updateConfigurationWithConsent(consent);
                    this.pushConsent(consent);
                }
                return consent; // always return consent value
            });
        } else {
            return Promise.reject(new Error('Configuration gdpr is not enabled'));
        }
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

    private pushConsent(consent: boolean): Promise<void> {
        // get last state of gdpr consent
        return this._nativeBridge.Storage.get(StorageType.PRIVATE, GdprManager.GdprLastConsentValueStorageKey).then((consentLastSentToKafka) => {
            // only if consent has changed push to kafka
            if (consentLastSentToKafka !== consent) {
                return this.sendGdprConsentEvent(consent);
            }
        }).catch((error) => {
            // there has not been last state of consent
            // IE this is the first consent value we have seen
            // and should push this to kafka
            return this.sendGdprConsentEvent(consent);
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
        this._configuration.setOptOutEnabled(!consent);
        this._configuration.setOptOutRecorded(true);
    }

    private onStorageSet(eventType: string, data: any) {
        // should only use consent when gdpr is enabled in configuration
        if (this._configuration.isGDPREnabled()) {
            if(data && data.gdpr && data.gdpr.consent) {
                const value: boolean | undefined = this.getConsentTypeHack(data.gdpr.consent.value);

                if(typeof(value) !== 'undefined') {
                    this.updateConfigurationWithConsent(value);
                    this.pushConsent(value);
                }
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

    private sendGdprConsentEvent(consent: boolean): Promise<void> {
        let sendEvent;
        if (consent) {
            sendEvent = this.sendGDPREvent(GDPREventAction.CONSENT);
        } else {
            // optout needs to send the source because we need to tell if it came from consent metadata or gdpr  banner
            sendEvent = this.sendGDPREvent(GDPREventAction.OPTOUT, GDPREventSource.METADATA);
        }
        return sendEvent.then(() => {
            return this._nativeBridge.Storage.set(StorageType.PRIVATE, GdprManager.GdprLastConsentValueStorageKey, consent).then(() => {
                return this._nativeBridge.Storage.write(StorageType.PRIVATE);
            });
        });
    }
}
