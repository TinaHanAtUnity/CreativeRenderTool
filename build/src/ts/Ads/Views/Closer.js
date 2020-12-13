import { Observable0 } from 'Core/Utilities/Observable';
import { Template } from 'Core/Utilities/Template';
import { View } from 'Core/Views/View';
import CloserTemplate from 'html/closer.html';
import { Localization } from 'Core/Utilities/Localization';
export class Closer extends View {
    constructor(platform, placement, privacy, language, showGDPRBanner, hidePrivacy = false) {
        super(platform, 'closer');
        this.onPrivacyOpened = new Observable0();
        this.onPrivacyClosed = new Observable0();
        this._canReward = false;
        this._gdprPopupClicked = false;
        this._template = new Template(CloserTemplate, new Localization(language, 'privacy'));
        this._placement = placement;
        this._privacy = privacy;
        this._showGDPRBanner = showGDPRBanner;
        this._hidePrivacy = hidePrivacy;
        this._bindings = [
            {
                event: 'click',
                selector: '.close',
                listener: () => this.onCloseClick()
            },
            {
                event: 'click',
                listener: (event) => this.onGDPRPopupEvent(event),
                selector: '.gdpr-link'
            },
            {
                event: 'click',
                listener: (event) => this.onPrivacyEvent(event),
                selector: '.icon-gdpr'
            }
        ];
        this._privacy.render();
        this._privacy.hide();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);
    }
    onPrivacyClose() {
        if (this._privacy) {
            this._privacy.hide();
        }
        this.onPrivacyClosed.trigger();
    }
    hide() {
        super.hide();
        if (this._privacy) {
            document.body.removeChild(this._privacy.container());
        }
        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._handlers.forEach(handler => handler.onGDPRPopupSkipped());
        }
        this.onPrivacyClosed.unsubscribe();
        this.onPrivacyOpened.unsubscribe();
    }
    render() {
        super.render();
        this._GDPRPopupElement = this._container.querySelector('.gdpr-pop-up');
        this._privacyButtonElement = this._container.querySelector('.privacy-button');
    }
    update(progress, total) {
        if (progress >= (total * 0.75)) {
            this._canReward = true;
        }
        total = this._placement.allowSkip() ? this._placement.allowSkipInSeconds() : total;
        const secondsLeft = this.clampLower(Math.floor(total - progress), 0);
        let progressFraction = progress / total;
        if (secondsLeft <= 0) {
            this._allowClose = true;
        }
        progressFraction = this.clampHigher(progressFraction, 1);
        this.updateCircle(progressFraction);
    }
    choosePrivacyShown() {
        if (this._showGDPRBanner && !this._gdprPopupClicked) {
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
    updateCircle(fraction) {
        const wrapperElement = this._container.querySelector('.progress-wrapper');
        const leftCircleElement = this._container.querySelector('.circle-left');
        const rightCircleElement = this._container.querySelector('.circle-right');
        const degrees = fraction * 360;
        leftCircleElement.style.webkitTransform = 'rotate(' + degrees + 'deg)';
        if (fraction >= 0.5) {
            wrapperElement.style.webkitAnimationName = 'close-progress-wrapper';
            rightCircleElement.style.webkitAnimationName = 'right-spin';
        }
    }
    onCloseClick() {
        if (this._allowClose) {
            this._handlers.forEach((h) => h.onClose(!this._canReward));
        }
    }
    clampLower(number, floor) {
        return number < floor ? floor : number;
    }
    clampHigher(number, ceil) {
        return number > ceil ? ceil : number;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xvc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9WaWV3cy9DbG9zZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFdkMsT0FBTyxjQUFjLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBTTNELE1BQU0sT0FBTyxNQUFPLFNBQVEsSUFBbUI7SUFpQjNDLFlBQVksUUFBa0IsRUFBRSxTQUFvQixFQUFFLE9BQXdCLEVBQUUsUUFBZ0IsRUFBRSxjQUF1QixFQUFFLGNBQXVCLEtBQUs7UUFDbkosS0FBSyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQWhCZCxvQkFBZSxHQUFnQixJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQ2pELG9CQUFlLEdBQWdCLElBQUksV0FBVyxFQUFFLENBQUM7UUFJekQsZUFBVSxHQUFHLEtBQUssQ0FBQztRQU9uQixzQkFBaUIsR0FBWSxLQUFLLENBQUM7UUFLdkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxjQUFjLEVBQUUsSUFBSSxZQUFZLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDckYsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDNUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDeEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7UUFDdEMsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7UUFFaEMsSUFBSSxDQUFDLFNBQVMsR0FBRztZQUNiO2dCQUNJLEtBQUssRUFBRSxP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