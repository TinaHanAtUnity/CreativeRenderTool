import { View } from 'Core/Views/View';
import SwitchGroupTemplate from 'html/consent/personalization-switch-group.html';
import { Template } from 'Core/Utilities/Template';
import { Platform } from 'Core/Constants/Platform';
import { IGranularPermissions } from 'Privacy/Privacy';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Localization } from 'Core/Utilities/Localization';

export interface IPersonalizationSwitchGroupHandler {
    onSwitchGroupSelectionChange(): void;
}

export class PersonalizationSwitchGroup extends View<IPersonalizationSwitchGroupHandler> {

    private _userPrivacyManager: UserPrivacyManager;

    private _personalizedExpSwitch: HTMLInputElement;
    private _personalizedAdsSwitch: HTMLInputElement;
    private _personalized3rdPartySwitch: HTMLInputElement;

    constructor(platform: Platform, userPrivacyManager: UserPrivacyManager, language: string) {
        super(platform, 'personalization-switch-group');

        this._userPrivacyManager = userPrivacyManager;

        this._template = new Template(SwitchGroupTemplate, new Localization(language, 'consent'));

        this._bindings = [
            {
                event: 'change',
                listener: (event: Event) => this.onExpSwitchChange(event),
                selector: '#personalized-experience-switch'
            },
            {
                event: 'change',
                listener: (event: Event) => this.onAdsSwitchChange(event),
                selector: '#personalized-ads-switch'
            },
            {
                event: 'change',
                listener: (event: Event) => this.on3rdPartySwitchChange(event),
                selector: '#personalized-ads-3rd-party-switch'
            }
        ];
    }

    public render(): void {
        super.render();

        this._personalizedExpSwitch = <HTMLInputElement> this._container.querySelector('#personalized-experience-switch');
        this._personalizedAdsSwitch = <HTMLInputElement> this._container.querySelector('#personalized-ads-switch');
        this._personalized3rdPartySwitch = <HTMLInputElement> this._container.querySelector('#personalized-ads-3rd-party-switch');
    }

    public show(): void {
        const permissions: IGranularPermissions = this._userPrivacyManager.getUserPrivacyPermissions();

        this._personalizedExpSwitch.checked = permissions.gameExp;
        this._personalizedAdsSwitch.checked = permissions.ads;
        this._personalized3rdPartySwitch.checked = permissions.external;

        this.setSwitches();
    }

    public isPersonalizedExperienceChecked(): boolean {
        return this._personalizedExpSwitch ? this._personalizedExpSwitch.checked : false;
    }

    public isPersonalizedAdsChecked(): boolean {
        return this._personalizedAdsSwitch ? this._personalizedAdsSwitch.checked : false;
    }

    public isAds3rdPartyChecked(): boolean {
        return this._personalized3rdPartySwitch ? this._personalized3rdPartySwitch.checked : false;
    }

    public checkCheckboxes(checked: boolean) {
        if (this._personalizedExpSwitch && this._personalizedAdsSwitch && this._personalized3rdPartySwitch) {
            this._personalizedExpSwitch.checked = checked;
            this._personalizedAdsSwitch.checked = checked;
            this._personalized3rdPartySwitch.checked = checked;
            this.setSwitches();
        }
    }

    private setSwitches(): void {
        if (!this._personalizedAdsSwitch.checked) {
            this._personalized3rdPartySwitch.checked = false;
            this._container.querySelector('#third-party-switch')!.classList.add('disabled');
        } else {
            this._container.querySelector('#third-party-switch')!.classList.remove('disabled');
        }
    }

    private onExpSwitchChange(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onSwitchGroupSelectionChange());
    }

    private onAdsSwitchChange(event: Event): void {
        event.preventDefault();
        this.setSwitches();
        this._handlers.forEach(handler => handler.onSwitchGroupSelectionChange());
    }

    private on3rdPartySwitchChange(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onSwitchGroupSelectionChange());
    }
}
