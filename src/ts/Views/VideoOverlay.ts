import OverlayTemplate from 'html/VideoOverlay.html';

import { NativeBridge } from 'Native/NativeBridge';
import { Template } from 'Utilities/Template';
import { Observable1 } from 'Utilities/Observable';
import { Localization } from 'Utilities/Localization';
import { Platform } from 'Constants/Platform';
import { AbstractVideoOverlay } from 'Views/AbstractVideoOverlay';

export class VideoOverlay extends AbstractVideoOverlay {

    public onFullScreenButton: Observable1<boolean> = new Observable1();

    private _localization: Localization;

    private _spinnerEnabled: boolean = false;

    private _skipVisible: boolean = false;
    private _skipEnabled: boolean;
    private _skipDuration: number;
    private _skipRemaining: number;

    private _videoDurationEnabled: boolean = false;
    private _videoDuration: number;
    private _videoProgress: number;

    private _muteEnabled: boolean = false;
    private _muted: boolean;

    private _debugMessageVisible: boolean = false;

    private _callButtonVisible: boolean = false;

    private _skipElement: HTMLElement;
    private _spinnerElement: HTMLElement;
    private _muteButtonElement: HTMLElement;
    private _debugMessageElement: HTMLElement;
    private _callButtonElement: HTMLElement;

    private _progressElement: HTMLElement;
    private _progressLeftCircleElement: HTMLElement;
    private _progressRightCircleElement: HTMLElement;
    private _progressWrapperElement: HTMLElement;
    private _fullScreenButtonElement: HTMLElement;

    private _fullScreenButtonVisible: boolean = false;

    private _fadeTimer: any;

    constructor(nativeBridge: NativeBridge, muted: boolean, language: string) {
        super(nativeBridge, 'video-overlay');

        this._localization = new Localization(language, 'overlay');
        this._template = new Template(OverlayTemplate, this._localization);

        this._muted = muted;

        this._templateData = {
            muted: this._muted
        };

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onSkipEvent(event),
                selector: '.skip-icon'
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
                listener: (event: Event) => this.onFullScreenButtonEvent(event),
                selector: '.full-screen-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onClick(event)
            }
        ];
    }

    public render(): void {
        super.render();
        this._skipElement = <HTMLElement>this._container.querySelector('.skip-icon');
        this._spinnerElement = <HTMLElement>this._container.querySelector('.buffering-spinner');
        this._muteButtonElement = <HTMLElement>this._container.querySelector('.mute-button');
        this._debugMessageElement = <HTMLElement>this._container.querySelector('.debug-message-text');
        this._callButtonElement = <HTMLElement>this._container.querySelector('.call-button');
        this._progressElement = <HTMLElement>this._container.querySelector('.progress');
        this._progressLeftCircleElement = <HTMLElement>this._container.querySelector('.circle-left');
        this._progressRightCircleElement = <HTMLElement>this._container.querySelector('.circle-right');
        this._progressWrapperElement = <HTMLElement>this._container.querySelector('.progress-wrapper');
        this._fullScreenButtonElement = <HTMLElement>this._container.querySelector('.full-screen-button');
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
        }
    }

    public setSkipDuration(value: number): void {
        this._skipDuration = this._skipRemaining = value * 1000;
    }

    public setVideoDurationEnabled(value: boolean) {
        if(this._videoDurationEnabled !== value) {
            this._videoDurationEnabled = value;
            this._progressElement.style.display  = value ? 'block' : 'none';
        }
    }

    public setVideoDuration(value: number): void {
        this._videoDuration = value;
    }

    public setVideoProgress(value: number): void {
        if(AbstractVideoOverlay.AutoSkip) {
            this.onSkip.trigger(value);
        }

        if(!this._fadeTimer) {
            this._fadeTimer = setTimeout(() => {
                this.fade(true);
                this._fadeTimer = undefined;
            }, 3000);
        }

        this._videoProgress = value;
        if(this._skipEnabled && this._skipRemaining > 0) {
            this._skipRemaining = Math.round((this._skipDuration - value) / 1000);
            if(this._skipRemaining <= 0) {
                this.setSkipElementVisible(true);
            }
        }
        this._progressElement.setAttribute('data-seconds',  Math.round((this._videoDuration - value) / 1000).toString());
        this.updateProgressCircle();
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

    public setFullScreenButtonVisible(value: boolean) {
        if(this._fullScreenButtonVisible !== value) {
            this._fullScreenButtonElement.style.display = value ? 'block' : 'none';
        }
    }

    public isMuted(): boolean {
        return this._muted;
    }

    private onSkipEvent(event: Event): void {
        event.preventDefault();
        if(this._skipEnabled && this._videoProgress > this._skipDuration) {
            this.onSkip.trigger(this._videoProgress);
        }
    }

    private onMuteEvent(event: Event): void {
        event.preventDefault();
        if(this._muted) {
            this._muteButtonElement.classList.remove('muted');
            this._muted = false;
        } else {
            this._muteButtonElement.classList.add('muted');
            this._muted = true;
        }
        this.onMute.trigger(this._muted);
    }

    private onCallButtonEvent(event: Event): void {
        event.preventDefault();
        this.onCallButton.trigger(true);
    }

    private onClick(event: Event) {
        if(this._fadeTimer) {
            clearTimeout(this._fadeTimer);
            this._fadeTimer = undefined;
        }
        this.fade(false);
    }

    private onFullScreenButtonEvent(event: Event): void {
        event.preventDefault();
        this.onFullScreenButton.trigger(true);

    }

    private updateProgressCircle() {
        if(this._nativeBridge.getPlatform() === Platform.ANDROID && this._nativeBridge.getApiLevel() < 15) {
            this._progressWrapperElement.style.display = 'none';
            this._container.style.display = 'none';
            /* tslint:disable:no-unused-expression */
            this._container.offsetHeight;
            /* tslint:enable:no-unused-expression */
            this._container.style.display = 'block';
            return;
        }
        const degree = (this._videoProgress / this._videoDuration) * 360;
        const rotateParam = 'rotate(' + degree + 'deg)';
        this._progressLeftCircleElement.style.webkitTransform = rotateParam;

        if(this._videoProgress > this._videoDuration / 2) {
            this._progressWrapperElement.style.webkitAnimationName = 'close-progress-wrapper';
            this._progressRightCircleElement.style.webkitAnimationName = 'right-spin';
        }
    }

    private setSkipElementVisible(value: boolean) {
        if(this._skipVisible !== value) {
            this._skipElement.style.display = value ? 'block' : 'none';
        }
    }

    private fade(value: boolean) {
        if(value) {
            this._container.classList.add('fade');
        } else {
            this._container.classList.remove('fade');
        }
    }

}
