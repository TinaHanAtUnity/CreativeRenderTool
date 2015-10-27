/// <amd-dependency path="text!html/Overlay.html" name="OverlayTemplate" />
declare var OverlayTemplate: string;

import View from 'Views/View';
import Template from 'Utilities/Template';

export default class Overlay extends View {

    private _skipEnabled: boolean;
    private _skipDuration: number;

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
                listener: this.onSkip.bind(this),
                selector: '.skip-button'
            },
            {
                event: 'click',
                listener: this.onMute.bind(this),
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
        this._skipDuration = value * 1000;
        if(value <= 0) {
            this._skipElement.innerHTML = 'Skip Video';
        } else {
            this._skipDurationElement.innerHTML = value.toString();
        }
    }

    public setVideoDuration(value: number): void {
        this._videoDuration = value;
    }

    public setVideoProgress(value: number): void {
        this._videoProgress = value;
        if(this._skipEnabled && this._skipDuration >= 0) {
            let skipRemaining: number = Math.round((this._skipDuration - value) / 1000);
            if(skipRemaining <= 0) {
                this._skipElement.innerHTML = 'Skip Video';
            } else {
                this._skipDurationElement.innerHTML = skipRemaining.toString();
            }
        }
        this._videoDurationElement.innerHTML = Math.round((this._videoDuration - value) / 1000).toString();
    }

    public isMuted(): boolean {
        return this._muted;
    }

    private onSkip(event: Event): void {
        event.preventDefault();
        if(this._videoProgress > this._skipDuration) {
            this.trigger('skip');
        }
    }

    private onMute(event: Event): void {
        event.preventDefault();
        if(this._muted) {
            this._muteButtonElement.classList.remove('muted');
            this._muted = false;
        } else {
            this._muteButtonElement.classList.add('muted');
            this._muted = true;
        }
        this.trigger('mute', this._muted);
    }

}
