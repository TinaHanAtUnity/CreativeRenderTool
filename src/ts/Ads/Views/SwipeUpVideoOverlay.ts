import { VideoOverlay } from "./VideoOverlay";
import { IExperimentActionChoice } from "Ads/Models/AutomatedExperiment";
import { Platform } from "Core/Constants/Platform";
import { IAdsApi } from "Ads/IAds";
import { DeviceInfo } from "Core/Models/DeviceInfo";
import { ClientInfo } from "Core/Models/ClientInfo";
import { CoreConfiguration } from "Core/Models/CoreConfiguration";
import { Placement } from "Ads/Models/Placement";
import { Campaign } from "Ads/Models/Campaign";
import { VideoOverlayDownloadExperiment, VideoOverlayDownloadExperimentDeclaration } from "Ads/Models/AutomatedExperimentsList";
import { AUIMetric, SDKMetrics } from "Ads/Utilities/SDKMetrics";
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

    constructor(parameters: IVideoOverlayParameters<Campaign>, privacy: AbstractPrivacy, showGDPRBanner: boolean, showPrivacyDuringVideo: boolean, combination: IExperimentActionChoice) {
        super(parameters, privacy, showGDPRBanner, showPrivacyDuringVideo);

        if (!VideoOverlayDownloadExperiment.isValid(combination)) {
            combination = VideoOverlayDownloadExperiment.getDefaultActions();
            SDKMetrics.reportMetricEvent(AUIMetric.InvalidVideoOverlayMode);
        };

        switch (combination.mode) {
            case VideoOverlayDownloadExperimentDeclaration.mode.SWIPEUP:
                this._ctaMode = "swipeup";
                this.showSwipeUpZoneContainer();
                break;
            case VideoOverlayDownloadExperimentDeclaration.mode.CLICK:
                this._ctaMode = "click";
                break;
        };

        this._bindings.push({
            event: 'swipeup',
            listener: (event: Event) => this.onSwipeUpEvent(event),
            selector: '.swipe-up-zone'
        })

    };

    protected handleVideoProgressButton() {
        const isPerformanceCampaign = this._campaign instanceof PerformanceCampaign || this._campaign instanceof XPromoCampaign;
        if (isPerformanceCampaign && !this._skipEnabled && this._videoProgress > 5000) {
            //this is for traditional install button sliding in from the right
            if (this._ctaMode === 'click') {
                this.showCallButton();
            } else if (this._ctaMode === 'swipeup') {
                this.showSwipeUpButton(); //this is for swipe up 'button'
            }
            return;
        }
    }

    protected showSkipButton() {
        if (this._skipEnabled) {
            this._skipButtonElement.classList.add('show-skip-button');
            if (this._campaign instanceof PerformanceCampaign || this._campaign instanceof XPromoCampaign) {
                if (this._ctaMode === 'click') {
                    this.showCallButton();  //this is for traditional install button sliding from the right
                } else if (this._ctaMode === 'swipeup') {
                    this.showSwipeUpButton(); //this is for swipe up 'button'
                }
            }
        }
    }

    protected handleFadeInButton() {
        if (this._ctaMode === 'click') {
            setTimeout(() => {
                this.showCallButton();
            }, 500);
        } 
        //this is for swipe up 'button'
        else if (this._ctaMode === 'swipeup') {
            setTimeout(() => {
                this.showSwipeUpButton();
            }, 500);
        }
    }
};
