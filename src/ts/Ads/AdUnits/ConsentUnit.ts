import { AdUnitContainer, AdUnitContainerSystemMessage, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Platform } from 'Core/Constants/Platform';
import { GDPRConsent, IGDPRConsentHandler } from 'Ads/Views/Consent/GDPRConsent';
import { IPermissions } from 'Ads/Models/Privacy';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { ICoreApi } from 'Core/ICore';

export interface IConsentUnitParameters {
    platform: Platform;
    gdprManager: UserPrivacyManager;
    adUnitContainer: AdUnitContainer;
    adsConfig: AdsConfiguration;
    core: ICoreApi;
}

export class ConsentUnit implements IGDPRConsentHandler {
    private _donePromiseResolve: () => void;
    private _showing: boolean;
    private _adUnitContainer: AdUnitContainer;
    private _gdprConsentView: GDPRConsent;
    private _platform: Platform;
    private _adsConfig: AdsConfiguration;
    private _core: ICoreApi;

    constructor(parameters: IConsentUnitParameters) {
        this._gdprConsentView = new GDPRConsent({
            platform: parameters.platform,
            gdprManager: parameters.gdprManager
        });
        this._adUnitContainer = parameters.adUnitContainer;
        this._gdprConsentView.addEventHandler(this);
        this._platform = parameters.platform;
        this._adsConfig = parameters.adsConfig;
        this._core = parameters.core;
    }

    public show(options: any): Promise<void> {
        this._showing = true;
        return this._adUnitContainer.open('Consent', ['webview'], false, Orientation.NONE, true, true, true, false, options).then(() => {
            const donePromise = new Promise<void>((resolve) => {
                this._donePromiseResolve = resolve;
            });
            this._adUnitContainer.addEventHandler(this);
            this._gdprConsentView.render();
            document.body.appendChild(this._gdprConsentView.container());
            this._gdprConsentView.show();
            return donePromise;
        }).catch((e: Error) => {
            // this._core.Api.Sdk.logWarning('Error opening Consent view ' + e);
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

    // IGDPRConsentHandler
    public onConsent(consent: IPermissions): void {
        this._adsConfig.addUserConsent(consent);
    }

    // IGDPRConsentHandler
    public onConsentHide(): void {
        this._adUnitContainer.close().then(() => {
            if (this._platform !== Platform.IOS) {
                // Android will not trigger onCointainerDestroy if close()-was called, iOS will
                this.onContainerDestroy();
            }
        });
    }

    public onPrivacy(url: string): void {
        console.log(url);
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
