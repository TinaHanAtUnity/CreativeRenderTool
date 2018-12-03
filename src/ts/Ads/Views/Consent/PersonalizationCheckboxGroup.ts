import { View } from 'Core/Views/View';
import CheckBoxGroupTemplate from 'html/consent/personalization-checkbox-group.html';
import { Template } from 'Core/Utilities/Template';
import { Platform } from 'Core/Constants/Platform';

export class PersonalizationCheckboxGroup extends View<{}> {

    constructor(platform: Platform) {
        super(platform, 'personalization-checkbox-group');

        this._template = new Template(CheckBoxGroupTemplate);

        this._bindings = [];
    }

    public show(): void {
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

    public isPersonalizedExperienceChecked(): boolean {
        const experienceCheckbox = <HTMLInputElement>this._container.querySelector('#personalized-experience-checkbox');

        return experienceCheckbox ? experienceCheckbox.checked : false;
    }

    public isPersonalizedAdsChecked(): boolean {
        const adsCheckbox = <HTMLInputElement>this._container.querySelector('#personalized-ads-checkbox');

        return adsCheckbox ? adsCheckbox.checked : false;
    }

    public isAds3rdPartyChecked(): boolean {
        const ads3rdPartyCheckbox = <HTMLInputElement>this._container.querySelector('#personalized-ads-3rd-party');

        return ads3rdPartyCheckbox ? ads3rdPartyCheckbox.checked : false;
    }

}
