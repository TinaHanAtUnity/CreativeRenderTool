import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { Localization } from 'Core/Utilities/Localization';
import { View } from 'Core/Views/View';
import EndScreenTemplate from 'html/EndScreen.html';
import { Platform } from 'Core/Constants/Platform';
export class EndScreen extends View {
    constructor(parameters) {
        super(parameters.platform, 'end-screen');
        this._isSwipeToCloseEnabled = false;
        this._showGDPRBanner = false;
        this._gdprPopupClicked = false;
        this._hidePrivacy = false;
        this._localization = new Localization(parameters.language, 'endscreen');
        this._abGroup = parameters.abGroup;
        this._gameName = parameters.targetGameName;
        this._privacy = parameters.privacy;
        this._adUnitStyle = parameters.adUnitStyle;
        this._showGDPRBanner = parameters.showGDPRBanner;
        this._campaignId = parameters.campaignId;
        this._osVersion = parameters.osVersion;
        this._apiLevel = parameters.apiLevel;
        this._hidePrivacy = parameters.hidePrivacy || false;
        this._bindings = [
            {
                event: 'click',
                listener: (event) => this.onDownloadEvent(event),
                selector: '.game-background, .download-container, .game-icon, .game-image'
            },
            {
                event: 'click',
                listener: (event) => this.onCloseEvent(event),
                selector: '.btn-close-region'
            },
            {
                event: 'click',
                listener: (event) => this.onPrivacyEvent(event),
                selector: '.privacy-button, .gdpr-link, .icon-gdpr'
            }
        ];
        if (CustomFeatures.isTimehopApp(parameters.gameId)) {
            this._isSwipeToCloseEnabled = true;
            this._bindings.push({
                event: 'swipe',
                listener: (event) => this.onCloseEvent(event),
                selector: '.campaign-container, .game-background, .btn.download'
            });
        }
        this._privacy.render();
        this._privacy.hide();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);
    }
    render() {
        super.render();
        if (this._isSwipeToCloseEnabled) {
            this._container.querySelector('.btn-close-region').style.display = 'none';
        }
        const ctaButtonColor = this._adUnitStyle && this._adUnitStyle.getCTAButtonColor() ? this._adUnitStyle.getCTAButtonColor() : undefined;
        const downloadContainer = this._container.querySelector('.download-container');
        if (ctaButtonColor && downloadContainer) {
            downloadContainer.style.background = ctaButtonColor;
        }
        const endScreenAlt = this.getEndscreenAlt();
        if (typeof endScreenAlt === 'string') {
            this._container.classList.add(endScreenAlt);
            document.documentElement.classList.add(endScreenAlt);
        }
        if (this._showGDPRBanner) {
            this._container.classList.add('show-gdpr-banner');
        }
        // Android <= 4.4.4
        if (this._platform === Platform.ANDROID && this._apiLevel <= 19) {
            this._container.classList.add('old-androids');
        }
        // hide privacy icon for China
        if (this._hidePrivacy) {
            this._container.classList.add('hidePrivacyButton');
        }
    }
    show() {
        super.show();
        // todo: the following hack prevents game name from overflowing to more than two lines in the endscreen
        // for some reason webkit-line-clamp is not applied without some kind of a hack
        // this is very strange because identical style works fine in 1.5
        // this is most certainly not a proper solution to this problem but without this hack, sometimes game name
        // would prevent download button from showing which completely breaks layout and monetization
        // therefore this should be treated as an emergency fix and a proper fix needs to be figured out later
        const nameContainer = this._container.querySelector('.name-container');
        nameContainer.innerHTML = this._gameName + ' ';
        if (AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                this._handlers.forEach(handler => handler.onEndScreenClose());
            }, AbstractAdUnit.getAutoCloseDelay());
        }
        this._container.classList.add('on-show');
    }
    hide() {
        super.hide();
        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._handlers.forEach(handler => handler.onGDPRPopupSkipped());
        }
        if (this._privacy) {
            this._privacy.hide();
        }
    }
    onPrivacyClose() {
        if (this._privacy) {
            this._privacy.hide();
        }
    }
    getEndscreenAlt() {
        return undefined;
    }
    getTemplate() {
        return EndScreenTemplate;
    }
    onCloseEvent(event) {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onEndScreenClose());
    }
    onPrivacyEvent(event) {
        event.preventDefault();
        if (this._showGDPRBanner) {
            this._gdprPopupClicked = true;
            this._container.classList.remove('show-gdpr-banner');
        }
        this._privacy.show();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW5kU2NyZWVuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9WaWV3cy9FbmRTY3JlZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBSTVELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUc5RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDM0QsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8saUJBQWlCLE1BQU0scUJBQXFCLENBQUM7QUFDcEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBeUJuRCxNQUFNLE9BQWdCLFNBQVUsU0FBUSxJQUF1QjtJQWUzRCxZQUFZLFVBQWdDO1FBQ3hDLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBVnJDLDJCQUFzQixHQUFZLEtBQUssQ0FBQztRQUV4QyxvQkFBZSxHQUFZLEtBQUssQ0FBQztRQUNqQyxzQkFBaUIsR0FBRyxLQUFLLENBQUM7UUFJMUIsaUJBQVksR0FBWSxLQUFLLENBQUM7UUFJbEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLFlBQVksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3hFLElBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztRQUNuQyxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUM7UUFDM0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO1FBQ25DLElBQUksQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQztRQUMzQyxJQUFJLENBQUMsZUFBZSxHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUM7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