import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import {
    GamePrivacy,
    IGranularPermissions,
    IPermissions,
    isUnityConsentPermissions,
    PrivacyMethod, UserPrivacy
} from 'Privacy/Privacy';
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
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { PrivacyEvent, PrivacyMetrics } from 'Privacy/PrivacyMetrics';

interface IUserSummary extends ITemplateData {
    deviceModel: string;
    country: string;
    gamePlaysThisWeek: number;
    adsSeenInGameThisWeek: number;
    installsFromAds: number;
}

export enum GDPREventSource {
    DEVELOPER = 'developer',
    USER_INDIRECT = 'user_indirect',
    USER = 'user',
    SDK_SANITIZATION = 'sdk_sanitization'
}

export enum GDPREventAction {
    SKIP = 'skip',
    CONSENT = 'consent',
    OPTOUT = 'optout',
    OPTIN = 'optin',
    TODO_MISSING_ACTION = 'todo_missing_action'
}

export enum LegalFramework {
    DEFAULT = 'default',
    GDPR = 'gdpr', // EU
    CCPA = 'ccpa', // California
    TC260 = 'tc260' // China
}

export enum AgeGateChoice {
    MISSING = 'missing',
    YES = 'yes',
    NO = 'no'
}

export interface IUserPrivacyStorageData {
    gdpr: {
        consent: {
            value: unknown;
        };
    };
}

export class UserPrivacyManager {

    private static GdprLastConsentValueStorageKey = 'gdpr.consentlastsent';
    private static GdprConsentStorageKey = 'gdpr.consent.value';
    private static AgeGateChoiceStorageKey = 'privacy.agegateunderagelimit';

    private readonly _platform: Platform;
    private readonly _core: ICoreApi;
    private readonly _coreConfig: CoreConfiguration;
    private readonly _adsConfig: AdsConfiguration;
    private readonly _privacy: PrivacySDK;
    private readonly _userPrivacy: UserPrivacy;
    private readonly _gamePrivacy: GamePrivacy;

    private readonly _clientInfo: ClientInfo;
    private readonly _deviceInfo: DeviceInfo;
    private readonly _request: RequestManager;
    private _ageGateChoice: AgeGateChoice = AgeGateChoice.MISSING;

    constructor(platform: Platform, core: ICoreApi, coreConfig: CoreConfiguration, adsConfig: AdsConfiguration, clientInfo: ClientInfo, deviceInfo: DeviceInfo, request: RequestManager, privacy: PrivacySDK) {
        this._platform = platform;
        this._core = core;
        this._coreConfig = coreConfig;
        this._adsConfig = adsConfig;
        this._privacy = privacy;
        this._userPrivacy = privacy.getUserPrivacy();
        this._gamePrivacy = privacy.getGamePrivacy();
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._request = request;
        this._core.Storage.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, <IUserPrivacyStorageData>data));
    }

    public sendGDPREvent(action: GDPREventAction, source?: GDPREventSource): Promise<void> {
        let infoJson: unknown = {
            'v': 1,
            'adid': this._deviceInfo.getAdvertisingIdentifier(),
            'action': action,
            'projectId': this._coreConfig.getUnityProjectId(),
            'platform': Platform[this._platform].toLowerCase(),
            'country': this._coreConfig.getCountry(),
            'gameId': this._clientInfo.getGameId(),
            'bundleId': this._clientInfo.getApplicationName(),
            'legalFramework': this._privacy.getLegalFramework(),
            'agreedOverAgeLimit': this._ageGateChoice
        };
        if (source) {
            infoJson = {
                ... infoJson,
                'source': source
            };
        }

        return HttpKafka.sendEvent('ads.events.optout.v1.json', KafkaCommonObjectType.EMPTY, infoJson).then(() => {
            if (this._privacy.isAgeGateEnabled()) {
                Diagnostics.trigger('age_gate_httpkafka_success', {
                    action: action,
                    legalFramework: this._privacy.getLegalFramework(),
                    method: this._gamePrivacy.getMethod(),
                    previousChoice: this._ageGateChoice
                });
            }
            return Promise.resolve();
        }).catch(() => {
            if (this._privacy.isAgeGateEnabled()) {
                Diagnostics.trigger('age_gate_httpkafka_failure', {
                    action: action,
                    legalFramework: this._privacy.getLegalFramework(),
                    method: this._gamePrivacy.getMethod(),
                    previousChoice: this._ageGateChoice
                });
            }
        });
    }

    public updateUserPrivacy(permissions: IPermissions, source: GDPREventSource, action: GDPREventAction, layout? : ConsentPage, agreedAll: boolean = false): Promise<INativeResponse | void> {
        const gamePrivacy = this._gamePrivacy;
        const firstRequest = !this._userPrivacy.isRecorded();

        if (!gamePrivacy.isEnabled() || !isUnityConsentPermissions(permissions)) {
            return Promise.resolve();
        }

        if (source === GDPREventSource.USER_INDIRECT) {
            permissions = {ads: true, gameExp: true, external: true};
            agreedAll = true;
        }

        const updatedPrivacy = {
            method: gamePrivacy.getMethod(),
            version: gamePrivacy.getVersion(),
            agreedAll: agreedAll,
            permissions: permissions
        };

        if (!this.hasUserPrivacyChanged(updatedPrivacy)) {
            return Promise.resolve();
        }

        this._userPrivacy.update(updatedPrivacy);
        return this.sendPrivacyEvent(permissions, source, action, layout, agreedAll, firstRequest);
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

        if (currentPermissions.gameExp !== updatedPermissions.gameExp) {
            return true;
        }

        if (currentPermissions.ads !== updatedPermissions.ads) {
            return true;
        }

        if (currentPermissions.external !== updatedPermissions.external) {
            return true;
        }
        return false;
    }

    private sendPrivacyEvent(permissions: IPermissions, source: GDPREventSource, action: GDPREventAction, layout = '', agreedAll: boolean, firstRequest: boolean): Promise<INativeResponse> {
        const infoJson: unknown = {
            'v': 2,
            adid: this._deviceInfo.getAdvertisingIdentifier(),
            group: this._coreConfig.getAbGroup(),
            layout: layout,
            action: action,
            projectId: this._coreConfig.getUnityProjectId(),
            platform: Platform[this._platform].toLowerCase(),
            country: this._coreConfig.getCountry(),
            gameId: this._clientInfo.getGameId(),
            source: source,
            method: this._gamePrivacy.getMethod(),
            agreedVersion: this._gamePrivacy.getVersion(),
            coppa: this._coreConfig.isCoppaCompliant(),
            firstRequest: firstRequest,
            agreedAll: agreedAll,
            bundleId: this._clientInfo.getApplicationName(),
            permissions: permissions,
            legalFramework: this._privacy.getLegalFramework(),
            agreedOverAgeLimit: this._ageGateChoice
        };

        if (CustomFeatures.sampleAtGivenPercent(1)) {
            Diagnostics.trigger('consent_send_event', {
                adsConfig: JSON.stringify(this._adsConfig.getDTO()),
                permissions: JSON.stringify(permissions)
            });
        }

        return HttpKafka.sendEvent('ads.events.optout.v1.json', KafkaCommonObjectType.EMPTY, infoJson);
    }

    public getConsentAndUpdateConfiguration(): Promise<boolean> {
        if (this._privacy.isGDPREnabled()) {
            this.initAgeGateChoice();

            // get consent only if gdpr is enabled
            return this.getConsent().then((consent: boolean) => {
                // check gdpr enabled again in case it has changed
                if (this._privacy.isGDPREnabled()) {
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
        return this._privacy.isOptOutEnabled();
    }

    // TODO-jon: Refactor away this method, should not be needed anymore
    public getGranularPermissions(): IGranularPermissions {
        return this._privacy.getUserPrivacy().getPermissions();
    }

    public setUsersAgeGateChoice(ageGateChoice: AgeGateChoice) {
        if (ageGateChoice === AgeGateChoice.YES) {
            PrivacyMetrics.trigger(PrivacyEvent.AGE_GATE_PASS);
        } else if (ageGateChoice === AgeGateChoice.NO) {
            PrivacyMetrics.trigger(PrivacyEvent.AGE_GATE_NOT_PASSED);
        }

        this._ageGateChoice = ageGateChoice;

        this._core.Storage.set(StorageType.PRIVATE, UserPrivacyManager.AgeGateChoiceStorageKey, this.isUserUnderAgeLimit()).then(() => {
            this._core.Storage.write(StorageType.PRIVATE);
        });
    }

    public isUserUnderAgeLimit(): boolean {
        if (this._privacy.isAgeGateEnabled() && this._ageGateChoice === AgeGateChoice.NO) {
            return true;
        }
        return false;
    }

    public getAgeGateChoice(): AgeGateChoice {
        return this._ageGateChoice;
    }

    // this is a hack that will force resync age gate opt-out settings
    public fixAgeGateSync(): void {
        // if recorded choice is yes, then choice will be recorded when new ad goes through opt-out flow
        if (this._privacy.isAgeGateEnabled() && this._ageGateChoice === AgeGateChoice.NO) {
            // negative choice means opt-out message has not been recorded and new event should be sent
            this._privacy.setOptOutRecorded(true);
            this._privacy.setOptOutEnabled(true);

            if (this._userPrivacy) {
                this._userPrivacy.update({
                    method: this._gamePrivacy.getMethod(),
                    version: 0,
                    agreedAll: false,
                    permissions: {
                        ads: false,
                        external: false,
                        gameExp: false
                    }
                });
            }

            this.sendGDPREvent(GDPREventAction.OPTOUT, GDPREventSource.USER);

            Diagnostics.trigger('age_gate_desync_no', {
                legalFramework: this._privacy.getLegalFramework(),
                method: this._gamePrivacy.getMethod(),
                previousChoice: this._ageGateChoice
            });
        } else if (this._privacy.isAgeGateEnabled() && this._ageGateChoice === AgeGateChoice.YES) {
            Diagnostics.trigger('age_gate_desync_yes', {
                legalFramework: this._privacy.getLegalFramework(),
                method: this._gamePrivacy.getMethod(),
                previousChoice: this._ageGateChoice
            });
        }
    }

    public isConsentShowRequired(): boolean {
        if (this.isAgeGateShowRequired()) {
            return true;
        }

        if (!this._gamePrivacy.isEnabled() && this._gamePrivacy.getMethod() !== PrivacyMethod.UNITY_CONSENT) {
            return false;
        }

        if (!this._userPrivacy.isRecorded()) {
            return true;
        }

        const methodChangedSinceConsent = this._gamePrivacy.getMethod() !== this._userPrivacy.getMethod();
        const versionUpdatedSinceConsent = this._gamePrivacy.getVersion() > this._userPrivacy.getVersion();

        return methodChangedSinceConsent || versionUpdatedSinceConsent;
    }

    public getLegalFramework(): LegalFramework {
        return this._privacy.getLegalFramework();
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
            if (typeof(value) !== 'undefined') {
                return Promise.resolve(value);
            } else {
                throw new Error('gdpr.consent.value is undefined');
            }
        });
    }

    private initAgeGateChoice(): void {
        if (this._privacy.isAgeGateEnabled()) {
            this._core.Storage.get(StorageType.PRIVATE, UserPrivacyManager.AgeGateChoiceStorageKey).then((data: unknown) => {
                const value: boolean | undefined = this.getConsentTypeHack(data);
                if (typeof(value) !== 'undefined') {
                    this._ageGateChoice = value ? AgeGateChoice.NO : AgeGateChoice.YES;
                } else {
                    this._ageGateChoice = AgeGateChoice.MISSING;
                }
            });
        }

    }

    private updateConfigurationWithConsent(consent: boolean) {
        if (this._deviceInfo.getLimitAdTracking()) {
            consent = false;
        }

        this._privacy.setOptOutEnabled(!consent);
        this._privacy.setOptOutRecorded(true);

        const gamePrivacy = this._privacy.getGamePrivacy();
        gamePrivacy.setMethod(PrivacyMethod.DEVELOPER_CONSENT);
        const userPrivacy = this._privacy.getUserPrivacy();
        userPrivacy.update({
            method: gamePrivacy.getMethod(),
            version: gamePrivacy.getVersion(),
            agreedAll: false,
            permissions: {
                gameExp: false,
                ads: consent,
                external: consent
            }
        });
    }

    private onStorageSet(eventType: string, data: IUserPrivacyStorageData) {
        // should only use consent when gdpr is enabled in configuration
        if (this._privacy.isGDPREnabled()) {
            if (data && data.gdpr && data.gdpr.consent) {
                const value: boolean | undefined = this.getConsentTypeHack(data.gdpr.consent.value);

                if (typeof(value) !== 'undefined') {
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
        if (typeof(value) === 'boolean') {
            return value;
        } else if (typeof(value) === 'string') {
            if (value === 'true') {
                return true;
            } else if (value === 'false') {
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
            sendEvent = this.sendGDPREvent(GDPREventAction.OPTOUT, GDPREventSource.DEVELOPER);
        }
        return sendEvent.then(() => {
            return this._core.Storage.set(StorageType.PRIVATE, UserPrivacyManager.GdprLastConsentValueStorageKey, consent).then(() => {
                return this._core.Storage.write(StorageType.PRIVATE);
            });
        });
    }

    private isAgeGateShowRequired(): boolean {
        if (this._privacy.isAgeGateEnabled()) {
            // prevent age gate from being shown twice
            if (this._ageGateChoice !== AgeGateChoice.MISSING) {
                return false;
            }

            if (this._gamePrivacy.getMethod() === PrivacyMethod.LEGITIMATE_INTEREST && this._privacy.isGDPREnabled() && !this._privacy.isOptOutRecorded()) {
                return true;
            }

            if (this._gamePrivacy.getMethod() === PrivacyMethod.UNITY_CONSENT && !this._userPrivacy.isRecorded()) {
                return true;
            }
        }

        return false;
    }
}
