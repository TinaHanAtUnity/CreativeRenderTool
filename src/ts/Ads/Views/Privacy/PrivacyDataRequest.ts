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
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { PrivacyLocalization } from 'Privacy/PrivacyLocalization';

export class PrivacyDataRequest extends View<{}> implements ICaptchaHandler {

    private readonly _localization: Localization;
    private readonly _language: string;

    private _captchaView: Captcha;
    private _buttonSpinner: ButtonSpinner;
    private _currentValidatedEmail: string;

    private _emailInputElement: HTMLInputElement;
    private _submitButtonElement: HTMLElement;

    constructor(platform: Platform, privacyManager: UserPrivacyManager, language: string) {
        super(platform, 'privacy-data-request');

        this._language = language;
        this._localization = new PrivacyLocalization(language, 'privacy', privacyManager.getLegalFramework());
        this._template = new Template(DataRequestTemplate, this._localization);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onDataRequestSubmitEvent(event),
                selector: '.privacy-data-request-submit-button'
            },
            {
                event: 'blur',
                listener: () => this.onBlur(),
                selector: '#privacy-data-request-email-input'
            }
        ];

        this._buttonSpinner = new ButtonSpinner(platform);
    }

    public render(): void {
        super.render();

        this._buttonSpinner.render();

        this._emailInputElement = <HTMLInputElement> this.container().querySelector('#privacy-data-request-email-input');
        this._emailInputElement.placeholder = this._localization.translate('privacy-data-request-email-input-placeholder');

        this._submitButtonElement = <HTMLElement> this.container().querySelector('.privacy-data-request-submit-button');
    }

    public hide(): void {
        super.hide();
        this.hideAndCloseCaptcha();
    }

    public onCloseEvent(): void {
        this.hideAndCloseCaptcha();
    }

    //hack for webview bug on ios12/ios13
    private onBlur(): void {
        if (this._platform === Platform.IOS) {
            setTimeout (() => {
                window.scrollTo(0, 0);
            }, 50);
        }
    }

    public onItemSelected(url: string): void {
        PrivacyDataRequestHelper.sendVerifyRequest(this._currentValidatedEmail, url).then((response) => {
            switch (response.status) {
                case DataRequestResponseStatus.SUCCESS:
                    const msgElement = <HTMLElement> this.container().querySelector('.privacy-data-request-confirm-msg');
                    msgElement.classList.add('show-msg');
                    this.disableInputs();
                    this.hideAndCloseCaptcha();
                    break;
                case DataRequestResponseStatus.FAILED_VERIFICATION:
                    this.initCaptcha();
                    if (this._captchaView) {
                        this._captchaView.showTryAgainMessage();
                    }
                    break;
                case DataRequestResponseStatus.MULTIPLE_FAILED_VERIFICATIONS:
                    this.handleMultipleFailedError();
                    break;
                default:
                    this.handleGenericError();
            }
        });
    }

    private onDataRequestSubmitEvent(event: Event): void {
        event.preventDefault();

        const email = this._emailInputElement.value;
        // copied from https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email
        if (email.length > 0 && email.match(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)) {
            this._currentValidatedEmail = email;
            this.initCaptcha();
        } else {
            // todo: triggers browser's built-in ui pop-up, could be replaced with something else
            this._emailInputElement.reportValidity();
        }
    }

    private initCaptcha(): void {
        this.disableInputsAndStartAnimation();
        PrivacyDataRequestHelper.sendInitRequest(this._currentValidatedEmail).then((response: IDataRequestResponse) => {
            this.enableInputsAndStopAnimation();
            if (response.status === DataRequestResponseStatus.SUCCESS) {
                const imageUrls = response.imageUrls ? response.imageUrls : [];
                this.showCaptcha(imageUrls);
            } else if (response.status === DataRequestResponseStatus.MULTIPLE_FAILED_VERIFICATIONS) {
                this.handleMultipleFailedError();
            } else {
                this.handleGenericError();
            }
        }).catch((error) => {
            this.handleGenericError();
        });
    }

    private showCaptcha(urls: string[]): void {
        if (!this._captchaView) {
            this._captchaView = new Captcha(this._platform, this._language, urls);
            this._captchaView.addEventHandler(this);
            this._captchaView.render();
            document.body.appendChild(this._captchaView.container());

            this._captchaView.show();
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

    private handleMultipleFailedError(): void {
        this.showError(this._localization.translate('privacy-data-request-fail-message'));
        this.disableInputs();
        this.hideAndCloseCaptcha();
    }

    private handleGenericError(): void {
        this.showError(this._localization.translate('privacy-data-request-error-message'));
        this.hideAndCloseCaptcha();
    }

    private showError(errorMsg: string): void {
        const errorElement = <HTMLElement> this.container().querySelector('.privacy-data-request-error-msg');
        const errorMsgElement = <HTMLElement> errorElement.querySelector('.error-msg');
        errorMsgElement.innerHTML = errorMsg;
        errorElement.classList.add('show-msg');
    }

    private hideErrorMessage(): void {
        const errorElement = <HTMLElement> this.container().querySelector('.privacy-data-request-error-msg');
        errorElement.classList.remove('show-msg');
    }

    private disableInputs(): void {
        this._submitButtonElement.classList.add('disabled');
        this._emailInputElement.disabled = true;
        this._emailInputElement.blur();
    }

    private disableInputsAndStartAnimation(): void {
        this.disableInputs();
        this.hideErrorMessage();
        this._buttonSpinner.container().classList.remove('stop');

        this._submitButtonElement.classList.add('click-animation');
        this._submitButtonElement.appendChild(this._buttonSpinner.container());
    }

    private enableInputsAndStopAnimation(): void {
        this._submitButtonElement.classList.remove('disabled');
        this._submitButtonElement.classList.remove('click-animation');
        this._emailInputElement.disabled = false;

        this._buttonSpinner.container().classList.add('stop');

    }
}
