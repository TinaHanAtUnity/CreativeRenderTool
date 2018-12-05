import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { Template } from 'Core/Utilities/Template';

import PrivacySettingsTemplate from 'html/consent/PrivacySettings.html';
import { PrivacyRowItemContainer } from 'Ads/Views/Consent/PrivacyRowItemContainer';
import { PersonalizationCheckboxGroup } from 'Ads/Views/Consent/PersonalizationCheckboxGroup';
import { IPermissions } from 'Ads/Views/Consent/IPermissions';

enum ViewState {
    INITIAL,
    PERSONALIZATION,
    DATA,
    REPORT,
    BUILD_INFO
}

export class PrivacySettings extends AbstractPrivacy {

    private _gdprManager: UserPrivacyManager;
    private _privacyRowItemContainer: PrivacyRowItemContainer;
    private _personalizationCheckBoxGroup: PersonalizationCheckboxGroup;

    constructor(platform: Platform, gdprManager: UserPrivacyManager, campaign?: Campaign,
                gdprEnabled?: boolean,
                isCoppaCompliant?: boolean) {
        super(platform, isCoppaCompliant || false, gdprEnabled || false, 'privacy-settings');

        this._template = new Template(PrivacySettingsTemplate);
        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onBackButtonEvent(event),
                selector: '.back-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPersonalizationButtonEvent(event),
                selector: '.personalization-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onViewDataButtonEvent(event),
                selector: '.view-data-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onReportAdButtonEvent(event),
                selector: '.report-ad-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onBuildInfoButtonEvent(event),
                selector: '.build-info-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.container'
            }
        ];

        this._privacyRowItemContainer = new PrivacyRowItemContainer({ platform: platform, gdprManager: gdprManager });
        this._personalizationCheckBoxGroup = new PersonalizationCheckboxGroup(platform);
    }

    public render(): void {
        super.render();

        this._privacyRowItemContainer.render();
        (<HTMLElement>this._container.querySelector('.info-container')).appendChild(this._privacyRowItemContainer.container());

        this._personalizationCheckBoxGroup.render();
        (<HTMLElement>this._container.querySelector('.checkbox-group-container')).appendChild(this._personalizationCheckBoxGroup.container());

        this.showView(ViewState.INITIAL);
    }

    protected onCloseEvent(event: Event): void {
        event.preventDefault();

        const consent: IPermissions = {
            personalizedConsent: {
                gameExp: this._personalizationCheckBoxGroup.isPersonalizedExperienceChecked(),
                ads: this._personalizationCheckBoxGroup.isPersonalizedAdsChecked(),
                external: this._personalizationCheckBoxGroup.isAds3rdPartyChecked()
            }
        };

        this._handlers.forEach(handler => handler.onPersonalizedConsent(consent));
        this._handlers.forEach(handler => handler.onPrivacyClose());

        // todo: for testing, remove
        this.hide();
    }

    protected onPrivacyEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onPrivacy((<HTMLLinkElement>event.target).href));
    }

    private onBackButtonEvent(event: Event) {
        event.preventDefault();

        this.showView(ViewState.INITIAL);
    }

    private onPersonalizationButtonEvent(event: Event) {
        event.preventDefault();

        this.showView(ViewState.PERSONALIZATION);
    }

    private onViewDataButtonEvent(event: Event) {
        event.preventDefault();

        this.showView(ViewState.DATA);
    }

    private onReportAdButtonEvent(event: Event) {
        event.preventDefault();

        this.showView(ViewState.REPORT);
    }

    private onBuildInfoButtonEvent(event: Event) {
        event.preventDefault();

        this.showView(ViewState.BUILD_INFO);
    }

    private showView(viewState: ViewState) {
        let classToAdd: string;

        switch (viewState) {
            case ViewState.INITIAL:
                classToAdd = 'initial';
                break;
            case ViewState.PERSONALIZATION:
                classToAdd = 'personalization';
                break;
            case ViewState.DATA:
                classToAdd = 'data';
                break;
            case ViewState.REPORT:
                classToAdd = 'report';
                break;
            case ViewState.BUILD_INFO:
                classToAdd = 'build-info';
                break;
            default:
                classToAdd = 'initial';
        }

        const states = ['initial', 'personalization', 'data', 'report', 'build-info'];
        states.forEach(state => {
            if (state === classToAdd) {
                this.container().classList.add(classToAdd);

                // todo: needed to set the length of the line connecting main and sub checkboxes
                if (state === 'personalization') {
                    this._personalizationCheckBoxGroup.show();
                }
            } else {
                this.container().classList.remove(state);
            }
        });
    }

}
