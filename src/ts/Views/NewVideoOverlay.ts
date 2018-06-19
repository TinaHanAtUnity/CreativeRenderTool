import NewVideoOverlayTemplate from 'html/NewVideoOverlay.html';

import { NativeBridge } from 'Native/NativeBridge';
import { Template } from 'Utilities/Template';
import { Localization } from 'Utilities/Localization';
import { AbstractVideoOverlay } from 'Views/AbstractVideoOverlay';

export class NewVideoOverlay extends AbstractVideoOverlay {

    private _localization: Localization;

    private _spinnerEnabled: boolean = false;

    private _skipVisible: boolean = false;
    private _skipEnabled: boolean;

    private _videoDurationEnabled: boolean = false;
    private _videoProgress: number;

    private _muteEnabled: boolean = false;

    private _debugMessageVisible: boolean = false;

    private _callButtonVisible: boolean = false;

    private _skipElement: HTMLElement;
    private _spinnerElement: HTMLElement;
    private _muteButtonElement: HTMLElement;
    private _debugMessageElement: HTMLElement;
    private _callButtonElement: HTMLElement;
    private _timerElement: HTMLElement;

    private _progressElement: HTMLElement;

    private _fadeTimer: any;
    private _fadeStatus: boolean = true;
    private _areControlsVisible: boolean = false;

    constructor(nativeBridge: NativeBridge, muted: boolean, language: string, gameId: string) {
        super(nativeBridge, 'new-video-overlay', muted);

        this._localization = new Localization(language, 'overlay');
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
            }
        ];

        setTimeout(() => {
            this.fadeIn();
        }, 1000);
    }

    public render(): void {
        super.render();

        this._skipElement = <HTMLElement>this._container.querySelector('.skip-button');
        this._skipElement.style.display = 'none';

        this._spinnerElement = <HTMLElement>this._container.querySelector('.buffering-spinner');
        this._muteButtonElement = <HTMLElement>this._container.querySelector('.mute-button');
        this._debugMessageElement = <HTMLElement>this._container.querySelector('.debug-message-text');

        this._callButtonElement = <HTMLElement>this._container.querySelector('.call-button');
        this._callButtonElement.style.display = 'block';

        this._timerElement = <HTMLElement>this._container.querySelector('.timer');
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
            this._skipElement.style.display = value ? 'block' : 'none';
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
        this.setSkipElementVisible(this._skipEnabled);
        this._skipRemaining = this._skipDuration - this._videoProgress;
        this._timerElement.innerText = String(Math.ceil((this._videoDuration - this._videoProgress) / 1000));

        if (this._skipRemaining <= 0) {
            this._skipElement.classList.add('skip-button-enabled');
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
        // EMPTY
    }

    public isMuted(): boolean {
        return this._muted;
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
        console.log("ON Mute: ", this._muted);
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

    private setSkipElementVisible(value: boolean) {
        if (this._skipVisible !== value) {
            this._skipVisible = value;
            if (value) {
                this._skipElement.style.display = 'block';
            } else {
                this._skipElement.style.display = 'none';
            }
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
    }

    private hideCallButton() {
        if (this._areControlsVisible) {
            return;
        }
        this._callButtonElement.classList.remove('show-call-button');
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
        setTimeout(() => {
            this.hideCallButton();
        }, 2000);
    }
}
