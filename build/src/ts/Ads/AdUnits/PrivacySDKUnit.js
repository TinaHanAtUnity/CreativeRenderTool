import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { AgeGateChoice, GDPREventAction, GDPREventSource, AgeGateSource } from 'Ads/Managers/UserPrivacyManager';
import { PrivacyEvent, PrivacyMetrics } from 'Privacy/PrivacyMetrics';
import { PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
import { ConsentPage } from 'Ads/Views/Privacy/Privacy';
import { Platform } from 'Core/Constants/Platform';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { PrivacySDKView } from 'Ads/Views/Privacy/PrivacySDKView';
import { PrivacyTestEnvironment } from 'Privacy/PrivacyTestEnvironment';
export class PrivacySDKUnit {
    constructor(parameters) {
        this._adUnitContainer = parameters.adUnitContainer;
        this._platform = parameters.platform;
        this._privacyManager = parameters.privacyManager;
        this._adsConfig = parameters.adsConfig;
        this._core = parameters.core;
        this._privacySDK = parameters.privacySDK;
        this._privacyMetricsUrl = PrivacyTestEnvironment.isSet('privacySDKMetricsUrl') ?
            PrivacyTestEnvironment.get('privacySDKMetricsUrl') : 'https://sdk-metrics.privacy.unity3d.com/api/v1/metrics';
        this._landingPage = this._privacySDK.isAgeGateEnabled() && !this._privacyManager.isDeveloperAgeGateActive() ? ConsentPage.AGE_GATE : ConsentPage.HOMEPAGE;
        this._useTransparency = true;
        if (this._platform === Platform.IOS && IosUtils.isAdUnitTransparencyBroken(parameters.deviceInfo.getOsVersion())) {
            this._useTransparency = false;
        }
        this._requestManager = parameters.requestManager;
        this._unityPrivacyView = new PrivacySDKView(this.getViewParams(parameters));
        this._unityPrivacyView.addEventHandler(this);
    }
    show(options) {
        this._showing = true;
        this._privacyConfig = this._privacyManager.getPrivacyConfig();
        this._unityPrivacyView.setPrivacyConfig(this._privacyConfig);
        return this._adUnitContainer.open(this, ['webview'], false, Orientation.NONE, true, this._useTransparency, true, false, options).then(() => {
            const donePromise = new Promise((resolve) => {
                this._donePromiseResolve = resolve;
            });
            this._adUnitContainer.addEventHandler(this);
            this._unityPrivacyView.render();
            document.body.appendChild(this._unityPrivacyView.container());
            this._unityPrivacyView.show();
            if (this._privacySDK.isAgeGateEnabled() && !this._privacyManager.isDeveloperAgeGateActive()) {
                PrivacyMetrics.trigger(PrivacyEvent.AGE_GATE_SHOW);
            }
            else if (this._privacySDK.getGamePrivacy().getMethod() === PrivacyMethod.UNITY_CONSENT) {
                PrivacyMetrics.trigger(PrivacyEvent.CONSENT_SHOW);
            }
            return donePromise;
        }).catch((e) => {
            this._core.Sdk.logWarning('Error opening Privacy view ' + e);
            this.closePrivacy();
        });
    }
    // IAdUnitContainerListener
    onContainerShow() {
        // Blank
    }
    // IAdUnitContainerListener
    onContainerDestroy() {
        if (this._showing) {
            this._showing = false;
            this._adUnitContainer.removeEventHandler(this);
            this._unityPrivacyView.hide();
            if (this._unityPrivacyView.container().parentElement) {
                document.body.removeChild(this._unityPrivacyView.container());
                delete this._unityPrivacyView;
            }
            // Fixes browser build for android. TODO: find a neater way
            setTimeout(() => {
                this._donePromiseResolve();
            }, 0);
        }
    }
    // IAdUnitContainerListener
    onContainerBackground() {
        // Blank
    }
    // IAdUnitContainerListener
    onContainerForeground() {
        // Blank
    }
    // IAdUnitContainerListener
    onContainerSystemMessage(message) {
        // Blank
    }
    description() {
        return 'Privacy';
    }
    setConsent(permissions, userAction, source) {
        if (UserPrivacy.permissionsEql(permissions, UserPrivacy.PERM_ALL_TRUE)) {
            PrivacyMetrics.trigger(PrivacyEvent.CONSENT_ACCEPT_ALL, permissions);
        }
        else if (UserPrivacy.permissionsEql(permissions, UserPrivacy.PERM_ALL_FALSE)) {
            PrivacyMetrics.trigger(PrivacyEvent.CONSENT_NOT_ACCEPTED, permissions);
        }
        else {
            PrivacyMetrics.trigger(PrivacyEvent.CONSENT_PARTIALLY_ACCEPTED, permissions);
        }
        this._privacyManager.updateUserPrivacy(permissions, source, userAction, this._landingPage);
    }
    closePrivacy() {
        this._adUnitContainer.close().then(() => {
            if (this._platform !== Platform.IOS) {
                // Android will not trigger onCointainerDestroy if close()-was called, iOS will
                this.onContainerDestroy();
            }
        });
    }
    openPrivacyUrl(url) {
        if (this._platform === Platform.IOS) {
            this._core.iOS.UrlScheme.open(url);
        }
        else if (this._platform === Platform.ANDROID) {
            this._core.Android.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }
    onPrivacyCompleted(params) {
        const { user, error } = params;
        if (error) {
            this._core.Sdk.logError(`Privacy error: ${error}`);
            this.closePrivacy();
            return;
        }
        this._core.Sdk.logDebug('PRIVACY: Got permissions: ' + JSON.stringify(user));
        this.handlePrivacySettings(user);
        this._unityPrivacyView.completeCallback();
        this.closePrivacy();
    }
    handlePrivacySettings(user) {
        let action;
        const { ads, external, gameExp, ageGateChoice } = user;
        const permissions = { ads, external, gameExp };
        switch (user.agreementMethod) {
            case 'all':
                action = GDPREventAction.CONSENT_AGREE_ALL;
                break;
            case 'allOfSeen':
                action = GDPREventAction.CONSENT_AGREE; // this is correct, naming is just different in privacy UI
                break;
            case 'noneOfSeen':
                action = GDPREventAction.CONSENT_DISAGREE;
                break;
            case 'userSelected':
                action = GDPREventAction.CONSENT_SAVE_CHOICES;
                break;
            default:
                action = GDPREventAction.CONSENT_SAVE_CHOICES;
        }
        if (!this._privacySDK.isAgeGateEnabled() || this._privacyManager.isDeveloperAgeGateActive()) {
            this.setConsent(permissions, action, GDPREventSource.USER);
            return;
        }
        this._privacyManager.setUsersAgeGateChoice(ageGateChoice, AgeGateSource.USER);
        if (ageGateChoice === AgeGateChoice.NO) {
            action = GDPREventAction.AGE_GATE_DISAGREE;
            this._privacyManager.updateUserPrivacy(permissions, GDPREventSource.USER, action);
            return;
        }
        if (this._privacySDK.getGamePrivacy().getMethod() === PrivacyMethod.UNITY_CONSENT) {
            this.setConsent(permissions, action, GDPREventSource.USER);
        }
    }
    onPrivacyReady() {
        const params = {
            startNode: this._privacyConfig.getStartNode(),
            nodes: this._privacyConfig.getFlow(),
            locale: this._privacyConfig.getLocale(),
            state: {
                env: this._privacyConfig.getEnv(),
                user: this._privacyConfig.getUserSettings()
            }
        };
        this._unityPrivacyView.readyCallback(params);
        this._core.Sdk.logDebug('PRIVACY: Privacy ready');
    }
    onPrivacyOpenUrl(url) {
        this.openPrivacyUrl(url);
        this._unityPrivacyView.openUrlCallback(url);
    }
    onPrivacyMetric(metric) {
        this._requestManager.post(this._privacyMetricsUrl, JSON.stringify(metric))
            .catch(error => {
            this._core.Sdk.logDebug(`PRIVACY: sending metrics failed: ${error.message}`);
        });
    }
    onPrivacyFetchUrl(data) {
        const { url, property } = data;
        this._requestManager.get(url).then((response) => {
            this._unityPrivacyView.fetchUrlCallback(JSON.parse(response.response), property);
        });
    }
    onPrivacyViewError(event) {
        this.closePrivacy();
    }
    getViewParams(parameters) {
        let viewParams = {
            platform: parameters.platform,
            privacyManager: parameters.privacyManager,
            landingPage: this._landingPage,
            language: parameters.deviceInfo.getLanguage(),
            consentABTest: false,
            ageGateLimit: this._privacySDK.getAgeGateLimit(),
            core: this._core
        };
        if (this._platform === Platform.ANDROID) {
            viewParams = Object.assign({}, viewParams, { apiLevel: parameters.deviceInfo.getApiLevel() });
        }
        else if (this._platform === Platform.IOS) {
            viewParams = Object.assign({}, viewParams, { osVersion: parameters.deviceInfo.getOsVersion() });
        }
        return viewParams;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeVNES1VuaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL0FkVW5pdHMvUHJpdmFjeVNES1VuaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFdBQVcsRUFBMEQsTUFBTSx3Q0FBd0MsQ0FBQztBQUU3SCxPQUFPLEVBQ2lCLGFBQWEsRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUNuRSxhQUFhLEVBQ2hCLE1BQU0saUNBQWlDLENBQUM7QUFDekMsT0FBTyxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN0RSxPQUFPLEVBQUUsYUFBYSxFQUF1QixXQUFXLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUVsRixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQU1sRCxPQUFPLEVBQTZCLGNBQWMsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBUTdGLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBY3hFLE1BQU0sT0FBTyxjQUFjO0lBZ0J2QixZQUFZLFVBQWtDO1FBQzFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDO1FBQ25ELElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUNyQyxJQUFJLENBQUMsZUFBZSxHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUM7UUFDakQsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztRQUM3QixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxVQUFV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