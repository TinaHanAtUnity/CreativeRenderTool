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
                selector: '.skip-hit-area'
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
    }

    public render(): void {
        super.render();

        this._skipElement = <HTMLElement>this._container.querySelector('.skip-hit-area');
        this._skipElement.style.display = 'none';
        (<HTMLElement>this._skipElement.children[1]).style.display = 'none';

        this._spinnerElement = <HTMLElement>this._container.querySelector('.buffering-spinner');
        this._muteButtonElement = <HTMLElement>this._container.querySelector('.mute-button');
        this._debugMessageElement = <HTMLElement>this._container.querySelector('.debug-message-text');

        this._callButtonElement = <HTMLElement>this._container.querySelector('.call-button');
        this._callButtonElement.style.display = 'none';

        this._timerElement = <HTMLElement>this._container.querySelector('.timer');
    }

    public setSpinnerEnabled(value: boolean): void {
        if(this._spinnerEnabled !== value) {
            this._spinnerEnabled = value;
            this._spinnerElement.style.display = value ? 'block' : 'none';
        }
    }

    public setSkipEnabled(value: boolean): void {
        if(this._skipEnabled !== value) {
            this._skipEnabled = value;
            this._skipElement.style.display = value ? 'block' : 'none';
        }
    }

    public setVideoDurationEnabled(value: boolean) {
        if(this._videoDurationEnabled !== value) {
            this._videoDurationEnabled = value;
        }
    }

    public setVideoProgress(value: number): void {
        if(NewVideoOverlay.AutoSkip) {
            this._handlers.forEach(handler => handler.onOverlaySkip(value));
        }

        if(this._fadeEnabled && !this._fadeTimer && (!this._skipEnabled || this._skipRemaining <= 0)) {
            this._fadeTimer = setTimeout(() => {
                this.fade(true);
                this._fadeTimer = undefined;
            }, 3000);
        }

        this._videoProgress = value;
        this.setSkipElementVisible(this._skipEnabled);

        this._skipRemaining = this._skipDuration - this._videoProgress;

        if (this._skipRemaining <= 0) {
            (<HTMLElement>this._skipElement.children[0]).innerText = 'Skip';
            (<HTMLElement>this._skipElement.children[1]).style.display = 'inline';
        } else {
            (<HTMLElement>this._skipElement.children[0]).innerText = `Skip in ${this.formatTimer(Math.ceil(this._skipRemaining / 1000))}`;
            (<HTMLElement>this._skipElement.children[1]).style.display = 'none';
        }

        this._timerElement.innerText = this.formatTimer(Math.ceil((this._videoDuration - this._videoProgress) / 1000));
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
        if(this._debugMessageVisible !== value) {
            this._debugMessageElement.style.display = value ? 'block' : 'none';
        }
    }

    public setCallButtonVisible(value: boolean) {
        if(this._callButtonVisible !== value) {
            this._callButtonElement.style.display = value ? 'block' : 'none';
        }
    }

    public isMuted(): boolean {
        return this._muted;
    }

    private onSkipEvent(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        if(this._skipEnabled && this._videoProgress > this._skipDuration) {
            this._handlers.forEach(handler => handler.onOverlaySkip(this._videoProgress));
        }
    }

    private onMuteEvent(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.resetFadeTimer();

        if(!this._fadeStatus) {
            this.fade(false);
            return;
        }

        if(this._muted) {
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

        if(!this._fadeStatus) {
            this.fade(false);
        } else {
            this.fade(true);
        }
    }

    private setSkipElementVisible(value: boolean) {
        if(this._skipVisible !== value) {
            this._skipVisible = value;
            if(value) {
                this._skipElement.style.display = 'block';
            } else {
                this._skipElement.style.display = 'none';
            }
        }
    }

    private resetFadeTimer() {
        if(this._fadeTimer) {
            clearTimeout(this._fadeTimer);
            this._fadeTimer = undefined;
        }
    }

    private fade(value: boolean) {
        if (value) {
            this._container.classList.add('progress-fade');
            this._fadeStatus = false;
        } else {
            this._container.classList.remove('progress-fade');
            this._fadeStatus = true;
        }
    }

    private formatTimer(ms: number): string {
        const minutes = Math.floor(ms / 60);
        const seconds = ms % 60;

        let minutesStr = String(minutes);
        let secondsStr = String(seconds);

        if (minutes < 10) {
            minutesStr = '0' + minutes;
        }

        if (seconds < 10) {
            secondsStr = '0' + seconds;
        }

        return `${minutesStr}:${secondsStr}`;
    }

    private setCssTransition(): void {
        const transitionRule = `width ${(this._videoDuration - this._videoProgress) / 1000}s linear`;
        this._progressElement.style.transition = transitionRule;
        this._progressElement.style.webkitTransition = transitionRule;
    }

    public setCallButtonEnabled(value: boolean) {
        // EMPTY
    }
}