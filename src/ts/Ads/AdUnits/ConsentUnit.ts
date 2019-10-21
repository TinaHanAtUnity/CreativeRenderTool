import {
    AdUnitContainer,
    AdUnitContainerSystemMessage,
    IAdUnit,
    Orientation
} from 'Ads/AdUnits/Containers/AdUnitContainer';
import { AgeGateChoice, GDPREventAction, GDPREventSource, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Platform } from 'Core/Constants/Platform';
import { Consent, ConsentPage, IConsentViewParameters } from 'Ads/Views/Consent/Consent';
import { IPermissions, PrivacyMethod } from 'Privacy/Privacy';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { ICore, ICoreApi } from 'Core/ICore';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { ABGroup } from 'Core/Models/ABGroup';
import { PrivacyView } from 'Ads/Views/Consent/PrivacyView';
import { PrivacySDK } from 'Privacy/PrivacySDK';

export interface IConsentUnitParameters {
    abGroup: ABGroup;
    platform: Platform;
    privacyManager: UserPrivacyManager;
    adUnitContainer: AdUnitContainer;
    adsConfig: AdsConfiguration;
    core: ICore;
    coreApi: ICoreApi;
    deviceInfo: DeviceInfo;
    pts: ProgrammaticTrackingService;
    privacySDK: PrivacySDK;
}

export interface IPrivacyViewHandler {
    onConsent(consent: IPermissions, source: GDPREventSource): void;
}

export class ConsentUnit implements IPrivacyViewHandler, IAdUnit {
    private _donePromiseResolve: () => void;
    private _showing: boolean;
    private _adUnitContainer: AdUnitContainer;
    private _unityConsentView: PrivacyView;
    private readonly _platform: Platform;
    private readonly _landingPage: ConsentPage;
    private readonly _core: ICore;
    private readonly _coreApi: ICoreApi;
    private _privacyManager: UserPrivacyManager;
    private _adsConfig: AdsConfiguration;
    private _privacySDK: PrivacySDK;

    constructor(parameters: IConsentUnitParameters) {
        this._adUnitContainer = parameters.adUnitContainer;
        this._platform = parameters.platform;
        this._privacyManager = parameters.privacyManager;
        this._adsConfig = parameters.adsConfig;
        this._core = parameters.core;
        this._coreApi = parameters.coreApi;
        this._privacySDK = parameters.privacySDK;

        this._landingPage = this._privacySDK.isAgeGateEnabled() ? ConsentPage.AGE_GATE : ConsentPage.HOMEPAGE;

        let viewParams: IConsentViewParameters = {
            platform: parameters.platform,
            privacyManager: parameters.privacyManager,
            landingPage: this._landingPage,
            pts: parameters.pts,
            language: parameters.deviceInfo.getLanguage(),
            consentABTest: false,
            ageGateLimit: this._privacySDK.getAgeGateLimit(),
            core: this._core,
            coreApi: this._coreApi
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
        this._unityConsentView = new PrivacyView(viewParams);
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
            this._coreApi.Sdk.logWarning('##PRIVACY: Error opening Consent view ' + e);
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
        this._privacyManager.updateUserPrivacy(permissions, source);
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
    }

    public onPrivacy(url: string): void {
        if (this._platform === Platform.IOS) {
            this._coreApi.iOS!.UrlScheme.open(url);
        } else if (this._platform === Platform.ANDROID) {
            this._coreApi.Android!.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }

    private handleAutoConsent(consent: IPermissions) {
        // TODO
    }

    public description(): string {
        return 'Consent';
    }
}
