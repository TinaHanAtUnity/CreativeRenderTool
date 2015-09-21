/// <amd-dependency path="text!html/Overlay.html" name="OverlayTemplate" />
declare var OverlayTemplate: string;

import View from 'Views/View';
import Template from 'Utilities/Template';

export default class Overlay extends View {

    private _skipEnabled: boolean;
    private _skipDuration: number;

    private _videoDuration: number;
    private _videoProgress: number;

    private _skipElement: HTMLElement;
    private _skipDurationElement: HTMLElement;
    private _videoDurationElement: HTMLElement;

    constructor() {
        super('overlay');

        this._template = new Template(OverlayTemplate);

        this._templateData = {};

        this._bindings = [
            {
                event: 'click',
                listener: this.onSkip.bind(this),
                selector: '.skip-button'
            }
        ];
    }

    public render(): void {
        super.render();
        this._skipElement = <HTMLElement>this._container.querySelector('.skip-button');
        this._skipDurationElement = <HTMLElement>this._container.querySelector('.skip-duration');
        this._videoDurationElement = <HTMLElement>this._container.querySelector('.video-duration');
    }

    public setSkipEnabled(value: boolean): void {
        this._skipEnabled = value;
        this._skipElement.style.display = value ? 'block' : 'none';
    }

    public setSkipDuration(value: number): void {
        this._skipDuration = value * 1000;
        this._skipDurationElement.innerHTML = value.toString();
    }

    public setVideoDuration(value: number): void {
        this._videoDuration = value;
    }

    public setVideoProgress(value: number): void {
        this._videoProgress = value;
        if(this._skipEnabled) {
            let skipRemaining: number = Math.round((this._skipDuration - value) / 1000);
            if(skipRemaining < 0) {
                this._skipElement.innerHTML = 'Skip Video';
            } else {
                this._skipDurationElement.innerHTML = skipRemaining.toString();
            }
        }
        this._videoDurationElement.innerHTML = Math.round((this._videoDuration - value) / 1000).toString();
    }

    private onSkip(event: Event): void {
        event.preventDefault();
        if(this._videoProgress > this._skipDuration) {
            this.trigger(this._id, 'skip');
        }
    }

}
