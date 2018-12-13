import { AdUnitContainer, AdUnitContainerSystemMessage, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { GDPREventSource, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Platform } from 'Core/Constants/Platform';
import { GDPRConsent } from 'Ads/Views/Consent/GDPRConsent';
import { IConsentViewHandler } from 'Ads/Views/Consent/IConsentViewHandler';
import { IPermissions } from 'Ads/Models/Privacy';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { ICoreApi } from 'Core/ICore';
import { GDPRConsentSettings } from 'Ads/Views/Consent/GDPRConsentSettings';

export interface IConsentUnitParameters {
    platform: Platform;
    privacyManager: UserPrivacyManager;
    adUnitContainer: AdUnitContainer;
    adsConfig: AdsConfiguration;
    core: ICoreApi;
}

export class ConsentUnit implements IConsentViewHandler {
    private _donePromiseResolve: () => void;
    private _showing: boolean;
    private _adUnitContainer: AdUnitContainer;
    private _gdprConsentView: GDPRConsent;
    private _consentSettingsView: GDPRConsentSettings;
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

        this._consentSettingsView = new GDPRConsentSettings(this._platform, parameters.privacyManager);
        this._consentSettingsView.addEventHandler(this);
        this._gdprConsentView = new GDPRConsent({
            platform: parameters.platform,
            privacyManager: parameters.privacyManager,
            consentSettingsView: this._consentSettingsView
        });
        this._gdprConsentView.addEventHandler(this);

    }

    public show(options: unknown): Promise<void> {
        this._showing = true;
        return this._adUnitContainer.open('Consent', ['webview'], false, Orientation.NONE, true, true, true, false, options).then(() => {
            const donePromise = new Promise<void>((resolve) => {
                this._donePromiseResolve = resolve;
            });
            this._adUnitContainer.addEventHandler(this);
            this._gdprConsentView.render();
            document.body.appendChild(this._gdprConsentView.container());

            this._consentSettingsView.render();
            this._consentSettingsView.hide();
            document.body.appendChild(this._consentSettingsView.container());

            this._gdprConsentView.show();
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
            if (this._gdprConsentView.container().parentElement) {
                document.body.removeChild(this._gdprConsentView.container());
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
}
