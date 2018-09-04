import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AbstractPrivacy, IPrivacyHandler } from 'Ads/Views/AbstractPrivacy';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Localization } from 'Core/Utilities/Localization';
import { Template } from 'Core/Utilities/Template';
import NewVideoOverlayTemplate from 'html/NewVideoOverlay.html';

export class NewVideoOverlay extends AbstractVideoOverlay implements IPrivacyHandler {
    private _localization: Localization;

    private _spinnerEnabled: boolean = false;

    private _skipEnabled: boolean;

    private _videoDurationEnabled: boolean = false;
    private _videoProgress: number;

    private _muteEnabled: boolean = false;

    private _debugMessageVisible: boolean = false;
    private _callButtonVisible: boolean = false;
    private _callButtonEnabled: boolean = true;

    private _skipButtonElement: HTMLElement;
    private _spinnerElement: HTMLElement;
    private _muteButtonElement: HTMLElement;
    private _debugMessageElement: HTMLElement;
    private _callButtonElement: HTMLElement;
    private _timerElement: HTMLElement;

    private _fadeTimer: any;
    private _areControlsVisible: boolean = false;
    private _privacy: AbstractPrivacy;
    private _gdprPopupClicked: boolean = false;
    private _showGDPRBanner: boolean = false;
    private _disablePrivacyDuringVideo: boolean | undefined;

    constructor(nativeBridge: NativeBridge, muted: boolean, language: string, gameId: string, privacy: AbstractPrivacy, showGDPRBanner: boolean, disablePrivacyDuringVideo?: boolean) {
        super(nativeBridge, 'new-video-overlay', muted);

        this._localization = new Localization(language, 'overlay');
        this._privacy = privacy;
        this._showGDPRBanner = showGDPRBanner;
        this._disablePrivacyDuringVideo = disablePrivacyDuringVideo;
        this._template = new Template(NewVideoOverlayTemplate, this._localization);

        this._templateData = {
            muted
        };

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onSkipEvent(event),
                selector: '.skip-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onMuteEvent(event),
                selector: '.mute-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onCallButtonEvent(event),
                selector: '.call-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPauseForTestingEvent(event),
                selector: '.debug-message-text'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onClick(event)
            },
            {
                event: 'click',
                listener: (event: Event) => this.onGDPRPopupEvent(event),
                selector: '.gdpr-link'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: '.gdpr-button'
            }
        ];

        if (CustomFeatures.isTimehopApp(gameId)) {
            this._bindings.push({
                event: 'swipe',
                listener: (event: Event) => this.onSkipEvent(event)
            });
        }

        this._privacy.render();
        this._privacy.hide();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);

        setTimeout(() => {
            this.fadeIn();
        }, 1000);
    }

    public hide() {
        super.hide();

        if (this._privacy) {
            this._privacy.hide();
            document.body.removeChild(this._privacy.container());
            delete this._privacy;
        }

        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._handlers.forEach(handler => handler.onGDPRPopupSkipped());
        }
    }

    public render(): void {
        super.render();
        this.setupElementReferences();
        this.choosePrivacyShown();
    }

    public setSpinnerEnabled(value: boolean): void {
        if (this._spinnerEnabled !== value) {
            this._spinnerEnabled = value;
            this._spinnerElement.style.display = value ? 'block' : 'none';
        }
    }

    public setSkipEnabled(value: boolean): void {
        if (this._skipEnabled !== value) {
            this._skipEnabled = value;
        }
    }

    public setVideoDurationEnabled(value: boolean) {
        if (this._videoDurationEnabled !== value) {
            this._videoDurationEnabled = value;
        }
    }

    public setVideoProgress(value: number): void {
        if (NewVideoOverlay.AutoSkip) {
            this._handlers.forEach(handler => handler.onOverlaySkip(value));
        }

        if (this._fadeEnabled && !this._fadeTimer && (!this._skipEnabled || this._skipRemaining <= 0)) {
            this._fadeTimer = setTimeout(() => {
                this.fadeOut();
                this._fadeTimer = undefined;
            }, 3000);
        }

        this._videoProgress = value;
        this._skipRemaining = this._skipDuration - this._videoProgress;
        this._timerElement.innerText = String(Math.ceil((this._videoDuration - this._videoProgress) / 1000));

        if (this._skipRemaining <= 0) {
            this.showSkipButton();
        }
    }

    public setMuteEnabled(value: boolean) {
        if (this._muteEnabled !== value) {
            this._muteEnabled = value;
            this._muteButtonElement.style.display = value ? 'block' : 'none';
        }
    }

    public setDebugMessage(value: string): void {
        this._debugMessageElement.innerHTML = value;
    }

    public setDebugMessageVisible(value: boolean) {
        if (this._debugMessageVisible !== value) {
            this._debugMessageElement.style.display = value ? 'block' : 'none';
        }
    }

    public setCallButtonVisible(value: boolean) {
        if (this._callButtonVisible !== value) {
            this._callButtonElement.style.display = value ? 'block' : 'none';
        }
    }

    public setCallButtonEnabled(value: boolean) {
        if (this._callButtonEnabled !== value) {
            this._callButtonEnabled = value;
        }
    }

    public isMuted(): boolean {
        return this._muted;
    }

    public onPrivacy(url: string): void {
        // do nothing
    }

    public onPrivacyClose(): void {
        if (this._privacy) {
            this._privacy.hide();
        }
        this._isPrivacyShowing = false;
        this._nativeBridge.VideoPlayer.play();
    }

    public onGDPROptOut(optOutEnabled: boolean): void {
        // do nothing
    }

    public choosePrivacyShown(): void {
        if (this._disablePrivacyDuringVideo) {
            this._container.classList.remove('show-gdpr-banner');
            this._container.classList.remove('show-gdpr-button');
        } else if (!this._gdprPopupClicked && this._showGDPRBanner) {
            this._container.classList.add('show-gdpr-banner');
            this._container.classList.remove('show-gdpr-button');
        } else {
            this._container.classList.remove('show-gdpr-banner');
            this._container.classList.add('show-gdpr-button');
        }
    }

    private onGDPRPopupEvent(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this._isPrivacyShowing = true;
        if (!this._gdprPopupClicked) {
            this._gdprPopupClicked = true;
            this.choosePrivacyShown();
        }
        this._nativeBridge.VideoPlayer.pause();
        if (this._privacy) {
            this._privacy.show();
        }
    }

    private onPrivacyEvent(event: Event) {
        this._isPrivacyShowing = true;
        event.preventDefault();
        event.stopPropagation();
        this._nativeBridge.VideoPlayer.pause();
        if (this._privacy) {
            this._privacy.show();
        }
    }

    private onSkipEvent(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        if (this._skipEnabled && this._videoProgress > this._skipDuration) {
            this._handlers.forEach(handler => handler.onOverlaySkip(this._videoProgress));
        }
    }

    private onMuteEvent(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.resetFadeTimer();
        if (this._muted) {
            this._muteButtonElement.classList.remove('muted');
            this._muted = false;
        } else {
            this._muteButtonElement.classList.add('muted');
            this._muted = true;
        }
        this._handlers.forEach(handler => handler.onOverlayMute(this._muted));
    }

    private onCallButtonEvent(event: Event): void {
        if (!this._callButtonEnabled) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.resetFadeTimer();
        this._handlers.forEach(handler => handler.onOverlayCallButton());
    }

    private onPauseForTestingEvent(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.resetFadeTimer();
        this._handlers.forEach(handler => handler.onOverlayPauseForTesting(true));
    }

    private onClick(event: Event) {
        this.resetFadeTimer();

        if (this._areControlsVisible) {
            this.fadeOut();
        } else {
            this.fadeIn();
        }
    }

    private setupElementReferences(): void {
        this._skipButtonElement = <HTMLElement>this._container.querySelector('.skip-button');
        this._spinnerElement = <HTMLElement>this._container.querySelector('.buffering-spinner');
        this._muteButtonElement = <HTMLElement>this._container.querySelector('.mute-button');
        this._debugMessageElement = <HTMLElement>this._container.querySelector('.debug-message-text');
        this._callButtonElement = <HTMLElement>this._container.querySelector('.call-button');
        this._timerElement = <HTMLElement>this._container.querySelector('.timer');
    }

    private showSkipButton() {
        if (this._skipEnabled) {
            this._skipButtonElement.classList.add('show-skip-button');
        }
    }

    private resetFadeTimer() {
        if (this._fadeTimer) {
            clearTimeout(this._fadeTimer);
            this._fadeTimer = undefined;
        }
    }

    private showCallButton() {
        if (!this._areControlsVisible) {
            return;
        }
        this._callButtonElement.classList.add('show-call-button');
        this._callButtonElement.classList.add('show-go-text');
    }

    private fadeIn() {
        this._container.classList.add('fade-in');
        this._areControlsVisible = true;
        setTimeout(() => {
            this.showCallButton();
        }, 500);
    }

    private fadeOut() {
        this._container.classList.remove('fade-in');
        this._areControlsVisible = false;
    }
}
