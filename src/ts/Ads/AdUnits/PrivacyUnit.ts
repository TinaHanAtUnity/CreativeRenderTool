import {
    AdUnitContainer,
    AdUnitContainerSystemMessage,
    IAdUnit,
    Orientation
} from 'Ads/AdUnits/Containers/AdUnitContainer';
import { AgeGateChoice, GDPREventAction, GDPREventSource, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Platform } from 'Core/Constants/Platform';
import { Privacy, ConsentPage, IPrivacyViewParameters } from 'Ads/Views/Privacy/Privacy';
import { IPrivacyViewHandler } from 'Ads/Views/Privacy/IPrivacyViewHandler';
import { IPermissions, PrivacyMethod } from 'Privacy/Privacy';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { ICoreApi } from 'Core/ICore';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { ABGroup, ConsentUXTest } from 'Core/Models/ABGroup';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { PrivacyEvent, PrivacyMetrics } from 'Privacy/PrivacyMetrics';

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
    private _unityPrivacyView: Privacy;
    private readonly _platform: Platform;
    private readonly _landingPage: ConsentPage;
    private _privacyManager: UserPrivacyManager;
    private _adsConfig: AdsConfiguration;
    private _core: ICoreApi;
    private _privacySDK: PrivacySDK;

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
            ageGateLimit: this._privacySDK.getAgeGateLimit()
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
        this._unityPrivacyView = new Privacy(viewParams);
        this._unityPrivacyView.addEventHandler(this);
    }

    public show(options: unknown): Promise<void> {
        this._showing = true;
        return this._adUnitContainer.open(this, ['webview'], false, Orientation.NONE, true, true, true, false, options).then(() => {
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

            if (typeof TestEnvironment.get('autoAcceptAgeGate') === 'boolean') {
                const ageGateValue = JSON.parse(TestEnvironment.get('autoAcceptAgeGate'));
                this.handleAutoAgeGate(ageGateValue);
            }

            if (TestEnvironment.get('autoAcceptConsent')) {
                const consentValues = JSON.parse(TestEnvironment.get('autoAcceptConsent'));
                this.handleAutoConsent(consentValues);
            }
            return donePromise;
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

    // IConsentViewHandler
    public onAgeGateDisagree(): void {
        this._privacyManager.setUsersAgeGateChoice(AgeGateChoice.NO);

        if (this._privacySDK.getGamePrivacy().getMethod() === PrivacyMethod.UNITY_CONSENT) {
            const permissions: IPermissions = {
                gameExp: false,
                ads: false,
                external: false
            };
            this._privacyManager.updateUserPrivacy(permissions, GDPREventSource.USER, ConsentPage.AGE_GATE);
        } else {
            this._privacySDK.setOptOutRecorded(true);
            this._privacySDK.setOptOutEnabled(true);

            const gamePrivacy = this._privacySDK.getGamePrivacy();
            const userPrivacy = this._privacySDK.getUserPrivacy();

            if (userPrivacy) {
                userPrivacy.update({
                    method: gamePrivacy.getMethod(),
                    version: 0,
                    permissions: {
                        all: false,
                        ads: false,
                        external: false,
                        gameExp: false
                    }
                });
            }

            this._privacyManager.sendGDPREvent(GDPREventAction.OPTOUT, GDPREventSource.USER);
        }
    }

    public onAgeGateAgree(): void {
        this._privacyManager.setUsersAgeGateChoice(AgeGateChoice.YES);

        if (this._privacySDK.getGamePrivacy().getMethod() === PrivacyMethod.UNITY_CONSENT) {
            // todo: handle the flow inside view class
            this._unityPrivacyView.showPage(ConsentPage.HOMEPAGE);
        } else {
            this._unityPrivacyView.closeAgeGateWithAgreeAnimation();
        }
    }

    public onPrivacy(url: string): void {
        if (this._platform === Platform.IOS) {
            this._core.iOS!.UrlScheme.open(url);
        } else if (this._platform === Platform.ANDROID) {
            this._core.Android!.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }

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
    }

    public description(): string {
        return 'Privacy';
    }
}
