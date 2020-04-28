import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { IExperimentActionChoice } from 'Ads/Models/AutomatedExperiment';
import { Platform } from 'Core/Constants/Platform';
import { IAdsApi } from 'Ads/IAds';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { Placement } from 'Ads/Models/Placement';
import { Campaign } from 'Ads/Models/Campaign';
import { VideoOverlayDownloadExperiment, VideoOverlayDownloadExperimentDeclaration } from 'Ads/Models/AutomatedExperimentsList';
import { AUIMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { AbstractPrivacy, IPrivacyHandlerView } from 'Ads/Views/AbstractPrivacy';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';

export interface IVideoOverlayParameters<T extends Campaign> {
    platform: Platform;
    ads: IAdsApi;
    deviceInfo: DeviceInfo;
    clientInfo: ClientInfo;
    campaign: T;
    coreConfig: CoreConfiguration;
    placement: Placement;
}

export class SwipeUpVideoOverlay extends VideoOverlay {
    private _ctaMode: string;
    protected _swipeUpButtonElement: HTMLElement;

    constructor(
        parameters: IVideoOverlayParameters<Campaign>,
        privacy: AbstractPrivacy,
        showGDPRBanner: boolean,
        showPrivacyDuringVideo: boolean,
        combination: IExperimentActionChoice | undefined
    ) {
        super(parameters, privacy, showGDPRBanner, showPrivacyDuringVideo);

        if (combination) {
            if (!VideoOverlayDownloadExperiment.isValid(combination)) {
                combination = VideoOverlayDownloadExperiment.getDefaultActions();
                SDKMetrics.reportMetricEvent(AUIMetric.InvalidVideoOverlayMode);
            }

            switch (combination.mode) {
                case VideoOverlayDownloadExperimentDeclaration.mode.SWIPEUP:
                    this._ctaMode = 'swipeup';
                    break;
                case VideoOverlayDownloadExperimentDeclaration.mode.CLICK:
                    this._ctaMode = 'click';
                    break;
                default:
            }
        } else {
            this._ctaMode = 'click';
        }

        if (this._ctaMode === 'swipeup') {
            this._bindings.push({
                event: 'swipeup',
                listener: (event: Event) => this.onSwipeUpEvent(event),
                selector: '.swipe-up-zone'
            });
        }
    }

    protected showCTAButton() {
        if (this._campaign instanceof PerformanceCampaign || this._campaign instanceof XPromoCampaign) {
            if (this._ctaMode === 'click') {
                this.showCallButton();
            } else if (this._ctaMode === 'swipeup') {
                this.showSwipeUpButton();
            }
        }
    }

    protected handleVideoProgressButton() {
        if (!this._skipEnabled && this._videoProgress > 5000) {
            this.showCTAButton();
            return;
        }
    }

    protected showSkipButton() {
        if (this._skipEnabled) {
            this._skipButtonElement.classList.add('show-skip-button');
                this.showCTAButton();
        }
    }

    protected handleFadeInButton() {
        if (this._ctaMode === 'click') {
            setTimeout(() => {
                this.showCallButton();
            }, 500);
        } else if (this._ctaMode === 'swipeup') {
            setTimeout(() => {
                this.showSwipeUpButton();
            }, 500);
        }
    }

    protected showSwipeUpButton() {
        this._swipeUpButtonElement.classList.add('show-swipe-up-button');
    }

    protected onClick(event: Event) {
        if (event.type !== 'swipeup') {
            super.onClick(event);
        }
    }

    protected setupElementReferences(): void {
        super.setupElementReferences();
        this._swipeUpButtonElement = <HTMLElement> this._container.querySelector('.swipe-up-button');
    }

    protected onSwipeUpEvent (event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.resetFadeTimer();
        this._handlers.forEach(handler => handler.onOverlayCallButton());
        this.triggerOnOverlayDownload();
    }
}
