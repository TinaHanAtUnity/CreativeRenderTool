import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import {
    GamePrivacy,
    IAllPermissions,
    IGranularPermissions,
    IPermissions,
    isUnityConsentPermissions,
    PrivacyMethod,
    UserPrivacy
} from 'Ads/Models/Privacy';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { StorageType } from 'Core/Native/Storage';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { ITemplateData } from 'Core/Views/View';
import { ConsentPage } from 'Ads/Views/Consent/Consent';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';

interface IUserSummary extends ITemplateData {
    deviceModel: string;
    country: string;
    gamePlaysThisWeek: number;
    adsSeenInGameThisWeek: number;
    installsFromAds: number;
}

export enum GDPREventSource {
    METADATA = 'metadata',
    NO_REVIEW = 'no_review',
    USER = 'user'
}

export enum GDPREventAction {
    SKIP = 'skip',
    CONSENT = 'consent',
    OPTOUT = 'optout',
    OPTIN = 'optin'
}

export type UserPrivacyStorageData = { gdpr: { consent: { value: unknown }}};

export class UserPrivacyManager {

    private static GdprLastConsentValueStorageKey = 'gdpr.consentlastsent';
    private static GdprConsentStorageKey = 'gdpr.consent.value';

    private readonly _platform: Platform;
    private readonly _core: ICoreApi;
    private readonly _coreConfig: CoreConfiguration;
    private readonly _adsConfig: AdsConfiguration;
    private readonly _gamePrivacy: GamePrivacy;
    private readonly _userPrivacy: UserPrivacy;
    private readonly _clientInfo: ClientInfo;
    private readonly _deviceInfo: DeviceInfo;
    private readonly _request: RequestManager;

    constructor(platform: Platform, core: ICoreApi, coreConfig: CoreConfiguration, adsConfig: AdsConfiguration, clientInfo: ClientInfo, deviceInfo: DeviceInfo, request: RequestManager) {
        this._platform = platform;
        this._core = core;
        this._coreConfig = coreConfig;
        this._adsConfig = adsConfig;
        this._gamePrivacy = adsConfig.getGamePrivacy();
        this._userPrivacy = adsConfig.getUserPrivacy();
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._request = request;
        this._core.Storage.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, <UserPrivacyStorageData>data));
    }

    public sendGDPREvent(action: GDPREventAction, source?: GDPREventSource): Promise<void> {
        let infoJson: unknown = {
            'adid': this._deviceInfo.getAdvertisingIdentifier(),
            'action': action,
            'projectId': this._coreConfig.getUnityProjectId(),
            'platform': Platform[this._platform].toLowerCase(),
            'country': this._coreConfig.getCountry(),
            'gameId': this._clientInfo.getGameId(),
            'bundleId': this._clientInfo.getApplicationName()
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

    public updateUserPrivacy(permissions: IPermissions, source: GDPREventSource, layout? : ConsentPage): Promise<INativeResponse | void> {
        const gamePrivacy = this._gamePrivacy;

        if (!gamePrivacy.isEnabled() || !isUnityConsentPermissions(permissions)) {
            return Promise.resolve();
        }

        if (gamePrivacy.getMethod() !== PrivacyMethod.UNITY_CONSENT) {
            return Promise.resolve();
        }

        if (source === GDPREventSource.NO_REVIEW) {
            permissions = { all : true };
        }

        const updatedPrivacy = {
            method: gamePrivacy.getMethod(),
            version: gamePrivacy.getVersion(),
            permissions: permissions
        };

        if (!this.hasUserPrivacyChanged(updatedPrivacy)) {
            return Promise.resolve();
        }

        this._userPrivacy.update(updatedPrivacy);
        return this.sendUnityConsentEvent(permissions, source, layout);
    }

    private hasUserPrivacyChanged(updatedPrivacy: { method: PrivacyMethod; version: number; permissions: IPermissions }) {
        const currentPrivacy = this._userPrivacy;
        if (currentPrivacy.getMethod() !== updatedPrivacy.method) {
            return true;
        }

        if (currentPrivacy.getVersion() !== updatedPrivacy.version) {
            return true;
        }

        const currentPermissions = currentPrivacy.getPermissions();
        const updatedPermissions = updatedPrivacy.permissions;

        if ((<IGranularPermissions>currentPermissions).gameExp !== (<IGranularPermissions>updatedPermissions).gameExp) {
            return true;
        }

        if ((<IGranularPermissions>currentPermissions).ads !== (<IGranularPermissions>updatedPermissions).ads) {
            return true;
        }

        if ((<IGranularPermissions>currentPermissions).external !== (<IGranularPermissions>updatedPermissions).external) {
            return true;
        }

        if ((<IAllPermissions>currentPermissions).all !== (<IAllPermissions>updatedPermissions).all) {
            return true;
        }

        return false;
    }

    private sendUnityConsentEvent(permissions: IPermissions, source: GDPREventSource, layout = ''): Promise<INativeResponse> {
        const infoJson: unknown = {
            adid: this._deviceInfo.getAdvertisingIdentifier(),
            group: this._coreConfig.getAbGroup(),
            layout: layout,
            action: GDPREventAction.CONSENT,
            projectId: this._coreConfig.getUnityProjectId(),
            platform: Platform[this._platform].toLowerCase(),
            country: this._coreConfig.getCountry(),
            gameId: this._clientInfo.getGameId(),
            source: source,
            method: PrivacyMethod.UNITY_CONSENT,
            version: this._gamePrivacy.getVersion(),
            coppa: this._coreConfig.isCoppaCompliant(),
            bundleId: this._clientInfo.getApplicationName(),
            permissions: permissions
        };

        if (CustomFeatures.shouldSampleAtOnePercent()) {
            Diagnostics.trigger('consent_send_event', {
                adsConfig: JSON.stringify(this._adsConfig.getDTO()),
                permissions: JSON.stringify(permissions)
            });
        }

        return HttpKafka.sendEvent('ads.events.optout.v1.json', KafkaCommonObjectType.EMPTY, infoJson);
    }

    public getConsentAndUpdateConfiguration(): Promise<boolean> {
        if (this._adsConfig.isGDPREnabled()) {
            // get consent only if gdpr is enabled
            return this.getConsent().then((consent: boolean) => {
                // check gdpr enabled again in case it has changed
                if (this._adsConfig.isGDPREnabled()) {
                    this.updateConfigurationWithConsent(consent);
                    this.pushConsent(consent);
                }
                return consent; // always return consent value
            });
        } else {
            return Promise.reject(new Error('Configuration gdpr is not enabled'));
        }
    }

    public retrieveUserSummary(): Promise<IUserSummary> {
        let url = `https://ads-privacy-api.prd.mz.internal.unity3d.com/api/v1/summary?gameId=${this._clientInfo.getGameId()}&adid=${this._deviceInfo.getAdvertisingIdentifier()}&projectId=${this._coreConfig.getUnityProjectId()}&storeId=${this._deviceInfo.getStores()}`;

        if (this._coreConfig.getTestMode()) {
            url = `https://ads-privacy-api.stg.mz.internal.unity3d.com/api/v1/summary?adid=f2c5a456-229f-49c8-abed-c4047c86f8e7&projectId=24295855-8602-4efc-a30d-a9d84b275eda&storeId=google&gameId=1490325`;
        }

        const personalPayload = {
            deviceModel: this._deviceInfo.getModel(),
            country: this._coreConfig.getCountry()
        };

        return this._request.get(url).then((response) => {
            return {
                ... JsonParser.parse<{ gamePlaysThisWeek: number; adsSeenInGameThisWeek: number; installsFromAds: number }>(response.response),
                ... personalPayload
            };
        }).catch(error => {
            Diagnostics.trigger('gdpr_request_failed', {
                url: url
            });
            this._core.Sdk.logError('Gdpr request failed' + error);
            throw error;
        });
    }

    public isOptOutEnabled(): boolean {
        return this._adsConfig.isOptOutEnabled();
    }

    public getGranularPermissions(): IGranularPermissions {
        const permissions = this._adsConfig.getUserPrivacy().getPermissions();
        if (!isUnityConsentPermissions(permissions)) {
            return {
                gameExp: false,
                ads: false,
                external: false
            };
        }

        if ((<IAllPermissions>permissions).all === true) {
            return {
                gameExp: true,
                ads: true,
                external: true
            };
        } else {
            return <IGranularPermissions>permissions;
        }
    }

    private pushConsent(consent: boolean): Promise<void> {
        // get last state of gdpr consent
        return this._core.Storage.get(StorageType.PRIVATE, UserPrivacyManager.GdprLastConsentValueStorageKey).then((consentLastSentToKafka) => {
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
        return this._core.Storage.get(StorageType.PUBLIC, UserPrivacyManager.GdprConsentStorageKey).then((data: unknown) => {
            const value: boolean | undefined = this.getConsentTypeHack(data);
            if(typeof(value) !== 'undefined') {
                return Promise.resolve(value);
            } else {
                throw new Error('gdpr.consent.value is undefined');
            }
        });
    }

    private updateConfigurationWithConsent(consent: boolean) {
        this._adsConfig.setOptOutEnabled(!consent);
        this._adsConfig.setOptOutRecorded(true);

        const gamePrivacy = this._adsConfig.getGamePrivacy();
        if (gamePrivacy.getMethod() === PrivacyMethod.UNITY_CONSENT) {
            gamePrivacy.setMethod(PrivacyMethod.DEVELOPER_CONSENT);
            const userPrivacy = this._adsConfig.getUserPrivacy();
            userPrivacy.update({
                method: gamePrivacy.getMethod(),
                version: gamePrivacy.getVersion(),
                permissions: {
                    profiling: consent
                }
            });
        }
    }

    private onStorageSet(eventType: string, data: UserPrivacyStorageData) {
        // should only use consent when gdpr is enabled in configuration
        if (this._adsConfig.isGDPREnabled()) {
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
    private getConsentTypeHack(value: unknown): boolean | undefined {
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
            return this._core.Storage.set(StorageType.PRIVATE, UserPrivacyManager.GdprLastConsentValueStorageKey, consent).then(() => {
                return this._core.Storage.write(StorageType.PRIVATE);
            });
        });
    }
}
