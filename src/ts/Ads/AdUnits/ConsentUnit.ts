import {
    AdUnitContainer,
    AdUnitContainerSystemMessage,
    IAdUnit,
    Orientation
} from 'Ads/AdUnits/Containers/AdUnitContainer';
import { GDPREventSource, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Platform } from 'Core/Constants/Platform';
import { UnityConsent } from 'Ads/Views/Consent/UnityConsent';
import { Consent, ConsentPage, IUnityConsentViewParameters } from 'Ads/Views/Consent/Consent';
import { IConsentViewHandler } from 'Ads/Views/Consent/IConsentViewHandler';
import { IPermissions } from 'Ads/Models/Privacy';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { ICoreApi } from 'Core/ICore';
import { UnityConsentSettings } from 'Ads/Views/Consent/UnityConsentSettings';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';

export interface IConsentUnitParameters {
    platform: Platform;
    privacyManager: UserPrivacyManager;
    adUnitContainer: AdUnitContainer;
    adsConfig: AdsConfiguration;
    core: ICoreApi;
    deviceInfo: DeviceInfo;
}

export class ConsentUnit implements IConsentViewHandler, IAdUnit {
    private _donePromiseResolve: () => void;
    private _showing: boolean;
    private _adUnitContainer: AdUnitContainer;
    private _unityConsentView: UnityConsent | Consent;
    private _consentSettingsView: UnityConsentSettings;
    private _platform: Platform;
    private _privacyManager: UserPrivacyManager;
    private _adsConfig: AdsConfiguration;
    private _core: ICoreApi;

    constructor(parameters: IConsentUnitParameters) {
        this._adUnitContainer = parameters.adUnitContainer;
        this._platform = parameters.platform;
        this._privacyManager = parameters.privacyManager;
        this._adsConfig = parameters.adsConfig;
        this._core = parameters.core;

        this._consentSettingsView = new UnityConsentSettings(this._platform, parameters.privacyManager);
        this._consentSettingsView.addEventHandler(this);

        let viewParams: IUnityConsentViewParameters = {
            platform: parameters.platform,
                privacyManager: parameters.privacyManager,
            consentSettingsView: this._consentSettingsView,
            landingPage: ConsentPage.INTRO
        };

        if (this._platform === Platform.ANDROID) {
            viewParams = {
                ... viewParams,
                apiLevel: (<AndroidDeviceInfo>parameters.deviceInfo).getApiLevel()
            };
        }

        // todo:
        const abtest = true;

        if (abtest) {
            this._unityConsentView = new Consent(viewParams);
        } else {
            this._unityConsentView = new UnityConsent(viewParams);

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

            this._consentSettingsView.render();
            this._consentSettingsView.hide();
            document.body.appendChild(this._consentSettingsView.container());

            this._unityConsentView.show();

            if(TestEnvironment.get('autoAcceptConsent')) {
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

            if (this._consentSettingsView.container().parentElement) {
                document.body.removeChild(this._consentSettingsView.container());
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
            if(consent.hasOwnProperty('all')) {
                this._core.Sdk.logInfo('setting autoAcceptConsent with All True based on ' + JSON.stringify(consent));
                this._unityConsentView.testAutoConsentAll();
            }
            if(consent.hasOwnProperty('ads')) {
                this._core.Sdk.logInfo('setting autoAcceptConsent with Personalized Consent based on ' + JSON.stringify(consent));
                if (this._consentSettingsView) {
                    this._consentSettingsView.testAutoConsent(consent);
                } else if (this._unityConsentView instanceof Consent) {
                    this._unityConsentView.testAutoConsent(consent);
                }
            }
        }, 3000);
    }

    public description(): string {
        return 'Consent';
    }
}
