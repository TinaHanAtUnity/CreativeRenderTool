import { IPrivacySDKViewHandler } from 'Ads/Views/Privacy/IPrivacySDKViewHandler';
import { Orientation, IAdUnit, AdUnitContainer, AdUnitContainerSystemMessage } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ICoreApi } from 'Core/ICore';
import {
    UserPrivacyManager, AgeGateChoice, GDPREventAction, GDPREventSource,
    AgeGateSource
} from 'Ads/Managers/UserPrivacyManager';
import { PrivacyEvent, PrivacyMetrics } from 'Privacy/PrivacyMetrics';
import { PrivacyMethod, IPrivacyPermissions, UserPrivacy } from 'Privacy/Privacy';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { ConsentPage } from 'Ads/Views/Privacy/Privacy';
import { Platform } from 'Core/Constants/Platform';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ABGroup } from 'Core/Models/ABGroup';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { RequestManager } from 'Core/Managers/RequestManager';
import { IPrivacySDKViewParameters, PrivacySDKView } from 'Ads/Views/Privacy/PrivacySDKView';
import { PrivacyConfig } from 'Privacy/PrivacyConfig';
import { IPrivacyCompletedParams, IPrivacyFetchUrlParams } from 'Privacy/IPrivacySettings';

export interface IPrivacyUnitParameters {
    abGroup: ABGroup;
    platform: Platform;
    privacyManager: UserPrivacyManager;
    requestManager: RequestManager;
    adUnitContainer: AdUnitContainer;
    adsConfig: AdsConfiguration;
    core: ICoreApi;
    deviceInfo: DeviceInfo;
    privacySDK: PrivacySDK;
}

export class PrivacySDKUnit implements IAdUnit, IPrivacySDKViewHandler {
    private _donePromiseResolve: () => void;
    private _adUnitContainer: AdUnitContainer;
    private _privacySDK: PrivacySDK;
    private _adsConfig: AdsConfiguration;
    private _privacyConfig: PrivacyConfig;
    private _requestManager: RequestManager;
    private _useTransparency: boolean;
    private _core: ICoreApi;
    private _showing: boolean;
    private _privacyManager: UserPrivacyManager;
    private _unityPrivacyView: PrivacySDKView;
    private _privacyMetricsUrl: string;
    private readonly _platform: Platform;
    private readonly _landingPage: ConsentPage;

    constructor(parameters: IPrivacyUnitParameters) {
        this._adUnitContainer = parameters.adUnitContainer;
        this._platform = parameters.platform;
        this._privacyManager = parameters.privacyManager;
        this._adsConfig = parameters.adsConfig;
        this._core = parameters.core;
        this._privacySDK = parameters.privacySDK;
        this._privacyMetricsUrl = this._privacyManager.getPrivacyMetricsUrl();

        this._landingPage = this._privacySDK.isAgeGateEnabled() && !this._privacyManager.isDeveloperAgeGateActive() ? ConsentPage.AGE_GATE : ConsentPage.HOMEPAGE;

        this._useTransparency = true;
        if (this._platform === Platform.IOS && IosUtils.isAdUnitTransparencyBroken(parameters.deviceInfo.getOsVersion())) {
            this._useTransparency = false;
        }

        this._requestManager = parameters.requestManager;
        this._unityPrivacyView = new PrivacySDKView(this.getViewParams(parameters));
        this._unityPrivacyView.addEventHandler(this);
    }

    public show(options: unknown): Promise<void> {
        this._showing = true;
        this._privacyConfig = this._privacyManager.getPrivacyConfig();
        this._unityPrivacyView.setPrivacyConfig(this._privacyConfig);

        return this._adUnitContainer.open(this, ['webview'], false, Orientation.NONE, true, this._useTransparency, true, false, options).then(() => {
            const donePromise = new Promise<void>((resolve) => {
                this._donePromiseResolve = resolve;
            });
            this._adUnitContainer.addEventHandler(this);
            this._unityPrivacyView.render();
            document.body.appendChild(this._unityPrivacyView.container());

            this._unityPrivacyView.show();

            if (this._privacySDK.isAgeGateEnabled()) {
                PrivacyMetrics.trigger(PrivacyEvent.AGE_GATE_SHOW);
            } else if (this._privacySDK.getGamePrivacy().getMethod() === PrivacyMethod.UNITY_CONSENT) {
                PrivacyMetrics.trigger(PrivacyEvent.CONSENT_SHOW);
            }

            return donePromise;
        }).catch((e: Error) => {
            this._core.Sdk.logWarning('Error opening Privacy view ' + e);
            this.closePrivacy();
        });
    }

    // IAdUnitContainerListener
    public onContainerShow(): void {
        // Blank
    }

    // IAdUnitContainerListener
    public onContainerDestroy(): void {
        if (this._showing) {
            this._showing = false;
            this._adUnitContainer.removeEventHandler(this);
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
    public onContainerBackground(): void {
        // Blank
    }

    // IAdUnitContainerListener
    public onContainerForeground(): void {
        // Blank
    }

    // IAdUnitContainerListener
    public onContainerSystemMessage(message: AdUnitContainerSystemMessage): void {
        // Blank
    }

    public description(): string {
        return 'Privacy';
    }

    public setConsent(permissions: IPrivacyPermissions, userAction: GDPREventAction, source: GDPREventSource): void {
        if (UserPrivacy.permissionsEql(permissions, UserPrivacy.PERM_ALL_TRUE)) {
            PrivacyMetrics.trigger(PrivacyEvent.CONSENT_ACCEPT_ALL, permissions);
        } else if (UserPrivacy.permissionsEql(permissions, UserPrivacy.PERM_ALL_FALSE)) {
            PrivacyMetrics.trigger(PrivacyEvent.CONSENT_NOT_ACCEPTED, permissions);
        } else {
            PrivacyMetrics.trigger(PrivacyEvent.CONSENT_PARTIALLY_ACCEPTED, permissions);
        }
        this._privacyManager.updateUserPrivacy(permissions, source, userAction, this._landingPage);
    }

    public closePrivacy(): void {
        this._adUnitContainer.close().then(() => {
            if (this._platform !== Platform.IOS) {
                // Android will not trigger onCointainerDestroy if close()-was called, iOS will
                this.onContainerDestroy();
            }
        });
    }

    public openPrivacyUrl(url: string): void {
        if (this._platform === Platform.IOS) {
            this._core.iOS!.UrlScheme.open(url);
        } else if (this._platform === Platform.ANDROID) {
            this._core.Android!.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }

    public onPrivacyCompleted(params: IPrivacyCompletedParams): void {
        const { user, error } = params;

        if (error) {
            this._core.Sdk.logError(`Privacy error: ${error}`);
            this.closePrivacy();
            return;
        }

        this._core.Sdk.logDebug('PRIVACY: Got permissions: ' + JSON.stringify(user));

        let action: GDPREventAction;
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

        const { ads, external, gameExp, ageGateChoice } = user;
        const permissions: IPrivacyPermissions = { ads, external, gameExp };

        if (this._privacySDK.isAgeGateEnabled()) {
            if (ageGateChoice === AgeGateChoice.NO) {
                action = GDPREventAction.AGE_GATE_DISAGREE;
            }

            this._privacyManager.setUsersAgeGateChoice(ageGateChoice, AgeGateSource.USER);

            if (ageGateChoice === AgeGateChoice.NO || (this._privacySDK.getGamePrivacy().getMethod() === PrivacyMethod.UNITY_CONSENT)) {
                this.setConsent(permissions, action, GDPREventSource.USER);
            }
        } else {
            this.setConsent(permissions, action, GDPREventSource.USER);
        }

        this._unityPrivacyView.completeCallback();

        this.closePrivacy();
    }

    public onPrivacyReady(): void {
        this._unityPrivacyView.readyCallback(this._privacyConfig.getFlow(), {
            env: this._privacyConfig.getEnv(),
            user: this._privacyConfig.getUserSettings()
        });

        this._core.Sdk.logDebug('PRIVACY: Privacy ready');
    }

    public onPrivacyOpenUrl(url: string): void {
        this.openPrivacyUrl(url);
        this._unityPrivacyView.openUrlCallback(url);
    }

    public onPrivacyMetric(metric: { [key: string]: unknown }): void {
        this._requestManager.post(this._privacyMetricsUrl, JSON.stringify(metric))
          .catch(error => {
              this._core.Sdk.logError(`PRIVACY: sending metrics failed: ${error.message}`);
          });
    }

    public onPrivacyFetchUrl(data: IPrivacyFetchUrlParams): void {
        const { url, property } = data;
        this._requestManager.get(url).then((response) => {
            this._unityPrivacyView.fetchUrlCallback(JSON.parse(response.response), property);
        });
    }

    public onPrivacyViewError(event: string | Event): void {
        this.closePrivacy();
    }

    private getViewParams(parameters: IPrivacyUnitParameters): IPrivacySDKViewParameters {
        let viewParams: IPrivacySDKViewParameters = {
            platform: parameters.platform,
            privacyManager: parameters.privacyManager,
            landingPage: this._landingPage,
            language: parameters.deviceInfo.getLanguage(),
            consentABTest: false,
            ageGateLimit: this._privacySDK.getAgeGateLimit(),
            core: this._core
        };

        if (this._platform === Platform.ANDROID) {
            viewParams = {
                ... viewParams,
                apiLevel: (<AndroidDeviceInfo>parameters.deviceInfo).getApiLevel()
            };
        } else if (this._platform === Platform.IOS) {
            viewParams = {
                ... viewParams,
                osVersion: parameters.deviceInfo.getOsVersion()
            };
        }

        return viewParams;
    }
}
