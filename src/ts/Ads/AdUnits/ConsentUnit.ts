import {
    AdUnitContainer,
    AdUnitContainerSystemMessage,
    IAdUnit,
    Orientation
} from 'Ads/AdUnits/Containers/AdUnitContainer';
import { GDPREventSource, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Platform } from 'Core/Constants/Platform';
import { Consent, ConsentPage, IConsentViewParameters } from 'Ads/Views/Consent/Consent';
import { IPermissions } from 'Privacy/Privacy';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { ICoreApi } from 'Core/ICore';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { ABGroup, ConsentUXTest } from 'Core/Models/ABGroup';
import { PrivacyView } from 'Ads/Views/Consent/PrivacyView';
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

        let viewParams: IConsentViewParameters = {
            platform: parameters.platform,
            privacyManager: parameters.privacyManager,
            landingPage: this._landingPage,
            pts: parameters.pts,
            language: parameters.deviceInfo.getLanguage(),
            consentABTest: ConsentUXTest.isValid(parameters.abGroup),
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

            if (this._privacySDK.isAgeGateEnabled()) {
                PrivacyMetrics.trigger(PrivacyEvent.AGE_GATE_SHOW);
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

    public onPrivacy(url: string): void {
        // BLANK
    }

    public onAgeGateDisagree(): void {
        // BLANK
    }

    public onAgeGateAgree(): void {
        // BLANK
    }

    public description(): string {
        return 'Consent';
    }
}
