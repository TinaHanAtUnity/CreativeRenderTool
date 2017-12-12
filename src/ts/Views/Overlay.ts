import OverlayTemplate from 'html/Overlay.html';

import { NativeBridge } from 'Native/NativeBridge';
import { Template } from 'Utilities/Template';
import { Localization } from 'Utilities/Localization';
import { Platform } from 'Constants/Platform';
import { AbstractOverlay } from 'Views/AbstractOverlay';

export class Overlay extends AbstractOverlay {

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

    private _progressElement: HTMLElement;

    private _fadeTimer: any;
    private _fadeStatus: boolean = true;

    constructor(nativeBridge: NativeBridge, muted: boolean, language: string, gameId: string, abGroup: number = 0) {
        super(nativeBridge, 'overlay', muted, abGroup);

        this._localization = new Localization(language, 'overlay');
        this._template = new Template(OverlayTemplate, this._localization);

        this._templateData = {
            muted: muted
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

        if(gameId === '1300023' || gameId === '1300024') {
            this._bindings.push({
                event: 'swipe',
                listener: (event: Event) => this.onSkipEvent(event)
            });
        }
    }

    public render(): void {
        super.render();
        this._skipElement = <HTMLElement>this._container.querySelector('.skip-hit-area');
        this._spinnerElement = <HTMLElement>this._container.querySelector('.buffering-spinner');
        this._muteButtonElement = <HTMLElement>this._container.querySelector('.mute-button');
        this._debugMessageElement = <HTMLElement>this._container.querySelector('.debug-message-text');
        this._callButtonElement = <HTMLElement>this._container.querySelector('.call-button');
        this._progressElement = <HTMLElement>this._container.querySelector('.progress');
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
            this._progressElement.style.display  = value ? 'block' : 'none';
        }
    }

    public setVideoProgress(value: number): void {
        if(Overlay.AutoSkip) {
            this._handlers.forEach(handler => handler.onOverlaySkip(value));
        }

        if(this._fadeEnabled && !this._fadeTimer && (!this._skipEnabled || this._skipRemaining <= 0)) {
            this._fadeTimer = setTimeout(() => {
                this.fade(true);
                this._fadeTimer = undefined;
            }, 3000);
        }

        this._videoProgress = value;
        if(this._skipEnabled && this._skipRemaining > 0) {
            this._skipRemaining = this._skipDuration - value;
            if(this._skipRemaining <= 0) {
                this.setSkipElementVisible(true);
                this.updateProgressCircle(this._skipElement, 1);
            } else {
                this.updateProgressCircle(this._skipElement, (this._skipDuration - this._skipRemaining) / this._skipDuration);
            }
        }
        this._progressElement.setAttribute('data-seconds',  Math.round((this._videoDuration - value) / 1000).toString());
        this.updateProgressCircle(this._progressElement, this._videoProgress / this._videoDuration);
    }

    public setMuteEnabled(value: boolean) {
        if(this._muteEnabled !== value) {
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

    private updateProgressCircle(container: HTMLElement, value: number) {
        const wrapperElement = <HTMLElement>container.querySelector('.progress-wrapper');

        if(this._nativeBridge.getPlatform() === Platform.ANDROID && this._nativeBridge.getApiLevel() < 15) {
            wrapperElement.style.display = 'none';
            this._container.style.display = 'none';
            /* tslint:disable:no-unused-expression */
            this._container.offsetHeight;
            /* tslint:enable:no-unused-expression */
            this._container.style.display = 'block';
            return;
        }

        const leftCircleElement = <HTMLElement>container.querySelector('.circle-left');
        const rightCircleElement = <HTMLElement>container.querySelector('.circle-right');

        const degrees = value * 360;
        leftCircleElement.style.webkitTransform = 'rotate(' + degrees + 'deg)';

        if(value >= 0.5) {
            wrapperElement.style.webkitAnimationName = 'close-progress-wrapper';
            rightCircleElement.style.webkitAnimationName = 'right-spin';
        }
    }

    private setSkipElementVisible(value: boolean) {
        if(this._skipVisible !== value) {
            this._skipVisible = value;
            const skipIconElement = <HTMLElement>this._container.querySelector('.skip');
            if(value) {
                skipIconElement.classList.add('enabled');
            } else {
                skipIconElement.classList.remove('enabled');
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
            this._skipElement.classList.remove('slide-back-in-place');
            this._skipElement.classList.add('slide-up');
            this._progressElement.classList.remove('slide-back-in-place');
            this._progressElement.classList.add('slide-up');
            this._muteButtonElement.classList.remove('slide-back-in-place');
            this._muteButtonElement.classList.add('slide-down');
            this._container.style.pointerEvents = 'auto';
            this._fadeStatus = false;
        } else {
            this._container.style.pointerEvents = 'none';
            this._skipElement.classList.remove('slide-up');
            this._skipElement.classList.add('slide-back-in-place');
            this._progressElement.classList.remove('slide-up');
            this._progressElement.classList.add('slide-back-in-place');
            this._muteButtonElement.classList.remove('slide-down');
            this._muteButtonElement.classList.add('slide-back-in-place');
            this._fadeStatus = true;
        }
    }
}
