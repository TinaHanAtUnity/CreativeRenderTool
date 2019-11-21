import {
    AdUnitContainer,
    AdUnitContainerSystemMessage,
    IAdUnit,
    Orientation
} from 'Ads/AdUnits/Containers/AdUnitContainer';
import { AgeGateChoice, GDPREventSource, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Platform } from 'Core/Constants/Platform';
import { Privacy, ConsentPage, IPrivacyViewParameters } from 'Ads/Views/Privacy/Privacy';
import { IPrivacyViewHandler } from 'Ads/Views/Privacy/IPrivacyViewHandler';
import { IPermissions } from 'Privacy/Privacy';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { ICoreApi } from 'Core/ICore';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { ABGroup } from 'Core/Models/ABGroup';
import { PrivacyView } from 'Ads/Views/Privacy/PrivacyView';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { PrivacyEvent, PrivacyMetrics } from 'Privacy/PrivacyMetrics';
import { PrivacyConfig } from 'Privacy/PrivacyConfig';
import { IPrivacySettings } from 'Privacy/IPrivacySettings';

export interface IConsentUnitParameters {
    abGroup: ABGroup;
    platform: Platform;
    privacyManager: UserPrivacyManager;
    adUnitContainer: AdUnitContainer;
    adsConfig: AdsConfiguration;
    core: ICoreApi;
    deviceInfo: DeviceInfo;
    pts: ProgrammaticTrackingService;
    privacySDK: PrivacySDK;
}

export class PrivacyUnit implements IPrivacyViewHandler, IAdUnit {
    private _donePromiseResolve: () => void;
    private _showing: boolean;
    private _adUnitContainer: AdUnitContainer;
    private _unityPrivacyView: PrivacyView;
    private readonly _platform: Platform;
    private readonly _landingPage: ConsentPage;
    private _privacyManager: UserPrivacyManager;
    private _adsConfig: AdsConfiguration;
    private _core: ICoreApi;
    private _privacySDK: PrivacySDK;
    private _privacyConfig: PrivacyConfig;

    constructor(parameters: IConsentUnitParameters) {
        this._adUnitContainer = parameters.adUnitContainer;
        this._platform = parameters.platform;
        this._privacyManager = parameters.privacyManager;
        this._adsConfig = parameters.adsConfig;
        this._core = parameters.core;
        this._privacySDK = parameters.privacySDK;

        this._landingPage = this._privacySDK.isAgeGateEnabled() ? ConsentPage.AGE_GATE : ConsentPage.HOMEPAGE;

        let viewParams: IPrivacyViewParameters = {
            platform: parameters.platform,
            privacyManager: parameters.privacyManager,
            landingPage: this._landingPage,
            pts: parameters.pts,
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
        this._unityPrivacyView = new PrivacyView(viewParams);
        this._unityPrivacyView.addEventHandler(this);
    }

    public show(options: unknown): Promise<void> {
        this._showing = true;
        return this._privacyManager.getPrivacyConfig().then((privacyConfig) => {
            this._privacyConfig = privacyConfig;
            this._unityPrivacyView.setPrivacyConfig(privacyConfig);
            // blank
        }).then(() => {
            return this._adUnitContainer.open(this, ['webview'], false, Orientation.NONE, true, true, true, false, options)
                .then(() => {
                    const donePromise = new Promise<void>((resolve) => {
                        this._donePromiseResolve = resolve;
                    });
                    this._adUnitContainer.addEventHandler(this);
                    this._unityPrivacyView.render();
                    document.body.appendChild(this._unityPrivacyView.container());

                    this._unityPrivacyView.show();
                    /*
                    if (this._privacySDK.isAgeGateEnabled()) {
                        PrivacyMetrics.trigger(PrivacyEvent.AGE_GATE_SHOW);
                    } else if (this._privacySDK.getGamePrivacy().getMethod() === PrivacyMethod.UNITY_CONSENT) {
                        PrivacyMetrics.trigger(PrivacyEvent.CONSENT_SHOW);
                    }

                    if (typeof TestEnvironment.get('autoAcceptAgeGate') === 'boolean') {
                        const ageGateValue = JSON.parse(TestEnvironment.get('autoAcceptAgeGate'));
                        this.handleAutoAgeGate(ageGateValue);
                    }*/

                    return donePromise;
                });
        }).catch((e: Error) => {
            this._core.Sdk.logWarning('Error opening Privacy view ' + e);
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

    // IConsentViewHandler
    public onConsent(permissions: IPermissions, source: GDPREventSource): void {
        if (permissions.hasOwnProperty('all') && permissions.hasOwnProperty('all').valueOf()) {
            PrivacyMetrics.trigger(PrivacyEvent.CONSENT_ACCEPT_ALL, permissions);
        } else if (!permissions.hasOwnProperty('ads').valueOf() && !permissions.hasOwnProperty('gameExp').valueOf() && !permissions.hasOwnProperty('external').valueOf()) {
            PrivacyMetrics.trigger(PrivacyEvent.CONSENT_NOT_ACCEPTED, permissions);
        } else {
            PrivacyMetrics.trigger(PrivacyEvent.CONSENT_PARTIALLY_ACCEPTED, permissions);
        }

        this._privacyManager.updateUserPrivacy(permissions, source, this._landingPage);
    }

    // IConsentViewHandler
    public onClose(): void {
        this._adUnitContainer.close().then(() => {
            if (this._platform !== Platform.IOS) {
                // Android will not trigger onCointainerDestroy if close()-was called, iOS will
                this.onContainerDestroy();
            }
        });
    }

    public onAgeGateDisagree(): void {
        // BLANK
    }

    public onAgeGateAgree(): void {
        this._privacyManager.setUsersAgeGateChoice(AgeGateChoice.YES);
    }

    public onPrivacy(url: string): void {
        // BLANK
    }
/*
    private handleAutoAgeGate(ageGate: boolean) {
        setTimeout(() => {
            this._core.Sdk.logInfo('setting autoAcceptAgeGate based on ' + ageGate);
            this._unityPrivacyView.testAutoAgeGate(ageGate);
        }, 3000);
    }

    private handleAutoConsent(consent: IPermissions) {
        setTimeout(() => {
            if (consent.hasOwnProperty('all')) {
                this._core.Sdk.logInfo('setting autoAcceptConsent with All True based on ' + JSON.stringify(consent));
                this._unityPrivacyView.testAutoConsentAll();
            }
            if (consent.hasOwnProperty('ads')) {
                this._core.Sdk.logInfo('setting autoAcceptConsent with Personalized Consent based on ' + JSON.stringify(consent));
                this._unityPrivacyView.testAutoConsent(consent);
            }
        }, 3000);
    }*/

    public description(): string {
        return 'Privacy';
    }

    public onPrivacyCompleted(userSettings: IPrivacySettings): void {
        this._core.Sdk.logDebug('PRIVACY: Got permissions: ' + JSON.stringify(userSettings));
        this._unityPrivacyView.completeCallback();

        this.onConsent({
            ... userSettings.user,
            profiling: false
        }, GDPREventSource.USER);

        if (userSettings.user.agreedOverAgeLimit) {
            this.onAgeGateAgree();
        }

        this.onClose();
    }

    public onPrivacyReady(): void {
        this._unityPrivacyView.readyCallback({
            env: this._privacyConfig.getEnv(),
            flow: this._privacyConfig.getFlow(),
            user: this._privacyConfig.getUserSettings()
        });

        this._core.Sdk.logDebug('PRIVACY: Privacy ready');
    }

    public onPrivacyEvent(name: string, data: { [key: string]: unknown }): void {
        this._unityPrivacyView.eventCallback(name);
        this._core.Sdk.logDebug('PRIVACY: Got event: ' + name + ' with data: ' + JSON.stringify(data));
    }

    public onPrivacyOpenUrl(url: string): void {
        if (this._platform === Platform.IOS) {
            this._core.iOS!.UrlScheme.open(url);
        } else if (this._platform === Platform.ANDROID) {
            this._core.Android!.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }
}
