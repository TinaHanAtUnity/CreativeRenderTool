import { View } from 'Core/Views/View';
import GDPRConsentSettingsTemplate from 'html/consent/gdpr-consent-settings.html';
import { Template } from 'Core/Utilities/Template';
import { PrivacyRowItemContainer } from 'Ads/Views/Consent/PrivacyRowItemContainer';
import { Platform } from 'Core/Constants/Platform';
import { GdprManager } from 'Ads/Managers/GdprManager';

export interface IConsentSettings {
    personalized: boolean;
}

export interface IGDPRConsentSettingsHandler {
    onClose(): void;
    onConsetSettings(consent: IConsentSettings): void;
}

export class GDPRConsentSettings extends View<IGDPRConsentSettingsHandler> {

    private _infoContainer: PrivacyRowItemContainer;

    constructor(platform: Platform, gdprManager: GdprManager) {
        super(platform, 'gdpr-consent-settings');
        this._template = new Template(GDPRConsentSettingsTemplate);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onBackButtonEvent(event),
                selector: '.back-button'
            }
        ];

        this._infoContainer = new PrivacyRowItemContainer({ platform: platform, gdprManager: gdprManager });
    }

    public render(): void {
        super.render();

        this._infoContainer.render();
        (<HTMLElement>this._container.querySelector('.info-container')).appendChild(this._infoContainer.container());
    }

    public show(): void {
        // no need to call super.show

        // gray line between main and sub checkbox
        // todo: maybe there is some better way to set correct height of the line
        const experienceLabel = <HTMLElement>this._container.querySelector('.personalized-experience-label');
        const adsLabel = <HTMLElement>this._container.querySelector('.personalized-ads-label');

        if(experienceLabel && adsLabel && adsLabel.offsetHeight > experienceLabel.offsetHeight) {
            const lineElement = this._container.querySelector('.sub-box-line');
            if (lineElement) {
                lineElement.classList.add('two-lines');
            }
        }

        const mainCheckbox = <HTMLInputElement>this._container.querySelector('#personalized-ads-checkbox');
        const subCheckbox = <HTMLInputElement>this._container.querySelector('#personalized-ads-3rd-party');
        if (subCheckbox) {
            subCheckbox.onchange = () => {
                if (subCheckbox.checked) {
                    mainCheckbox.checked = true;
                }
            };
        }

        if (mainCheckbox) {
            mainCheckbox.onchange = () => {
                if (!mainCheckbox.checked) {
                    subCheckbox.checked = false;
                }
            };
        }
    }

    private onBackButtonEvent(event: Event): void {
        event.preventDefault();

        this.hide();
    }
}
