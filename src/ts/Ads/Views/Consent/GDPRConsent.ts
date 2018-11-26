import { View } from 'Core/Views/View';
import GDPRConsentTemplate from 'html/consent/gdpr-consent.html';
import { Template } from 'Core/Utilities/Template';
import { GDPRConsentSettings } from 'Ads/Views/Consent/GDPRConsentSettings';
import { Platform } from 'Core/Constants/Platform';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { AdUnitContainerSystemMessage } from 'Ads/AdUnits/Containers/AdUnitContainer';

export interface IGDPRConsentViewParameters {
    platform: Platform;
    gdprManager: GdprManager;
}

export interface IGDPRConsentHandler {
    onConsent(consent: boolean): void;
    onShowOptions(): void;
}

export class GDPRConsent extends View<IGDPRConsentHandler> {
    private _parameters: IGDPRConsentViewParameters;
    private _consentSettingsView: GDPRConsentSettings;
    private _doneCallback: () => void;
    private _closeCallback: () => void;
    private _isShowing: boolean;

    constructor(parameters: IGDPRConsentViewParameters) {
        super(parameters.platform, 'gdpr-consent');

        this._parameters = parameters;
        this._template = new Template(GDPRConsentTemplate);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onAgreeEvent(event),
                selector: '.agree'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onOptionsEvent(event),
                selector: '.show-options'
            }
        ];
    }

    public show(): void {
        this._isShowing = true;
        super.show();
    }

    public hide(): void {
        super.hide();

        if (this._consentSettingsView) {
            this._consentSettingsView.hide();
            document.body.removeChild(this._consentSettingsView.container());
            delete this._consentSettingsView;
        }

    }

    // TODO: I feel this could be done neater
    public setDoneCallback(callback: () => void): void {
        this._doneCallback = callback;
    }

    public setCloseCallback(callback: () => void): void {
        this._closeCallback = callback;
    }

    public onContainerShow(): void {
        // Blank
    }

    public onContainerDestroy(): void {
        if (this._isShowing) {
            this._isShowing = false;
            this._closeCallback();
        }
    }

    public onContainerBackground(): void {
        // Blank
    }

    public onContainerForeground(): void {
        // Blank
    }

    public onContainerSystemMessage(message: AdUnitContainerSystemMessage): void {
        // Blank
    }

    private onAgreeEvent(event: Event) {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onConsent(true));
        this.hide();
        this._doneCallback();
    }

    private onOptionsEvent(event: Event) {
        event.preventDefault();

        if (!this._consentSettingsView) {
            this._consentSettingsView = new GDPRConsentSettings(this._platform, this._parameters.gdprManager);
            this._consentSettingsView.render();

            document.body.appendChild(this._consentSettingsView.container());
        }

        this._consentSettingsView.show();
    }
}
