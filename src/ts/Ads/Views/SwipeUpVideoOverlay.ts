import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { IExperimentActionChoice } from 'MabExperimentation/Models/AutomatedExperiment';
import { Platform } from 'Core/Constants/Platform';
import { IAdsApi } from 'Ads/IAds';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { Placement } from 'Ads/Models/Placement';
import { Campaign } from 'Ads/Models/Campaign';
import { VideoOverlayDownloadExperiment, VideoOverlayDownloadExperimentDeclaration } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { AUIMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { AbstractPrivacy, IPrivacyHandlerView } from 'Ads/Views/AbstractPrivacy';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { Template } from 'Core/Utilities/Template';
import SwipeUpVideoOverlayTemplate from 'html/SwipeUpVideoOverlay.html';

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

        this._template = new Template(SwipeUpVideoOverlayTemplate, this._localization);

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

    protected fadeIn() {
        if (!this._container) {
            return;
        }
        this._container.classList.add('fade-in');
        this._areControlsVisible = true;

        if (this._campaign instanceof PerformanceCampaign || this._campaign instanceof XPromoCampaign) {
            return;
        }
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
