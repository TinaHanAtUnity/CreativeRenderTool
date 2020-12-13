import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { AgeGateChoice, AgeGateSource, GDPREventAction, GDPREventSource } from 'Ads/Managers/UserPrivacyManager';
import { Platform } from 'Core/Constants/Platform';
import { Privacy, ConsentPage } from 'Ads/Views/Privacy/Privacy';
import { PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { PrivacyEvent, PrivacyMetrics } from 'Privacy/PrivacyMetrics';
import { IosUtils } from 'Ads/Utilities/IosUtils';
export class PrivacyUnit {
    constructor(parameters) {
        this._adUnitContainer = parameters.adUnitContainer;
        this._platform = parameters.platform;
        this._privacyManager = parameters.privacyManager;
        this._adsConfig = parameters.adsConfig;
        this._core = parameters.core;
        this._privacySDK = parameters.privacySDK;
        this._landingPage = this._privacySDK.isAgeGateEnabled() && !this._privacyManager.isDeveloperAgeGateActive() ? ConsentPage.AGE_GATE : ConsentPage.HOMEPAGE;
        let viewParams = {
            platform: parameters.platform,
            privacyManager: parameters.privacyManager,
            landingPage: this._landingPage,
            language: parameters.deviceInfo.getLanguage(),
            consentABTest: false,
            ageGateLimit: this._privacySDK.getAgeGateLimit()
        };
        if (this._platform === Platform.ANDROID) {
            viewParams = Object.assign({}, viewParams, { apiLevel: parameters.deviceInfo.getApiLevel() });
        }
        else if (this._platform === Platform.IOS) {
            viewParams = Object.assign({}, viewParams, { osVersion: parameters.deviceInfo.getOsVersion() });
        }
        this._unityPrivacyView = new Privacy(viewParams);
        this._unityPrivacyView.addEventHandler(this);
        this._useTransparency = true;
        if (this._platform === Platform.IOS && IosUtils.isAdUnitTransparencyBroken(parameters.deviceInfo.getOsVersion())) {
            this._useTransparency = false;
        }
    }
    show(options) {
        this._showing = true;
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
            if (typeof TestEnvironment.get('autoAcceptAgeGate') === 'boolean') {
                const ageGateValue = JSON.parse(TestEnvironment.get('autoAcceptAgeGate'));
                this.handleAutoAgeGate(ageGateValue);
            }
            if (TestEnvironment.get('autoAcceptConsent')) {
                const consentValues = JSON.parse(TestEnvironment.get('autoAcceptConsent'));
                this.handleAutoConsent(consentValues);
            }
            return donePromise;
        }).catch((e) => {
            this._core.Sdk.logWarning('Error opening Privacy view ' + e);
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
            if (this._unityPrivacyView.container().parentElement) {
                document.body.removeChild(this._unityPrivacyView.container());
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
    // IConsentViewHandler
    onConsent(permissions, userAction, source) {
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
    // IConsentViewHandler
    onClose() {
        this._adUnitContainer.close().then(() => {
            if (this._platform !== Platform.IOS) {
                // Android will not trigger onCointainerDestroy if close()-was called, iOS will
                this.onContainerDestroy();
            }
        });
    }
    // IConsentViewHandler
    onAgeGateDisagree() {
        this._privacyManager.setUsersAgeGateChoice(AgeGateChoice.NO, AgeGateSource.USER);
        const permissions = {
            gameExp: false,
            ads: false,
            external: false
        };
        this._privacyManager.updateUserPrivacy(permissions, GDPREventSource.USER, GDPREventAction.AGE_GATE_DISAGREE, ConsentPage.AGE_GATE);
    }
    onAgeGateAgree() {
        this._privacyManager.setUsersAgeGateChoice(AgeGateChoice.YES, AgeGateSource.USER);
        if (this._privacySDK.getGamePrivacy().getMethod() === PrivacyMethod.UNITY_CONSENT) {
            // todo: handle the flow inside view class
            this._unityPrivacyView.showPage(ConsentPage.HOMEPAGE);
        }
        else {
            this._unityPrivacyView.closeAgeGateWithAgreeAnimation();
        }
    }
    onPrivacy(url) {
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
    handleAutoAgeGate(ageGate) {
        setTimeout(() => {
            this._core.Sdk.logInfo('setting autoAcceptAgeGate based on ' + ageGate);
            this._unityPrivacyView.testAutoAgeGate(ageGate);
        }, 3000);
    }
    handleAutoConsent(consent) {
        setTimeout(() => {
            if (consent.hasOwnProperty('ads')) {
                this._core.Sdk.logInfo('setting autoAcceptConsent with Personalized Consent based on ' + JSON.stringify(consent));
                this._unityPrivacyView.testAutoConsent(consent);
            }
        }, 3000);
    }
    description() {
        return 'Privacy';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeVVuaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL0FkVW5pdHMvUHJpdmFjeVVuaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUlILFdBQVcsRUFDZCxNQUFNLHdDQUF3QyxDQUFDO0FBQ2hELE9BQU8sRUFDSCxhQUFhLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBRWpFLE1BQU0saUNBQWlDLENBQUM7QUFDekMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUEwQixNQUFNLDJCQUEyQixDQUFDO0FBRXpGLE9BQU8sRUFBdUIsYUFBYSxFQUFFLFdBQVcsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBR2xGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUtqRSxPQUFPLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3RFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQWFsRCxNQUFNLE9BQU8sV0FBVztJQWNwQixZQUFZLFVBQWtDO1FBQzFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDO1FBQ25ELElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUNyQyxJQUFJLENBQUMsZUFBZSxHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUM7UUFDakQsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztRQUM3QixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7UUFFekMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsV0FB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