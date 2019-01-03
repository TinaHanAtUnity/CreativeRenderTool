import { View } from 'Core/Views/View';
import CheckBoxGroupTemplate from 'html/consent/personalization-checkbox-group.html';
import { Template } from 'Core/Utilities/Template';
import { Platform } from 'Core/Constants/Platform';
import { IGranularPermissions } from 'Ads/Models/Privacy';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';

export class PersonalizationCheckboxGroup extends View<{}> {

    private _userPrivacyManager: UserPrivacyManager;

    private _personalizedExpCheckbox: HTMLInputElement;
    private _personalizedAdsCheckbox: HTMLInputElement;
    private _personalized3rdPartyCheckbox: HTMLInputElement;

    constructor(platform: Platform, userPrivacyManager: UserPrivacyManager) {
        super(platform, 'personalization-checkbox-group');

        this._userPrivacyManager = userPrivacyManager;

        this._template = new Template(CheckBoxGroupTemplate);

        this._bindings = [];
    }

    public render(): void {
        super.render();

        this._personalizedExpCheckbox = <HTMLInputElement>this._container.querySelector('#personalized-experience-checkbox');
        this._personalizedAdsCheckbox = <HTMLInputElement>this._container.querySelector('#personalized-ads-checkbox');
        this._personalized3rdPartyCheckbox = <HTMLInputElement>this._container.querySelector('#personalized-ads-3rd-party');
    }

    public show(): void {
        const permissions: IGranularPermissions = this._userPrivacyManager.getGranularPermissions();

        this._personalizedExpCheckbox.checked = permissions.gameExp;
        this._personalizedAdsCheckbox.checked = permissions.ads;
        this._personalized3rdPartyCheckbox.checked = permissions.external;

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

        this._personalized3rdPartyCheckbox.onchange = () => {
            if (this._personalized3rdPartyCheckbox.checked) {
                this._personalizedAdsCheckbox.checked = true;
            }
        };

        this._personalizedAdsCheckbox.onchange = () => {
            if (!this._personalizedAdsCheckbox.checked) {
                this._personalized3rdPartyCheckbox.checked = false;
            }
        };
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

    public checkCheckboxes(checked: boolean) {
        if (this._personalizedExpCheckbox && this._personalizedAdsCheckbox && this._personalized3rdPartyCheckbox) {
            this._personalizedExpCheckbox.checked = checked;
            this._personalizedAdsCheckbox.checked = checked;
            this._personalized3rdPartyCheckbox.checked = checked;
        }
    }

}
