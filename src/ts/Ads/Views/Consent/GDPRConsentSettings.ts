import { View } from 'Core/Views/View';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import GDPRConsentSettingsTemplate from 'html/consent/gdpr-consent-settings.html';
import { Template } from 'Core/Utilities/Template';
import { PrivacyInfoContainer } from 'Ads/Views/Consent/PrivacyInfoContainer';

export interface IConsentSettings {
    personalized: boolean;
}

export interface IGDPRConsentSettingsHandler {
    onClose(): void;
    onConsetSettings(consent: IConsentSettings): void;
}

export class GDPRConsentSettings extends View<IGDPRConsentSettingsHandler> {

    private _infoContainer: PrivacyInfoContainer;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'gdpr-consent-settings');

        this._template = new Template(GDPRConsentSettingsTemplate);

        this._bindings = [
            {
            event: 'click',
            listener: (event: Event) => this.onBackButtonEvent(event),
            selector: '.back-button'

            }
        ];

        this._infoContainer = new PrivacyInfoContainer(nativeBridge);
    }

    public render(): void {
        super.render();

        this._infoContainer.render();
        (<HTMLElement>this._container.querySelector('.info-container')).appendChild(this._infoContainer.container());
    }

    public hide(): void {
        super.hide();

        this._infoContainer.hide();
        if(this._infoContainer.container().parentElement) {
            this._infoContainer.container().parentElement!.removeChild(this._infoContainer.container());
        }
    }

    private onBackButtonEvent(event: Event): void {
        event.preventDefault();

        this.hide();
    }
}
