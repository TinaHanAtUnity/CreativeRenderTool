import {
    AdUnitContainer,
    AdUnitContainerSystemMessage,
    IAdUnit,
    Orientation
} from 'Ads/AdUnits/Containers/AdUnitContainer';
import { AgeGateChoice, GDPREventAction, GDPREventSource, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Platform } from 'Core/Constants/Platform';
import { Consent, ConsentPage, IConsentViewParameters } from 'Ads/Views/Consent/Consent';
import { IConsentViewHandler } from 'Ads/Views/Consent/IConsentViewHandler';
import { IPermissions, PrivacyMethod } from 'Privacy/Privacy';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { ICoreApi } from 'Core/ICore';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { ABGroup } from 'Core/Models/ABGroup';
import { PrivacySDK } from 'Privacy/PrivacySDK';

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

export class ConsentUnit implements IConsentViewHandler, IAdUnit {
    private _donePromiseResolve: () => void;
    private _showing: boolean;
    private _adUnitContainer: AdUnitContainer;
    private _unityConsentView: Consent;
    private readonly _platform: Platform;
    private readonly _landingPage: ConsentPage;
    private _privacyManager: UserPrivacyManager;
    private _adsConfig: AdsConfiguration;
    private _core: ICoreApi;
    private _privacySDK: PrivacySDK;
    private _ageGateChoice: AgeGateChoice = AgeGateChoice.MISSING;

    constructor(parameters: IConsentUnitParameters) {
        this._adUnitContainer = parameters.adUnitContainer;
        this._platform = parameters.platform;
        this._privacyManager = parameters.privacyManager;
        this._adsConfig = parameters.adsConfig;
        this._core = parameters.core;
        this._privacySDK = parameters.privacySDK;

        this._landingPage = this._privacySDK.isAgeGateEnabled() ? ConsentPage.AGE_GATE : ConsentPage.HOMEPAGE;

        let viewParams: IConsentViewParameters = {
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
        this._unityConsentView = new Consent(viewParams);
        this._unityConsentView.addEventHandler(this);
    }

    public show(options: unknown): Promise<void> {
        this._showing = true;
        return this._adUnitContainer.open(this, ['webview'], false, Orientation.NONE, true, true, true, false, options).then(() => {
            const donePromise = new Promise<void>((resolve) => {
                this._donePromiseResolve = resolve;
            });
            this._adUnitContainer.addEventHandler(this);
            this._unityConsentView.render();
            document.body.appendChild(this._unityConsentView.container());

            this._unityConsentView.show();

            if (TestEnvironment.get('autoAcceptConsent')) {
                const consentValues = JSON.parse(TestEnvironment.get('autoAcceptConsent'));
                this.handleAutoConsent(consentValues);
            }
            return donePromise;
        }).catch((e: Error) => {
            this._core.Sdk.logWarning('Error opening Consent view ' + e);
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
            if (this._unityConsentView.container().parentElement) {
                document.body.removeChild(this._unityConsentView.container());
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
        this._privacyManager.updateUserPrivacy(permissions, source, this._ageGateChoice, this._landingPage);
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
        // todo: use storage to save user's decision

        this._ageGateChoice = AgeGateChoice.NO;

        if (this._privacySDK.getGamePrivacy().getMethod() === PrivacyMethod.UNITY_CONSENT) {
            const permissions: IPermissions = {
                gameExp: false,
                ads: false,
                external: false
            };
            this._privacyManager.updateUserPrivacy(permissions, GDPREventSource.USER, AgeGateChoice.NO, ConsentPage.AGE_GATE);
        } else {
            this._privacyManager.sendGDPREvent(GDPREventAction.OPTOUT, AgeGateChoice.NO, GDPREventSource.USER);
        }
    }

    public onAgeGateAgree(): void {
        this._ageGateChoice = AgeGateChoice.YES;
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

    private handleAutoConsent(consent: IPermissions) {
        setTimeout(() => {
            if (consent.hasOwnProperty('all')) {
                this._core.Sdk.logInfo('setting autoAcceptConsent with All True based on ' + JSON.stringify(consent));
                this._unityConsentView.testAutoConsentAll();
            }
            if (consent.hasOwnProperty('ads')) {
                this._core.Sdk.logInfo('setting autoAcceptConsent with Personalized Consent based on ' + JSON.stringify(consent));
                this._unityConsentView.testAutoConsent(consent);
            }
        }, 3000);
    }

    public description(): string {
        return 'Consent';
    }

    private getNextAction(currentPage: ConsentPage): void {
        const gamePrivacyMethod = this._privacySDK.getGamePrivacy().getMethod();

        if (gamePrivacyMethod === PrivacyMethod.LEGITIMATE_INTEREST) {
            // return ACTION_CLOSE
        } else if (gamePrivacyMethod === PrivacyMethod.UNITY_CONSENT) {
            // return ACTION UNITY CONSENT
        } else {
            // return ACTION CLOSE
        }
    }
}
