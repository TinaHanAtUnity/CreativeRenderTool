import { View } from 'Core/Views/View';
import { Platform } from 'Core/Constants/Platform';
import { Template } from 'Core/Utilities/Template';
import { Localization } from 'Core/Utilities/Localization';

import DataRequestTemplate from 'html/consent/privacy-data-request.html';
import { ButtonSpinner } from 'Ads/Views/Privacy/ButtonSpinner';
import { Captcha, ICaptchaHandler } from 'Ads/Views/Privacy/Captcha';
import {
    DataRequestResponseStatus,
    IDataRequestResponse,
    PrivacyDataRequestHelper
} from 'Privacy/PrivacyDataRequestHelper';

export class PrivacyDataRequest extends View<{}> implements ICaptchaHandler {

    private readonly _localization: Localization;
    private readonly _language: string;

    private _captchaView: Captcha;
    private _email: string;

    constructor(platform: Platform, language: string) {
        super(platform, 'privacy-data-request');

        this._language = language;
        this._localization = new Localization(language, 'privacy');
        this._template = new Template(DataRequestTemplate, this._localization);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onDataRequestSubmitEvent(event),
                selector: '.privacy-data-request-submit-button'
            }
        ];

        PrivacyDataRequestHelper.sendDebugResetRequest();
    }

    public render(): void {
        super.render();

        const emailInputElement: HTMLInputElement = <HTMLInputElement> this.container().querySelector('#privacy-data-request-email-input');

        if (emailInputElement) {
            emailInputElement.placeholder = this._localization.translate('privacy-data-request-email-input-placeholder');
        }
    }

    public hide(): void {
        super.hide();

        this.hideAndCloseCaptcha();
    }

    public onCloseEvent(): void {
        this.hideAndCloseCaptcha();
    }

    public onItemSelected(url: string): void {
        PrivacyDataRequestHelper.sendVerifyRequest(this._email, url).then((response) => {
            if (response.status === DataRequestResponseStatus.SUCCESS) {
                const msgElement = <HTMLElement> this.container().querySelector('.privacy-data-request-confirm-msg');
                msgElement.classList.add('show-msg');

                this.hideAndCloseCaptcha();
            } else if (response.status === DataRequestResponseStatus.FAILED_VERIFICATION) {
                this.sendDataRequestEvent();
            } else if (response.status === DataRequestResponseStatus.MULTIPLE_FAILED_VERIFICATIONS) {
                const msgElement = <HTMLElement> this.container().querySelector('.privacy-data-request-error-msg');
                msgElement.classList.add('show-msg');

                this.hideAndCloseCaptcha();
            } else {
                // todo: add generic error message
                const msgElement = <HTMLElement> this.container().querySelector('.privacy-data-request-error-msg');
                msgElement.classList.add('show-msg');

                this.hideAndCloseCaptcha();
            }
        });
    }

    private onDataRequestSubmitEvent(event: Event): void {
        event.preventDefault();
        this.sendDataRequestEvent();
    }

    private sendDataRequestEvent(): void {
        const emailInputElement: HTMLInputElement = <HTMLInputElement> this.container().querySelector('#privacy-data-request-email-input');
        this._email = emailInputElement.value;

        // copied from https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email
        if (this._email.length > 0 && this._email.match(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)) {
            const submitButton = <HTMLElement> this.container().querySelector('.privacy-data-request-submit-button');
            const buttonSpinner = new ButtonSpinner(this._platform);
            buttonSpinner.render();

            submitButton.classList.add('click-animation');
            submitButton.appendChild(buttonSpinner.container());

            emailInputElement.disabled = true;
            emailInputElement.blur();

            PrivacyDataRequestHelper.sendInitRequest(this._email).then((response: IDataRequestResponse) => {
                if (this.container() && this.container().parentElement) {
                    submitButton.classList.remove('click-animation');
                    buttonSpinner.container().classList.add('stop');
                    emailInputElement.disabled = false;
                    const imageUrls = response.imageUrls ? response.imageUrls : [];
                    this.showCaptcha(imageUrls);
                }

            }).catch((error) => {
                if (this.container() && this.container().parentElement) {
                    submitButton.classList.remove('click-animation');
                    buttonSpinner.container().classList.add('stop');
                    emailInputElement.disabled = false;

                    // show failure msg
                }
            });
        } else {
            // todo: triggers browser's built-in ui pop-up, could be replaced with something else
            emailInputElement.reportValidity();
        }
    }

    private showCaptcha(urls: string[]): void {
        if (!this._captchaView) {
            this._captchaView = new Captcha(this._platform, this._language, urls);
            this._captchaView.addEventHandler(this);
            this._captchaView.render();
            document.body.appendChild(this._captchaView.container());
        } else {
            this._captchaView.resetElements(urls);
        }
    }

    private hideAndCloseCaptcha(): void {
        if (this._captchaView) {
            this._captchaView.hide();

            const captchaContainer = this._captchaView.container();
            if (captchaContainer.parentElement) {
                captchaContainer.parentElement.removeChild(captchaContainer);
            }
            delete this._captchaView;
        }
    }
}
