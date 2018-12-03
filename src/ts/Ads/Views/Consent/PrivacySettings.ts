import { GdprManager } from 'Ads/Managers/GdprManager';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { Template } from 'Core/Utilities/Template';

import PrivacySettingsTemplate from 'html/consent/PrivacySettings.html';

export class PrivacySettings extends AbstractPrivacy {

    private _gdprManager: GdprManager;

    constructor(platform: Platform, campaign: Campaign,
                gdprManager: GdprManager, gdprEnabled: boolean,
                isCoppaCompliant: boolean) {
        super(platform, isCoppaCompliant, gdprEnabled, 'consent-privacy');

        this._template = new Template(PrivacySettingsTemplate);
        this._bindings = [];
    }

    protected onCloseEvent(event: Event): void {
        event.preventDefault();

        this._handlers.forEach(handler => handler.onPrivacyClose());
    }

    protected onPrivacyEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onPrivacy((<HTMLLinkElement>event.target).href));
    }

}
