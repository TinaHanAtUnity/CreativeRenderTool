import { View } from 'Core/Views/View';
import GDPRConsentSettingsTemplate from 'html/consent/gdpr-consent-settings.html';
import { Template } from 'Core/Utilities/Template';
import { PrivacyRowItemContainer } from 'Ads/Views/Consent/PrivacyRowItemContainer';
import { Platform } from 'Core/Constants/Platform';

export interface IConsentSettings {
    personalized: boolean;
}

export interface IGDPRConsentSettingsHandler {
    onClose(): void;
    onConsetSettings(consent: IConsentSettings): void;
}

export class GDPRConsentSettings extends View<IGDPRConsentSettingsHandler> {

    private _infoContainer: PrivacyRowItemContainer;

    constructor(platform: Platform) {
        super(platform, 'gdpr-consent-settings');
        this._template = new Template(GDPRConsentSettingsTemplate);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onBackButtonEvent(event),
                selector: '.back-button'
            }
        ];

        this._infoContainer = new PrivacyRowItemContainer(platform);
    }

    public render(): void {
        super.render();

        this._infoContainer.render();
        (<HTMLElement>this._container.querySelector('.info-container')).appendChild(this._infoContainer.container());
    }

    private onBackButtonEvent(event: Event): void {
        event.preventDefault();

        this.hide();
    }
}
