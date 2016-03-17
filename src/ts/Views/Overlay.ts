/// <amd-dependency path="text!html/Overlay.html" name="OverlayTemplate" />
import {Observable0, Observable1} from 'Utilities/Observable';
declare var OverlayTemplate: string;

import { View } from 'Views/View';
import { Template } from 'Utilities/Template';

export class Overlay extends View {

    public onSkip: Observable0;
    public onMute: Observable1<boolean>;

    private _skipEnabled: boolean;
    private _skipDuration: number;
    private _skipRemaining: number;

    private _videoDuration: number;
    private _videoProgress: number;

    private _muted: boolean;

    private _skipElement: HTMLElement;
    private _skipDurationElement: HTMLElement;
    private _videoDurationElement: HTMLElement;
    private _muteButtonElement: HTMLElement;

    constructor(muted: boolean) {
        super('overlay');

        this._template = new Template(OverlayTemplate);

        this._muted = muted;

        this._templateData = {
            muted: this._muted
        };

        this._bindings = [
            {
                event: 'click',
                listener: this.onSkipEvent.bind(this),
                selector: '.skip-button'
            },
            {
                event: 'click',
                listener: this.onMuteEvent.bind(this),
                selector: '.mute-button'
            }
        ];
    }

    public render(): void {
        super.render();
        this._skipElement = <HTMLElement>this._container.querySelector('.skip-button');
        this._skipDurationElement = <HTMLElement>this._container.querySelector('.skip-duration');
        this._videoDurationElement = <HTMLElement>this._container.querySelector('.video-duration');
        this._muteButtonElement = <HTMLElement>this._container.querySelector('.mute-button');
    }

    public setSkipEnabled(value: boolean): void {
        this._skipEnabled = value;
        this._skipElement.style.display = value ? 'block' : 'none';
    }

    public setSkipDuration(value: number): void {
        this._skipDuration = this._skipRemaining = value * 1000;
        this.setSkipText(value);
    }

    public setVideoDuration(value: number): void {
        this._videoDuration = value;
        this._videoDurationElement.innerHTML = Math.round(value / 1000).toString();
    }

    public setVideoProgress(value: number): void {
        this._videoProgress = value;
        if(this._skipEnabled && this._skipRemaining > 0) {
            this._skipRemaining = Math.round((this._skipDuration - value) / 1000);
            this.setSkipText(this._skipRemaining);
        }
        this._videoDurationElement.innerHTML = Math.round((this._videoDuration - value) / 1000).toString();
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
            this.onSkip.trigger();
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

}
