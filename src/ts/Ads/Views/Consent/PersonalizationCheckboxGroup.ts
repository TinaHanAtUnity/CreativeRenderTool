import { View } from 'Core/Views/View';
import CheckBoxGroupTemplate from 'html/consent/personalization-checkbox-group.html';
import { Template } from 'Core/Utilities/Template';
import { Platform } from 'Core/Constants/Platform';
import { IPersonalizedConsent } from 'Ads/Views/Consent/IPermissions';

export class PersonalizationCheckboxGroup extends View<{}> {

    private _currentPersonalizedConsent?: IPersonalizedConsent;
    private _personalizedExpCheckbox: HTMLInputElement;
    private _personalizedAdsCheckbox: HTMLInputElement;
    private _personalized3rdPartyCheckbox: HTMLInputElement;

    constructor(platform: Platform, currentConsent?: IPersonalizedConsent) {
        super(platform, 'personalization-checkbox-group');

        this._currentPersonalizedConsent = currentConsent;
        this._template = new Template(CheckBoxGroupTemplate);

        this._bindings = [];
    }

    public render(): void {
        super.render();

        this._personalizedExpCheckbox = <HTMLInputElement>this._container.querySelector('#personalized-experience-checkbox');
        this._personalizedAdsCheckbox = <HTMLInputElement>this._container.querySelector('#personalized-ads-checkbox');
        this._personalized3rdPartyCheckbox = <HTMLInputElement>this._container.querySelector('#personalized-ads-3rd-party');

        if (this._currentPersonalizedConsent) {
            this._personalizedExpCheckbox.checked = this._currentPersonalizedConsent.gameExp;
            this._personalizedAdsCheckbox.checked = this._currentPersonalizedConsent.ads;
            this._personalized3rdPartyCheckbox.checked = this._currentPersonalizedConsent.external;
        }

    }

    public show(): void {
        // todo: set values from configuration

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

        if (this._personalized3rdPartyCheckbox) {
            this._personalized3rdPartyCheckbox.onchange = () => {
                if (this._personalized3rdPartyCheckbox.checked) {
                    this._personalizedAdsCheckbox.checked = true;
                }
            };
        }

        if (this._personalizedAdsCheckbox) {
            this._personalizedAdsCheckbox.onchange = () => {
                if (!this._personalizedAdsCheckbox.checked) {
                    this._personalized3rdPartyCheckbox.checked = false;
                }
            };
        }
    }

    public isPersonalizedExperienceChecked(): boolean {
        return this._personalizedExpCheckbox ? this._personalizedExpCheckbox.checked : false;
    }

    public isPersonalizedAdsChecked(): boolean {
        return this._personalizedAdsCheckbox ? this._personalizedAdsCheckbox.checked : false;
    }

    public isAds3rdPartyChecked(): boolean {
        return this._personalized3rdPartyCheckbox ? this._personalized3rdPartyCheckbox.checked : false;
    }

}
