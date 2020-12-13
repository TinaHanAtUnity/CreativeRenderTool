import { View } from 'Core/Views/View';
import { Platform } from 'Core/Constants/Platform';
import { Template } from 'Core/Utilities/Template';
import DataRequestTemplate from 'html/consent/privacy-data-request.html';
import { ButtonSpinner } from 'Ads/Views/Privacy/ButtonSpinner';
import { Captcha } from 'Ads/Views/Privacy/Captcha';
import { DataRequestResponseStatus, PrivacyDataRequestHelper } from 'Privacy/PrivacyDataRequestHelper';
import { PrivacyLocalization } from 'Privacy/PrivacyLocalization';
export class PrivacyDataRequest extends View {
    constructor(platform, privacyManager, language) {
        super(platform, 'privacy-data-request');
        this._language = language;
        this._localization = new PrivacyLocalization(language, 'privacy', privacyManager.getLegalFramework());
        this._template = new Template(DataRequestTemplate, this._localization);
        this._bindings = [
            {
                event: 'click',
                listener: (event) => this.onDataRequestSubmitEvent(event),
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
    render() {
        super.render();
        this._buttonSpinner.render();
        this._emailInputElement = this.container().querySelector('#privacy-data-request-email-input');
        this._emailInputElement.placeholder = this._localization.translate('privacy-data-request-email-input-placeholder');
        this._submitButtonElement = this.container().querySelector('.privacy-data-request-submit-button');
    }
    hide() {
        super.hide();
        this.hideAndCloseCaptcha();
    }
    onCloseEvent() {
        this.hideAndCloseCaptcha();
    }
    //hack for webview bug on ios12/ios13
    onBlur() {
        if (this._platform === Platform.IOS) {
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 50);
        }
    }
    onItemSelected(url) {
        PrivacyDataRequestHelper.sendVerifyRequest(this._currentValidatedEmail, url).then((response) => {
            switch (response.status) {
                case DataRequestResponseStatus.SUCCESS:
                    const msgElement = this.container().querySelector('.privacy-data-request-confirm-msg');
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
    onDataRequestSubmitEvent(event) {
        event.preventDefault();
        const email = this._emailInputElement.value;
        // copied from https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email
        if (email.length > 0 && email.match(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)) {
            this._currentValidatedEmail = email;
            this.initCaptcha();
        }
        else {
            // todo: triggers browser's built-in ui pop-up, could be replaced with something else
            if (this._emailInputElement.reportValidity) {
                this._emailInputElement.reportValidity();
            }
        }
    }
    initCaptcha() {
        this.disableInputsAndStartAnimation();
        PrivacyDataRequestHelper.sendInitRequest(this._currentValidatedEmail).then((response) => {
            this.enableInputsAndStopAnimation();
            if (response.status === DataRequestResponseStatus.SUCCESS) {
                const imageUrls = response.imageUrls ? response.imageUrls : [];
                this.showCaptcha(imageUrls);
            }
            else if (response.status === DataRequestResponseStatus.MULTIPLE_FAILED_VERIFICATIONS) {
                this.handleMultipleFailedError();
            }
            else {
                this.handleGenericError();
            }
        }).catch((error) => {
            this.handleGenericError();
        });
    }
    showCaptcha(urls) {
        if (!this._captchaView) {
            this._captchaView = new Captcha(this._platform, this._language, urls);
            this._captchaView.addEventHandler(this);
            this._captchaView.render();
            document.body.appendChild(this._captchaView.container());
            this._captchaView.show();
        }
        else {
            this._captchaView.resetElements(urls);
        }
    }
    hideAndCloseCaptcha() {
        if (this._captchaView) {
            this._captchaView.hide();
            const captchaContainer = this._captchaView.container();
            if (captchaContainer.parentElement) {
                captchaContainer.parentElement.removeChild(captchaContainer);
            }
            delete this._captchaView;
        }
    }
    handleMultipleFailedError() {
        this.showError(this._localization.translate('privacy-data-request-fail-message'));
        this.disableInputs();
        this.hideAndCloseCaptcha();
    }
    handleGenericError() {
        this.showError(this._localization.translate('privacy-data-request-error-message'));
        this.hideAndCloseCaptcha();
    }
    showError(errorMsg) {
        const errorElement = this.container().querySelector('.privacy-data-request-error-msg');
        const errorMsgElement = errorElement.querySelector('.error-msg');
        errorMsgElement.innerHTML = errorMsg;
        errorElement.classList.add('show-msg');
    }
    hideErrorMessage() {
        const errorElement = this.container().querySelector('.privacy-data-request-error-msg');
        errorElement.classList.remove('show-msg');
    }
    disableInputs() {
        this._submitButtonElement.classList.add('disabled');
        this._emailInputElement.disabled = true;
        this._emailInputElement.blur();
    }
    disableInputsAndStartAnimation() {
        this.disableInputs();
        this.hideErrorMessage();
        this._buttonSpinner.container().classList.remove('stop');
        this._submitButtonElement.classList.add('click-animation');
        this._submitButtonElement.appendChild(this._buttonSpinner.container());
    }
    enableInputsAndStopAnimation() {
        this._submitButtonElement.classList.remove('disabled');
        this._submitButtonElement.classList.remove('click-animation');
        this._emailInputElement.disabled = false;
        this._buttonSpinner.container().classList.add('stop');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeURhdGFSZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9WaWV3cy9Qcml2YWN5L1ByaXZhY3lEYXRhUmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUduRCxPQUFPLG1CQUFtQixNQUFNLHdDQUF3QyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUNoRSxPQUFPLEVBQUUsT0FBTyxFQUFtQixNQUFNLDJCQUEyQixDQUFDO0FBQ3JFLE9BQU8sRUFDSCx5QkFBeUIsRUFFekIsd0JBQXdCLEVBQzNCLE1BQU0sa0NBQWtDLENBQUM7QUFFMUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFbEUsTUFBTSxPQUFPLGtCQUFtQixTQUFRLElBQVE7SUFZNUMsWUFBWSxRQUFrQixFQUFFLGNBQWtDLEVBQUUsUUFBZ0I7UUFDaEYsS0FBSyxDQUFDLFFBQVEsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBRXhDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7UUFDdEcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFdkUsSUFBSSxDQUFDLFNBQVMsR0FBRztZQUNiO2dCQUNJLEtBQUssRUFBRSxPQUFPO2dCQUNkLFFB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