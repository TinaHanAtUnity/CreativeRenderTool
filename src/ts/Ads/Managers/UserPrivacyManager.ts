import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { GamePrivacy, IPrivacyPermissions, PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
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
import { ConsentPage } from 'Ads/Views/Privacy/Privacy';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { PrivacyEvent, PrivacyMetrics } from 'Privacy/PrivacyMetrics';
import { PrivacyConfig } from 'Privacy/PrivacyConfig';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';

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
    SKIPPED_BANNER = 'skipped_banner',
    BANNER_PERMISSIONS = 'banner_permissions',
    PROMO_SKIPPED_BANNER = 'promo_skipped_banner',
    DEVELOPER_CONSENT = 'developer_consent',
    DEVELOPER_OPTOUT = 'developer_optout',
    AGE_GATE_DISAGREE = 'agegate_disagree',
    CONSENT_AGREE_ALL = 'consent_agreed_all',
    CONSENT_DISAGREE = 'consent_disagree',
    CONSENT_SAVE_CHOICES = 'consent_save_choices',
    CONSENT_AGREE = 'consent_agree',
    PERSONALIZED_PERMISSIONS = 'personalized_permissions',
    TEST_AUTO_CONSENT = 'test_auto_consent'
}

export enum LegalFramework {
    NONE = 'none',
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

    private static GdprConsentStorageKey = 'gdpr.consent.value';
    private static AgeGateChoiceStorageKey = 'privacy.agegateunderagelimit';

    public _forcedConsentUnit: boolean;

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

    constructor(platform: Platform, core: ICoreApi, coreConfig: CoreConfiguration, adsConfig: AdsConfiguration, clientInfo: ClientInfo, deviceInfo: DeviceInfo, request: RequestManager, privacy: PrivacySDK, forcedConsentUnit?: boolean) {
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
        this._forcedConsentUnit = forcedConsentUnit || false;
        this._core.Storage.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, <IUserPrivacyStorageData>data));
    }

    public getPrivacyConfig(): Promise<PrivacyConfig> {
        let agreedOverAgeLimit = false;
        switch (this.getAgeGateChoice()) {
            case AgeGateChoice.YES:
                agreedOverAgeLimit = true;
                break;
            case AgeGateChoice.NO:
            case AgeGateChoice.MISSING:
                agreedOverAgeLimit = false;
            default:
                agreedOverAgeLimit = false;
        }

        const privacyUrl = TestEnvironment.get<string>('privacyUrl');
        if (!privacyUrl) {
            return Promise.reject(new Error('No privacy url'));
        }

        return this._request.get(privacyUrl + 'api/v1/flows/create').then((response) => {
            return this._request.get(privacyUrl).then((privacyHtml) => {
                return Promise.resolve(new PrivacyConfig({
                        flow: JSON.parse(response.response),
                        webViewUrl: privacyUrl
                    },
                    {
                        ads: this._userPrivacy.getPermissions().ads,
                        external: this._userPrivacy.getPermissions().external,
                        gameExp: this._userPrivacy.getPermissions().gameExp,
                        agreedOverAgeLimit: agreedOverAgeLimit
                    },
                    {
                        buildOsVersion: this._deviceInfo.getOsVersion(),
                        platform: this._platform,
                        userLocale: this._deviceInfo.getLanguage(),
                        country: this._coreConfig.getCountry(),
                        // todo: add api level
                        // todo: add subcountry

                        privacyMethod: this._gamePrivacy.getMethod(),
                        ageGateLimit: this._privacy.getAgeGateLimit(),
                        legalFramework: this._privacy.getLegalFramework(),
                        isCoppa: this._coreConfig.isCoppaCompliant()
                    },
                    privacyHtml.response));
            });
        });
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
            return Promise.resolve();
        });
    }

    public updateUserPrivacy(permissions: IPrivacyPermissions, source: GDPREventSource, action: GDPREventAction, layout? : ConsentPage): Promise<INativeResponse | void> {
        const gamePrivacy = this._gamePrivacy;
        const userPrivacy = this._userPrivacy;
        const firstRequest = !this._userPrivacy.isRecorded();

        if (source === GDPREventSource.DEVELOPER) {
            gamePrivacy.setMethod(PrivacyMethod.DEVELOPER_CONSENT);
            userPrivacy.setMethod(PrivacyMethod.DEVELOPER_CONSENT);
        }

        if (gamePrivacy.getMethod() === PrivacyMethod.DEFAULT) {
            return Promise.resolve();
        }

        const updatedPrivacy = {
            method: gamePrivacy.getMethod(),
            version: gamePrivacy.getVersion(),
            permissions: permissions
        };

        if (!this.hasUserPrivacyChanged(updatedPrivacy)) {
            return Promise.resolve();
        }

        if (this._deviceInfo.getLimitAdTracking()) {
            // only developer_consent should end up here
            const devicePermissions = UserPrivacy.PERM_ALL_FALSE;
            updatedPrivacy.permissions = devicePermissions;
        }
        userPrivacy.update(updatedPrivacy);

        // TODO: this needs more investigation, how should limit ad tracking cases be handled? since iOS sends all zeroes for advertising ID, for now events will be disabled
        if (this._deviceInfo.getLimitAdTracking()) {
            return Promise.resolve();
        }

        return this.sendPrivacyEvent(permissions, source, action, layout, firstRequest);
    }

    private hasUserPrivacyChanged(updatedPrivacy: { method: PrivacyMethod; version: number; permissions: IPrivacyPermissions }) {
        const currentPrivacy = this._userPrivacy;
        if (currentPrivacy.getMethod() !== updatedPrivacy.method) {
            return true;
        }

        if (updatedPrivacy.method === PrivacyMethod.UNITY_CONSENT && currentPrivacy.getVersion() !== updatedPrivacy.version) {
            return true;
        }

        const currentPermissions = currentPrivacy.getPermissions();
        const updatedPermissions = updatedPrivacy.permissions;

        return !UserPrivacy.permissionsEql(currentPermissions, updatedPermissions);
    }

    private sendPrivacyEvent(permissions: IPrivacyPermissions, source: GDPREventSource, action: GDPREventAction, layout = '', firstRequest: boolean): Promise<INativeResponse> {
        const infoJson: unknown = {
            'v': 2,
            advertisingId: this._deviceInfo.getAdvertisingIdentifier(),
            abGroup: this._coreConfig.getAbGroup(),
            layout: layout,
            userAction: action,
            projectId: this._coreConfig.getUnityProjectId(),
            platform: Platform[this._platform].toLowerCase(),
            country: this._coreConfig.getCountry(),
            subdivision: this._coreConfig.getSubdivision(),
            gameId: this._clientInfo.getGameId(),
            source: source,
            method: this._gamePrivacy.getMethod(),
            agreedVersion: this._gamePrivacy.getVersion(),
            coppa: this._coreConfig.isCoppaCompliant(),
            firstRequest: firstRequest,
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
            country: this._coreConfig.getCountry(),
            subdivision: this._coreConfig.getSubdivision()
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

    public getUserPrivacyPermissions(): IPrivacyPermissions {
        return this._privacy.getUserPrivacy().getPermissions();
    }

    public setUsersAgeGateChoice(ageGateChoice: AgeGateChoice) {
        if (ageGateChoice === AgeGateChoice.YES) {
            PrivacyMetrics.trigger(PrivacyEvent.AGE_GATE_PASS);
            if (this._gamePrivacy.getMethod() === PrivacyMethod.UNITY_CONSENT) {
                PrivacyMetrics.trigger(PrivacyEvent.CONSENT_SHOW);
            }
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

    public isPrivacyShowRequired(): boolean {
        if (this._forcedConsentUnit) {
            return true;
        }

        if (this.isAgeGateShowRequired()) {
            return true;
        }

        if (this._gamePrivacy.getMethod() !== PrivacyMethod.UNITY_CONSENT) {
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

    private pushConsent(consent: boolean): Promise<INativeResponse | void> {
        let permissions = UserPrivacy.PERM_ALL_FALSE;
        let action = GDPREventAction.DEVELOPER_OPTOUT;

        if (consent) {
            permissions = UserPrivacy.PERM_DEVELOPER_CONSENTED;
            action = GDPREventAction.DEVELOPER_CONSENT;
        }

        return this.updateUserPrivacy(permissions, GDPREventSource.DEVELOPER, action);
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

    private onStorageSet(eventType: string, data: IUserPrivacyStorageData) {
        // should only use consent when gdpr is enabled in configuration
        if (this._privacy.isGDPREnabled()) {
            if (data && data.gdpr && data.gdpr.consent) {
                const value: boolean | undefined = this.getConsentTypeHack(data.gdpr.consent.value);

                if (typeof(value) !== 'undefined') {
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

    private isAgeGateShowRequired(): boolean {
        if (this._privacy.isAgeGateEnabled()) {
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
