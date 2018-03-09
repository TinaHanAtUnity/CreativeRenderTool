import InterstitialOverlayTemplate from 'html/InterstitialOverlay.html';

import { NativeBridge } from 'Native/NativeBridge';
import { Template } from 'Utilities/Template';
import { Localization } from 'Utilities/Localization';
import { AbstractVideoOverlay } from 'Views/AbstractVideoOverlay';

export class InterstitialOverlay extends AbstractVideoOverlay {

    private _spinnerEnabled: boolean = false;

    private _closeElement: HTMLElement;
    private _spinnerElement: HTMLElement;
    private _muteButtonElement: HTMLElement;
    private _debugMessageElement: HTMLElement;
    private _callButtonElement: HTMLElement;

    private _canClose: boolean = false;

    private _muteEnabled: boolean = false;

    private _debugMessageVisible: boolean = false;

    private _callButtonVisible: boolean = false;

    private _fadeTimer: any;
    private _fadeStatus: boolean = true;

    constructor(nativeBridge: NativeBridge, muted: boolean, language: string, gameId: string, abGroup: number = 0) {
        super(nativeBridge, 'interstitial-overlay', muted, abGroup);

        const localization = new Localization(language, 'overlay');
        this._template = new Template(InterstitialOverlayTemplate, localization);

        this._templateData = {
            muted: muted
        };

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.close-region'
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
        this._closeElement = <HTMLElement>this._container.querySelector('.close-region');
        this._spinnerElement = <HTMLElement>this._container.querySelector('.buffering-spinner');
        this._muteButtonElement = <HTMLElement>this._container.querySelector('.mute-button');
        this._debugMessageElement = <HTMLElement>this._container.querySelector('.debug-message-text');
        this._callButtonElement = <HTMLElement>this._container.querySelector('.call-button');
    }

    public setSpinnerEnabled(value: boolean): void {
        if(this._spinnerEnabled !== value) {
            this._spinnerEnabled = value;
            this._spinnerElement.style.display = value ? 'block' : 'none';
        }
    }

    public setSkipEnabled(value: boolean): void {
        // EMPTY
    }

    public setVideoDurationEnabled(value: boolean): void {
        // EMPTY
    }

    public setVideoProgress(value: number): void {
        if(AbstractVideoOverlay.AutoSkip) {
            this._handlers.forEach(handler => handler.onOverlaySkip(value));
        }

        if(this._fadeEnabled && !this._fadeTimer && this._skipRemaining <= 0) {
            this._fadeTimer = setTimeout(() => {
                this.fade(true);
                this._fadeTimer = undefined;
            }, 3000);
        }

        this._skipRemaining = this._skipDuration - value;
        if(this._skipRemaining > 0) {
            this._skipRemaining--;
            this.updateProgressCircle(this._closeElement, (this._skipDuration - this._skipRemaining) / this._skipDuration);
        } else {
            this._canClose = true;
            this._closeElement.style.opacity = '1';
            this.updateProgressCircle(this._closeElement, 1);

        }
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

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        if(this._canClose) {
            this._handlers.forEach(handler => handler.onOverlayClose());
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

    private resetFadeTimer() {
        if (this._fadeTimer) {
            clearTimeout(this._fadeTimer);
            this._fadeTimer = undefined;
        }
    }

    private fade(value: boolean) {
        if (value) {
            this._closeElement.classList.remove('slide-back-in-place');
            this._closeElement.classList.add('slide-up');
            this._muteButtonElement.classList.remove('slide-back-in-place');
            this._muteButtonElement.classList.add('slide-down');
            this._container.style.pointerEvents = 'auto';
            this._fadeStatus = false;
        } else {
            this._container.style.pointerEvents = 'none';
            this._closeElement.classList.remove('slide-up');
            this._closeElement.classList.add('slide-back-in-place');
            this._muteButtonElement.classList.remove('slide-down');
            this._muteButtonElement.classList.add('slide-back-in-place');
            this._fadeStatus = true;
        }
    }

    private updateProgressCircle(container: HTMLElement, value: number) {
        const wrapperElement = <HTMLElement>container.querySelector('.progress-wrapper');

        const leftCircleElement = <HTMLElement>container.querySelector('.circle-left');
        const rightCircleElement = <HTMLElement>container.querySelector('.circle-right');

        const degrees = value * 360;
        leftCircleElement.style.webkitTransform = 'rotate(' + degrees + 'deg)';

        if(value >= 0.5) {
            wrapperElement.style.webkitAnimationName = 'close-progress-wrapper';
            rightCircleElement.style.webkitAnimationName = 'right-spin';
        }
    }
}
