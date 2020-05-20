import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { IExperimentActionChoice } from 'MabExperimentation/Models/AutomatedExperiment';
import { Platform } from 'Core/Constants/Platform';
import { IAdsApi } from 'Ads/IAds';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { Placement } from 'Ads/Models/Placement';
import { Campaign } from 'Ads/Models/Campaign';
import { VideoOverlayDownloadExperiment, VideoOverlayDownloadExperimentDeclaration, AutomatedExperimentsCategories } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { AUIMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { AbstractPrivacy, IPrivacyHandlerView } from 'Ads/Views/AbstractPrivacy';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { Template } from 'Core/Utilities/Template';
import SwipeUpVideoOverlayTemplate from 'html/SwipeUpVideoOverlay.html';
import { AutomatedExperimentManager } from 'MabExperimentation/AutomatedExperimentManager';

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
    private _automatedExperimentManager: AutomatedExperimentManager;

    constructor(
        parameters: IVideoOverlayParameters<Campaign>,
        privacy: AbstractPrivacy,
        showGDPRBanner: boolean,
        showPrivacyDuringVideo: boolean,
        combination: IExperimentActionChoice | undefined,
        automatedExperimentManager: AutomatedExperimentManager
    ) {
        super(parameters, privacy, showGDPRBanner, showPrivacyDuringVideo);

        this._template = new Template(SwipeUpVideoOverlayTemplate, this._localization);
        this._automatedExperimentManager = automatedExperimentManager;

        if (combination) {
            if (!VideoOverlayDownloadExperiment.isValid(combination)) {
                combination = VideoOverlayDownloadExperiment.getDefaultActions();
                SDKMetrics.reportMetricEvent(AUIMetric.InvalidVideoOverlayMode);
            }

            if (combination.mode) {
                this._ctaMode = combination.mode;
                if (this._ctaMode === 'swipeup') {
                        this._bindings.push(
                        {
                            event: 'swipeup',
                            listener: (event: Event) => this.onSwipeUpEvent(event),
                            selector: '.swipe-up-zone'
                        },
                        {
                            event: 'click',
                            listener: (event: Event) => this.onSwipeUpEvent(event),
                            selector: '.swipe-up-button'
                        });
                    }
            }
        } else {
            this._ctaMode = 'click';
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
        this._automatedExperimentManager.rewardSelectedExperiment(this._campaign, AutomatedExperimentsCategories.VIDEO_OVERLAY);
    }

    protected onCallButtonEvent(event: Event) {
        super.onCallButtonEvent(event);
        this._automatedExperimentManager.rewardSelectedExperiment(this._campaign, AutomatedExperimentsCategories.VIDEO_OVERLAY);
    }

    protected onSkipEvent(event: Event): void {
        super.onSkipEvent(event);
        this._automatedExperimentManager.endSelectedExperiment(this._campaign, AutomatedExperimentsCategories.VIDEO_OVERLAY);
    }

    private callRewardOnVideoEnd() {
        if (Number(this._timerElement.innerText) <= 1) {
            this._automatedExperimentManager.endSelectedExperiment(this._campaign, AutomatedExperimentsCategories.VIDEO_OVERLAY);
        }
    }

    public hide(): void {
        this.callRewardOnVideoEnd();
        super.hide();
    }
}
