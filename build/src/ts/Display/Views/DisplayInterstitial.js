import { Platform } from 'Core/Constants/Platform';
import { Observable0 } from 'Core/Utilities/Observable';
import { Template } from 'Core/Utilities/Template';
import { View } from 'Core/Views/View';
import DisplayInterstitialTemplate from 'html/display/DisplayInterstitial.html';
import { Localization } from 'Core/Utilities/Localization';
export class DisplayInterstitial extends View {
    constructor(platform, core, deviceInfo, placement, campaign, privacy, showGDPRBanner, hidePrivacy = false) {
        super(platform, 'display-interstitial');
        this.onPrivacyOpened = new Observable0();
        this.onPrivacyClosed = new Observable0();
        this._gdprPopupClicked = false;
        this._webPlayerPrepared = false;
        this._timers = [];
        this._core = core;
        this._deviceInfo = deviceInfo;
        this._placement = placement;
        this._campaign = campaign;
        this._template = new Template(DisplayInterstitialTemplate, new Localization(deviceInfo.getLanguage(), 'privacy'));
        this._privacy = privacy;
        this._showGDPRBanner = showGDPRBanner;
        this._hidePrivacy = hidePrivacy;
        this._messageListener = (e) => this.onMessage(e);
        this._bindings = [
            {
                event: 'click',
                listener: (event) => this.onCloseEvent(event),
                selector: '.close'
            },
            {
                event: 'click',
                listener: (event) => this.onGDPRPopupEvent(event),
                selector: '.gdpr-link'
            },
            {
                event: 'click',
                listener: (event) => this.onPrivacyEvent(event),
                selector: '.privacy-button'
            }
        ];
        this._privacy.render();
        this._privacy.hide();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);
    }
    render() {
        super.render();
        this._closeElement = this._container.querySelector('.close-region');
        this._GDPRPopupElement = this._container.querySelector('.gdpr-pop-up');
        this._privacyButtonElement = this._container.querySelector('.privacy-button');
    }
    show() {
        super.show();
        this.choosePrivacyShown();
        window.addEventListener('message', this._messageListener);
        this._closeElement.style.opacity = '1';
        this.updateProgressCircle(this._closeElement, 1);
    }
    hide() {
        window.removeEventListener('message', this._messageListener);
        super.hide();
        const privacyContainer = this._privacy.container();
        if (privacyContainer && privacyContainer.parentElement) {
            privacyContainer.parentElement.removeChild(privacyContainer);
        }
        for (const timer of this._timers) {
            window.clearInterval(timer);
        }
        this._timers = [];
        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._handlers.forEach(handler => handler.onGDPRPopupSkipped());
        }
        this.onPrivacyClosed.unsubscribe();
        this.onPrivacyOpened.unsubscribe();
    }
    onPrivacyClose() {
        if (this._privacy) {
            this._privacy.hide();
        }
        this.onPrivacyClosed.trigger();
    }
    choosePrivacyShown() {
        if (!this._gdprPopupClicked && this._showGDPRBanner) {
            this._GDPRPopupElement.style.visibility = 'visible';
            this._privacyButtonElement.style.pointerEvents = '1';
            this._privacyButtonElement.style.visibility = 'hidden';
        }
        else {
            this._privacyButtonElement.style.visibility = 'visible';
            this._GDPRPopupElement.style.pointerEvents = '1';
            this._GDPRPopupElement.style.visibility = 'hidden';
        }
        if (this._hidePrivacy) {
            this._privacyButtonElement.style.pointerEvents = '1';
            this._privacyButtonElement.style.visibility = 'hidden';
        }
    }
    updateProgressCircle(container, progress) {
        const wrapperElement = container.querySelector('.progress-wrapper');
        if (this._platform === Platform.ANDROID && this._deviceInfo.getApiLevel() < 15) {
            wrapperElement.style.display = 'none';
            this._container.style.display = 'none';
            /* tslint:disable:no-unused-expression */
            this._container.offsetHeight;
            /* tslint:enable:no-unused-expression */
            this._container.style.display = 'block';
            return;
        }
        const leftCircleElement = container.querySelector('.circle-left');
        const rightCircleElement = container.querySelector('.circle-right');
        const degrees = progress * 360;
        leftCircleElement.style.webkitTransform = 'rotate(' + degrees + 'deg)';
        if (progress >= 0.5) {
            wrapperElement.style.webkitAnimationName = 'close-progress-wrapper';
            rightCircleElement.style.webkitAnimationName = 'right-spin';
        }
    }
    onCloseEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        this._handlers.forEach(handler => handler.onDisplayInterstitialClose());
    }
    onGDPRPopupEvent(event) {
        event.preventDefault();
        if (!this._gdprPopupClicked) {
            this._gdprPopupClicked = true;
            this.choosePrivacyShown();
        }
        this.onPrivacyOpened.trigger();
        this._privacy.show();
    }
    onPrivacyEvent(event) {
        event.preventDefault();
        this.onPrivacyOpened.trigger();
        this._privacy.show();
    }
    onMessage(e) {
        switch (e.data.type) {
            case 'redirect':
                // TODO: should we do something here?
                // this._handlers.forEach(handler => handler.onDisplayInterstitialClick(e.data.href));
                break;
            default:
                this._core.Sdk.logWarning(`Unknown message: ${e.data.type}`);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzcGxheUludGVyc3RpdGlhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9EaXNwbGF5L1ZpZXdzL0Rpc3BsYXlJbnRlcnN0aXRpYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRXZDLE9BQU8sMkJBQTJCLE1BQU0sdUNBQXVDLENBQUM7QUFHaEYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBTTNELE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxJQUFpQztJQXVCdEUsWUFBWSxRQUFrQixFQUFFLElBQWMsRUFBRSxVQUFzQixFQUFFLFNBQW9CLEVBQUUsUUFBcUMsRUFBRSxPQUF3QixFQUFFLGNBQXVCLEVBQUUsY0FBdUIsS0FBSztRQUNoTixLQUFLLENBQUMsUUFBUSxFQUFFLHNCQUFzQixDQUFDLENBQUM7UUF0QjVCLG9CQUFlLEdBQWdCLElBQUksV0FBVyxFQUFFLENBQUM7UUFDakQsb0JBQWUsR0FBZ0IsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQVd6RCxzQkFBaUIsR0FBWSxLQUFLLENBQUM7UUFFbkMsdUJBQWtCLEdBQUcsS0FBSyxDQUFDO1FBRzNCLFlBQU8sR0FBYSxFQUFFLENBQUM7UUFPM0IsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7UUFDOUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDNUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDMUIsSUFBSSxDQUFD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