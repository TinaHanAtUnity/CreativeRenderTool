import ProgressBarOverlayTemplate from 'html/ProgressBarOverlay.html';

import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { Platform } from 'Core/Constants/Platform';
import { Campaign } from 'Ads/Models/Campaign';
import { IAdsApi } from 'Ads/IAds';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { Placement } from 'Ads/Models/Placement';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';

export interface IVideoOverlayParameters<T extends Campaign> {
    platform: Platform;
    ads: IAdsApi;
    deviceInfo: DeviceInfo;
    clientInfo: ClientInfo;
    campaign: T;
    coreConfig: CoreConfiguration;
    placement: Placement;
}

export class ProgressBarVideoOverlay extends VideoOverlay {
public _videoRemained: number;
    private _progressBar: HTMLElement;
    private _topContainer: HTMLElement;
    private _progressBarWrapper: HTMLElement;

    constructor(parameters: IVideoOverlayParameters<Campaign>, privacy: AbstractPrivacy, showGDPRBanner: boolean, showPrivacyDuringVideo: boolean) {
        super(parameters, privacy, showGDPRBanner, true);
    }

    public setVideoProgress(value: number): void {
        super.setVideoProgress(value);
        const delta = (value - this._videoProgress) || 0;
        this._videoProgress = value;
        const progressInPercentages = Math.ceil(100 / this._videoDuration * this._videoProgress);
        if (delta >= 0) {
            if (this._progressBar.style.transition === '' && this._progressBar.style.webkitTransition === '') {
                this.setCssTransition();
            }
            this._progressBar.style.width = '100%';
        } else {
            this.removeCssTransition();
            this._progressBar.style.width = `${progressInPercentages}%`;
        }

    }

    private setCssTransition(): void {
        const transitionRule = `width ${(this._videoDuration - this._videoProgress) / 1000}s linear`;
        this._progressBar.style.transition = transitionRule;
        this._progressBar.style.webkitTransition = transitionRule;
    }

    private removeCssTransition(): void {
        this._progressBar.style.transition = '';
        this._progressBar.style.webkitTransition = '';
    }

    // private setCssTransition(): void {
    //     const progressInPercentages = Math.ceil(100 / this._videoDuration * this._videoProgress);

    //     const transitionRule = `width ${(this._videoDuration - this._videoProgress) / 1000}s linear`;
    //     // const progressInPercentages = Math.ceil(100 / this._videoDuration * this._videoProgress);
    //     // this._progressBar.style.width = `${progressInPercentages}%`;
    //     // this._progressBar.style.transition = transitionRule;
    //     // this._progressBar.style.webkitTransition = transitionRule;
    // }

    public render(): void {
        super.render();
        this._topContainer = <HTMLElement>this._container.querySelector('.top-container');

        if (this._topContainer) {
            this._progressBarWrapper = <HTMLElement>document.createElement('div');
            this._progressBar = <HTMLElement>document.createElement('span');
            this._progressBar.classList.add('progress-bar');
            this._progressBarWrapper.classList.add('progress-wrapper');
            this._progressBarWrapper.appendChild(this._progressBar);
            this._topContainer.insertBefore(this._progressBarWrapper, this._topContainer.childNodes[0] || null);
        }
    }
}
