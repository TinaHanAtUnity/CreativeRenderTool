import * as OverlayTemplate from 'text!html/Overlay.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Observable1 } from 'Utilities/Observable';

export class Overlay extends View {

    public onSkip: Observable1<number> = new Observable1();
    public onMute: Observable1<boolean> = new Observable1();
    public onCallButton: Observable1<boolean> = new Observable1();

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
    private _skipDurationElement: HTMLElement;
    private _videoDurationElement: HTMLElement;
    private _videoDurationCounterElement: HTMLElement;
    private _muteButtonElement: HTMLElement;
    private _debugMessageElement: HTMLElement;
    private _callButtonElement: HTMLElement;

    constructor(nativeBridge: NativeBridge, muted: boolean) {
        super(nativeBridge, 'overlay');

        this._template = new Template(<string>(typeof OverlayTemplate === 'string' ? OverlayTemplate : OverlayTemplate.default));

        this._muted = muted;

        this._templateData = {
            muted: this._muted
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
            }
        ];
    }

    public render(): void {
        super.render();
        this._skipElement = <HTMLElement>this._container.querySelector('.skip-button');
        this._spinnerElement = <HTMLElement>this._container.querySelector('.buffering-spinner');
        this._skipDurationElement = <HTMLElement>this._container.querySelector('.skip-duration');
        this._videoDurationElement = <HTMLElement>this._container.querySelector('.video-duration-text');
        this._videoDurationCounterElement = <HTMLElement>this._container.querySelector('.video-duration');
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

    public setSkipVisible(value: boolean) {
        if(this._skipVisible !== value) {
            this._skipElement.style.display = value ? 'block' : 'none';
        }
    }

    public setSkipEnabled(value: boolean): void {
        if(this._skipEnabled !== value) {
            this._skipEnabled = value;
        }
    }

    public setSkipDuration(value: number): void {
        this._skipDuration = this._skipRemaining = value * 1000;
        this.setSkipText(value);
    }

    public setVideoDurationEnabled(value: boolean) {
        if(this._videoDurationEnabled !== value) {
            this._videoDurationEnabled = value;
            this._videoDurationElement.style.display = value ? 'block' : 'none';
        }
    }

    public setVideoDuration(value: number): void {
        this._videoDuration = value;
        this._videoDurationCounterElement.innerHTML = Math.round(value / 1000).toString();
    }

    public setVideoProgress(value: number): void {
        this._videoProgress = value;
        if(this._skipEnabled && this._skipRemaining > 0) {
            this._skipRemaining = Math.round((this._skipDuration - value) / 1000);
            this.setSkipText(this._skipRemaining);
        }
        if(this._videoDuration > value) {
            this._videoDurationCounterElement.innerHTML = Math.round((this._videoDuration - value) / 1000).toString();
        } else {
            // sometimes video duration and progress might be reported with slight inaccuracies so prevent showing negative numbers
            this._videoDurationCounterElement.innerHTML = '0';
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

    public isMuted(): boolean {
        return this._muted;
    }

    private setSkipText(skipRemaining: number): void {
        if(skipRemaining <= 0) {
            this._skipElement.innerHTML = 'Skip Video';
        } else {
            this._skipDurationElement.innerHTML = skipRemaining.toString();
        }
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

}
