import { View } from 'Core/Views/View';
import { Platform } from 'Core/Constants/Platform';
import { Template } from 'Core/Utilities/Template';
import { Localization } from 'Core/Utilities/Localization';

import DataRequestTemplate from 'html/consent/privacy-data-request.html';
import { ButtonSpinner } from 'Ads/Views/Consent/ButtonSpinner';

export class PrivacyDataRequest extends View<{}> {

    private readonly _localization: Localization;

    constructor(platform: Platform, language: string) {
        super(platform, 'privacy-data-request');

        this._localization = new Localization(language, 'privacy');
        this._template = new Template(DataRequestTemplate, this._localization);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onDataRequestSubmitEvent(event),
                selector: '.privacy-data-request-submit-button'
            }
        ];

    }

    public render(): void {
        super.render();

        const emailInputElement: HTMLInputElement = <HTMLInputElement> this.container().querySelector('#privacy-data-request-email-input');

        if (emailInputElement) {
            emailInputElement.placeholder = this._localization.translate('privacy-dialog-email-input-placeholder');
        }
    }

    private onDataRequestSubmitEvent(event: Event): void {
        event.preventDefault();

        const emailInputElement: HTMLInputElement = <HTMLInputElement> this.container().querySelector('#privacy-data-request-email-input');
        const emailInput = emailInputElement.value;

        // copied from https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email
        if (emailInput.match(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)) {
            const submitButton = <HTMLElement> this.container().querySelector('.privacy-data-request-submit-button');
            const buttonSpinner = new ButtonSpinner(this._platform);
            buttonSpinner.render();

            submitButton.classList.add('click-animation');
            submitButton.appendChild(buttonSpinner.container());

            emailInputElement.disabled = true;

            this.sendDataRequestEvent().then(() => {
                submitButton.classList.remove('click-animation');
                buttonSpinner.container().classList.add('stop');
                emailInputElement.disabled = false;

                // show success msg

            }).catch(() => {
                submitButton.classList.remove('click-animation');
                buttonSpinner.container().classList.add('stop');
                emailInputElement.disabled = false;

                // show failure msg
            });
        } else {
            // todo: triggers browser's built-in ui pop-up, could be replaced with something else
            emailInputElement.reportValidity();
        }
    }

    private sendDataRequestEvent(): Promise<void> {
        // fixme: add a real request
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 3000);
        });
    }
}
