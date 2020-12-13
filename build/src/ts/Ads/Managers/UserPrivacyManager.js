import { PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
import { Platform } from 'Core/Constants/Platform';
import { StorageType } from 'Core/Native/Storage';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { PrivacyEvent, PrivacyMetrics } from 'Privacy/PrivacyMetrics';
import { PrivacyConfig } from 'Privacy/PrivacyConfig';
import { PrivacySDKTest } from 'Core/Models/ABGroup';
import PrivacySDKFlow from 'json/privacy/PrivacySDKFlow.json';
import PrivacyWebUI from 'html/PrivacyWebUI.html';
import PrivacySDKLocale from 'json/privacy/PrivacySDKLocale.json';
import { PrivacyTestEnvironment } from 'Privacy/PrivacyTestEnvironment';
export var GDPREventSource;
(function (GDPREventSource) {
    GDPREventSource["DEVELOPER"] = "developer";
    GDPREventSource["USER_INDIRECT"] = "user_indirect";
    GDPREventSource["USER"] = "user";
    GDPREventSource["SDK_SANITIZATION"] = "sdk_sanitization";
})(GDPREventSource || (GDPREventSource = {}));
export var GDPREventAction;
(function (GDPREventAction) {
    GDPREventAction["SKIPPED_BANNER"] = "skipped_banner";
    GDPREventAction["BANNER_PERMISSIONS"] = "banner_permissions";
    GDPREventAction["PROMO_SKIPPED_BANNER"] = "promo_skipped_banner";
    GDPREventAction["DEVELOPER_CONSENT"] = "developer_consent";
    GDPREventAction["DEVELOPER_OPTOUT"] = "developer_optout";
    GDPREventAction["AGE_GATE_DISAGREE"] = "agegate_disagree";
    GDPREventAction["DEVELOPER_AGE_GATE_OPTOUT"] = "developer_agegate_optout";
    GDPREventAction["CONSENT_AGREE_ALL"] = "consent_agreed_all";
    GDPREventAction["CONSENT_DISAGREE"] = "consent_disagree";
    GDPREventAction["CONSENT_SAVE_CHOICES"] = "consent_save_choices";
    GDPREventAction["CONSENT_AGREE"] = "consent_agree";
    GDPREventAction["PERSONALIZED_PERMISSIONS"] = "personalized_permissions";
    GDPREventAction["TEST_AUTO_CONSENT"] = "test_auto_consent";
})(GDPREventAction || (GDPREventAction = {}));
export var LegalFramework;
(function (LegalFramework) {
    LegalFramework["NONE"] = "none";
    LegalFramework["GDPR"] = "gdpr";
    LegalFramework["CCPA"] = "ccpa";
    LegalFramework["TC260"] = "tc260"; // China
})(LegalFramework || (LegalFramework = {}));
export var AgeGateChoice;
(function (AgeGateChoice) {
    AgeGateChoice["MISSING"] = "missing";
    AgeGateChoice["YES"] = "yes";
    AgeGateChoice["NO"] = "no";
})(AgeGateChoice || (AgeGateChoice = {}));
export var AgeGateSource;
(function (AgeGateSource) {
    AgeGateSource["MISSING"] = "missing";
    AgeGateSource["USER"] = "user";
    AgeGateSource["DEVELOPER"] = "developer";
})(AgeGateSource || (AgeGateSource = {}));
export var OptOutScope;
(function (OptOutScope) {
    OptOutScope["PROJECT_SCOPE"] = "project";
    OptOutScope["NETWORK_SCOPE"] = "network";
})(OptOutScope || (OptOutScope = {}));
export class UserPrivacyManager {
    constructor(platform, core, coreConfig, adsConfig, clientInfo, deviceInfo, request, privacy) {
        this._ageGateChoice = AgeGateChoice.MISSING;
        this._ageGateSource = AgeGateSource.MISSING;
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
        this._developerAgeGateActive = false;
        this._developerAgeGateChoice = false;
        this._privacyFormatMetadataSeenInSession = false;
        this._core.Storage.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, data));
    }
    getPrivacyConfig() {
        const ageGateChoice = this._userPrivacy.isRecorded() ? this.getAgeGateChoice() : AgeGateChoice.MISSING;
        const { ads, external, gameExp } = this._userPrivacy.getPermissions();
        const userSettings = {
            ads,
            external,
            gameExp,
            ageGateChoice,
            agreementMethod: ''
        };
        const userSummaryUrl = 'https://ads-privacy-api.prd.mz.internal.unity3d.com/api/v1/summary?' +
            `gameId=${this._clientInfo.getGameId()}&` +
            `projectId=${this._coreConfig.getUnityProjectId()}&` +
            `adid=${this._deviceInfo.getAdvertisingIdentifier()}&` +
            `storeId=${this._deviceInfo.getStores()}`;
        const env = {
            buildOsVersion: this._deviceInfo.getOsVersion(),
            deviceModel: this._deviceInfo.getModel(),
            platform: Platform[this._platform],
            userLocale: this._deviceInfo.getLanguage() ? this.resolveLanguageForPrivacyConfig(this._deviceInfo.getLanguage()) : undefined,
            country: this._coreConfig.getCountry(),
            subCountry: this._coreConfig.getSubdivision(),
            privacyMethod: this._gamePrivacy.getMethod(),
            ageGateLimit: this._privacy.getAgeGateLimit(),
            ageGateLimitMinusOne: this._privacy.getAgeGateLimit() - 1,
            legalFramework: this._privacy.getLegalFramework(),
            isCoppa: this._coreConfig.isCoppaCompliant(),
            apiLevel: this._platform === Platform.ANDROID ? this._deviceInfo.getApiLevel() : undefined,
            developerAgeGate: this.isDeveloperAgeGateActive(),
            userSummaryUrl
        };
        const startNode = 'ageGateDecision';
        return new PrivacyConfig(env, userSettings, startNode, PrivacyWebUI, PrivacySDKFlow, PrivacySDKLocale);
    }
    resolveLanguageForPrivacyConfig(deviceLanguage) {
        if (deviceLanguage.match('zh(((_#?Hans)?(_\\D\\D)?)|((_\\D\\D)?(_#?Hans)?))$')) {
            return 'zh-Hans';
        }
        else if (deviceLanguage.match('zh(_TW|_HK|_MO|_#?Hant)?(_TW|_HK|_MO|_#?Hant)+$')) {
            return 'zh-Hant';
        }
        else {
            return deviceLanguage.replace('_', '-');
        }
    }
    updateUserPrivacy(permissions, source, action, layout) {
        const gamePrivacy = this._gamePrivacy;
        const userPrivacy = this._userPrivacy;
        const firstRequest = !this._userPrivacy.isRecorded();
        if (source === GDPREventSource.DEVELOPER && action !== GDPREventAction.DEVELOPER_AGE_GATE_OPTOUT) {
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
    hasUserPrivacyChanged(updatedPrivacy) {
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
    sendPrivacyEvent(permissions, source, action, layout = '', firstRequest) {
        const infoJson = {
            'v': 4,
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
            agreedOverAgeLimit: this._ageGateChoice,
            ageGateSource: this._ageGateSource,
            scope: OptOutScope.PROJECT_SCOPE
        };
        if (CustomFeatures.sampleAtGivenPercent(1)) {
            Diagnostics.trigger('consent_send_event', {
                adsConfig: JSON.stringify(this._adsConfig.getDTO()),
                permissions: JSON.stringify(permissions)
            });
        }
        return HttpKafka.sendEvent('ads.events.optout.v1.json', KafkaCommonObjectType.EMPTY, infoJson);
    }
    getConsentAndUpdateConfiguration() {
        if (this._privacy.isGDPREnabled()) {
            this.initAgeGateChoice();
            // get consent only if gdpr is enabled
            return this.getConsent().then((consent) => {
                // check gdpr enabled again in case it has changed
                if (this._privacy.isGDPREnabled()) {
                    this.pushConsent(consent);
                }
                return consent; // always return consent value
            });
        }
        else {
            return Promise.reject(new Error('Configuration gdpr is not enabled'));
        }
    }
    retrieveUserSummary() {
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
            return Object.assign({}, JsonParser.parse(response.response), personalPayload);
        }).catch(error => {
            Diagnostics.trigger('gdpr_request_failed', {
                url: url
            });
            this._core.Sdk.logError('User summary request failed' + error);
            throw error;
        });
    }
    isOptOutEnabled() {
        return this._privacy.isOptOutEnabled();
    }
    getUserPrivacyPermissions() {
        return this._privacy.getUserPrivacy().getPermissions();
    }
    setUsersAgeGateChoice(ageGateChoice, ageGateSource) {
        if (ageGateSource === AgeGateSource.USER) {
            if (ageGateChoice === AgeGateChoice.YES) {
                PrivacyMetrics.trigger(PrivacyEvent.AGE_GATE_PASS);
                if (this._gamePrivacy.getMethod() === PrivacyMethod.UNITY_CONSENT) {
                    PrivacyMetrics.trigger(PrivacyEvent.CONSENT_SHOW);
                }
            }
            else if (ageGateChoice === AgeGateChoice.NO) {
                PrivacyMetrics.trigger(PrivacyEvent.AGE_GATE_NOT_PASSED);
            }
        }
        this._ageGateChoice = ageGateChoice;
        this._ageGateSource = ageGateSource;
        this._core.Storage.set(StorageType.PRIVATE, UserPrivacyManager.AgeGateChoiceStorageKey, this.isUserUnderAgeLimit());
        this._core.Storage.set(StorageType.PRIVATE, UserPrivacyManager.AgeGateSourceStorageKey, ageGateSource);
        this._core.Storage.write(StorageType.PRIVATE);
    }
    isUserUnderAgeLimit() {
        if (this._privacy.isAgeGateEnabled() && this._ageGateChoice === AgeGateChoice.NO) {
            return true;
        }
        return false;
    }
    getAgeGateChoice() {
        return this._ageGateChoice;
    }
    isPrivacyShowRequired() {
        if (PrivacyTestEnvironment.isSet('showPrivacy')) {
            return PrivacyTestEnvironment.get('showPrivacy');
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
    getLegalFramework() {
        return this._privacy.getLegalFramework();
    }
    isDataRequestEnabled() {
        return this._privacy.getLegalFramework() === LegalFramework.CCPA;
    }
    isDeveloperAgeGateActive() {
        return this._developerAgeGateActive;
    }
    getDeveloperAgeGateChoice() {
        return this._developerAgeGateChoice;
    }
    applyDeveloperAgeGate() {
        if (this._privacy.isAgeGateEnabled() && this.isDeveloperAgeGateActive() && !this._privacy.isOptOutRecorded() && (this._gamePrivacy.getMethod() === PrivacyMethod.LEGITIMATE_INTEREST || this._gamePrivacy.getMethod() === PrivacyMethod.UNITY_CONSENT)) {
            if (this.getDeveloperAgeGateChoice()) {
                this.setUsersAgeGateChoice(AgeGateChoice.YES, AgeGateSource.DEVELOPER);
            }
            else {
                this.setUsersAgeGateChoice(AgeGateChoice.NO, AgeGateSource.DEVELOPER);
                const permissions = {
                    gameExp: false,
                    ads: false,
                    external: false
                };
                this.updateUserPrivacy(permissions, GDPREventSource.DEVELOPER, GDPREventAction.DEVELOPER_AGE_GATE_OPTOUT);
            }
        }
    }
    isPrivacySDKTestActive() {
        if (this._platform === Platform.ANDROID && this._deviceInfo.getApiLevel() < 19) {
            return false;
        }
        if (PrivacyTestEnvironment.isSet('usePrivacySDK')) {
            return PrivacyTestEnvironment.get('usePrivacySDK');
        }
        return PrivacySDKTest.isValid(this._coreConfig.getAbGroup());
    }
    pushConsent(consent) {
        let permissions = UserPrivacy.PERM_ALL_FALSE;
        let action = GDPREventAction.DEVELOPER_OPTOUT;
        if (consent) {
            permissions = UserPrivacy.PERM_DEVELOPER_CONSENTED;
            action = GDPREventAction.DEVELOPER_CONSENT;
        }
        return this.updateUserPrivacy(permissions, GDPREventSource.DEVELOPER, action);
    }
    getConsent() {
        return this._core.Storage.get(StorageType.PUBLIC, UserPrivacyManager.PrivacyConsentStorageKey).then((data) => {
            const value = this.getConsentTypeHack(data);
            if (typeof (value) !== 'undefined') {
                this._privacyFormatMetadataSeenInSession = true;
                return Promise.resolve(value);
            }
            else {
                throw new Error('privacy.consent.value is undefined');
            }
        }).catch((error) => {
            if (error instanceof Error) {
                throw error;
            }
            return this._core.Storage.get(StorageType.PUBLIC, UserPrivacyManager.GdprConsentStorageKey).then((data) => {
                const value = this.getConsentTypeHack(data);
                if (typeof (value) !== 'undefined') {
                    return Promise.resolve(value);
                }
                else {
                    throw new Error('gdpr.consent.value is undefined');
                }
            });
        });
    }
    initAgeGateChoice() {
        if (this._privacy.isAgeGateEnabled()) {
            this._core.Storage.get(StorageType.PUBLIC, UserPrivacyManager.PrivacyAgeGateKey).then((data) => {
                const value = this.getConsentTypeHack(data);
                if (typeof (value) !== 'undefined') {
                    this._developerAgeGateActive = true;
                    this._developerAgeGateChoice = value;
                }
            });
            this._core.Storage.get(StorageType.PRIVATE, UserPrivacyManager.AgeGateChoiceStorageKey).then((data) => {
                const value = this.getConsentTypeHack(data);
                if (typeof (value) !== 'undefined') {
                    // stored value is if user is under age limit, apparent "flipping" of boolean is intentional
                    this._ageGateChoice = value ? AgeGateChoice.NO : AgeGateChoice.YES;
                }
                else {
                    this._ageGateChoice = AgeGateChoice.MISSING;
                }
            });
            this._core.Storage.get(StorageType.PRIVATE, UserPrivacyManager.AgeGateSourceStorageKey).then(value => {
                switch (value) {
                    case AgeGateSource.USER:
                        this._ageGateSource = AgeGateSource.USER;
                        break;
                    case AgeGateSource.DEVELOPER:
                        this._ageGateSource = AgeGateSource.DEVELOPER;
                        break;
                    default:
                        this._ageGateSource = AgeGateSource.MISSING;
                }
            });
        }
    }
    onStorageSet(eventType, data) {
        if (this._privacy.isAgeGateEnabled()) {
            const ageGateData = data;
            if (ageGateData && ageGateData.privacy && ageGateData.privacy.useroveragelimit) {
                const ageGateValue = this.getConsentTypeHack(data);
                if (typeof (ageGateValue) !== 'undefined') {
                    this._developerAgeGateActive = true;
                    this._developerAgeGateChoice = ageGateValue;
                }
                return;
            }
        }
        // should only use consent when gdpr is enabled in configuration
        if (!this._privacy.isGDPREnabled()) {
            return;
        }
        let value;
        const usdAsPrivacy = data;
        if (usdAsPrivacy && usdAsPrivacy.privacy && usdAsPrivacy.privacy.consent) {
            value = this.getConsentTypeHack(usdAsPrivacy.privacy.consent.value);
        }
        if (typeof (value) !== 'undefined') {
            this.pushConsent(value);
            this._privacyFormatMetadataSeenInSession = true;
            return;
        }
        if (this._privacyFormatMetadataSeenInSession) {
            return;
        }
        const usdAsGdpr = data;
        if (usdAsGdpr && usdAsGdpr.gdpr && usdAsGdpr.gdpr.consent) {
            value = this.getConsentTypeHack(usdAsGdpr.gdpr.consent.value);
        }
        if (typeof (value) !== 'undefined') {
            this.pushConsent(value);
        }
    }
    // Android C# layer will map boolean values to Java primitive boolean types and causes reflection failure
    // with Android Java native layer method that takes Object as value
    // this hack allows anyone use both booleans and string "true" and "false" values
    getConsentTypeHack(value) {
        if (typeof (value) === 'boolean') {
            return value;
        }
        else if (typeof (value) === 'string') {
            if (value === 'true') {
                return true;
            }
            else if (value === 'false') {
                return false;
            }
        }
        return undefined;
    }
    isAgeGateShowRequired() {
        if (this._privacy.isAgeGateEnabled() && !this.isDeveloperAgeGateActive()) {
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
UserPrivacyManager.GdprConsentStorageKey = 'gdpr.consent.value';
UserPrivacyManager.PrivacyConsentStorageKey = 'privacy.consent.value';
UserPrivacyManager.PrivacyAgeGateKey = 'privacy.useroveragelimit.value';
UserPrivacyManager.AgeGateChoiceStorageKey = 'privacy.agegateunderagelimit';
UserPrivacyManager.AgeGateSourceStorageKey = 'privacy.agegatesource';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlclByaXZhY3lNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9NYW5hZ2Vycy9Vc2VyUHJpdmFjeU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFvQyxhQUFhLEVBQUUsV0FBVyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0YsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBTW5ELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDekQsT0FBTyxFQUFFLFNBQVMsRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzVFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUd2RCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFOUQsT0FBTyxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN0RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFdEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRXJELE9BQU8sY0FBYyxNQUFNLGtDQUFrQyxDQUFDO0FBQzlELE9BQU8sWUFBWSxNQUFNLHdCQUF3QixDQUFDO0FBQ2xELE9BQU8sZ0JBQWdCLE1BQU0sb0NBQW9DLENBQUM7QUFDbEUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFVeEUsTUFBTSxDQUFOLElBQVksZUFLWDtBQUxELFdBQVksZUFBZTtJQUN2QiwwQ0FBdUIsQ0FBQTtJQUN2QixrREFBK0IsQ0FBQTtJQUMvQixnQ0FBYSxDQUFBO0lBQ2Isd0RBQXFDLENBQUE7QUFDekMsQ0FBQyxFQUxXLGVBQWUsS0FBZixl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