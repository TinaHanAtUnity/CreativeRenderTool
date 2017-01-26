import OverlayTemplate from 'html/Overlay.html';

import { NativeBridge } from 'Native/NativeBridge';
import { Template } from 'Utilities/Template';
import { Observable1 } from 'Utilities/Observable';
import { Localization } from 'Utilities/Localization';
import { Platform } from 'Constants/Platform';
import { View } from 'Views/View';

export class Overlay extends View {

    public static setAutoSkip(value: boolean) {
        Overlay.AutoSkip = value;
    }

    protected static AutoSkip: boolean = false;

    public onSkip: Observable1<number> = new Observable1();
    public onMute: Observable1<boolean> = new Observable1();
    public onCallButton: Observable1<boolean> = new Observable1();

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

    private _headerElement: HTMLElement;
    private _footerElement: HTMLElement;
    private _skipElement: HTMLElement;
    private _spinnerElement: HTMLElement;
    private _muteButtonElement: HTMLElement;
    private _debugMessageElement: HTMLElement;
    private _callButtonElement: HTMLElement;

    private _progressElement: HTMLElement;

    private _fullScreenButtonElement: HTMLElement;
    private _fullScreenButtonVisible: boolean = false;

    private _slideTimer: any;
    private _slideStatus: boolean = true;

    constructor(nativeBridge: NativeBridge, muted: boolean, language: string) {
        super(nativeBridge, 'overlay');

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
                selector: '.skip'
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
        this._headerElement = <HTMLElement>this._container.querySelector('.header');
        this._footerElement = <HTMLElement>this._container.querySelector('.footer');
        this._skipElement = <HTMLElement>this._container.querySelector('.skip');
        this._spinnerElement = <HTMLElement>this._container.querySelector('.buffering-spinner');
        this._muteButtonElement = <HTMLElement>this._container.querySelector('.mute-button');
        this._debugMessageElement = <HTMLElement>this._container.querySelector('.debug-message-text');
        this._callButtonElement = <HTMLElement>this._container.querySelector('.call-button');
        this._progressElement = <HTMLElement>this._container.querySelector('.progress');
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
            this._skipElement.style.display = value ? 'block' : 'none';
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
        if(Overlay.AutoSkip) {
            this.onSkip.trigger(value);
        }

        if(!this._slideTimer && (!this._skipEnabled || this._skipRemaining <= 0)) {
            this._slideTimer = setTimeout(() => {
                this.slide(true);
                this._slideTimer = undefined;
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
        if(this._slideTimer) {
            clearTimeout(this._slideTimer);
            this._slideTimer = undefined;
        }

        if(!this._slideStatus) {
            this.slide(false);
        } else {
            this.slide(true);
        }
    }

    private onFullScreenButtonEvent(event: Event): void {
        event.preventDefault();
        this.onFullScreenButton.trigger(true);

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
            this._skipElement.style.opacity = value ? '1' : '0.4';
        }
    }

    private slide(value: boolean) {
        if(value) {
            this._headerElement.style.transform = 'translateY(-' + this._headerElement.clientHeight + 'px)';
            this._footerElement.style.transform = 'translateY(' + this._footerElement.clientHeight + 'px)';
            this._slideStatus = false;
        } else {
            this._headerElement.style.transform = 'translateY(0px)';
            this._footerElement.style.transform = 'translateY(0px)';
            this._slideStatus = true;
        }
    }
}
