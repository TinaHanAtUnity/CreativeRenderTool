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

    constructor(parameters: IVideoOverlayParameters<Campaign>, privacy: AbstractPrivacy, showGDPRBanner: boolean, showPrivacyDuringVideo: boolean) {
        super(parameters, privacy, showGDPRBanner, true);
    }

    public setVideoProgress(value: number): void {
        super.setVideoProgress(value);
        this._videoRemained = this._videoDuration - this._videoProgress;
        // console.log(this._videoRemained);
        if (this._progressBar.style.transition === '' && this._progressBar.style.webkitTransition === '') {
            this.setCssTransition();
            this._progressBar.style.width = '100%';
        }
    }

    private setCssTransition(): void {

        const transitionRule = `width ${(this._videoDuration - this._videoProgress) / 1000}s linear`;
        // const progressInPercentages = Math.ceil(100 / this._videoDuration * this._videoProgress);
        // this._progressBar.style.width = `${progressInPercentages}%`;
        this._progressBar.style.transition = transitionRule;
        this._progressBar.style.webkitTransition = transitionRule;
    }

    public render(): void {
        super.render();
        const topContainer = this._container.querySelector('.top-container');
        if (topContainer) {
            const progressBar = document.createElement('span');
            progressBar.classList.add('progress-bar');
            this._progressBar = topContainer.insertBefore(progressBar, topContainer.childNodes[0] || null);
        }
    }
}
