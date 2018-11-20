import { IAdsApi } from 'Ads/IAds';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AbstractPrivacy, IPrivacyHandler } from 'Ads/Views/AbstractPrivacy';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { Platform } from 'Core/Constants/Platform';
import { Localization } from 'Core/Utilities/Localization';
import { Template } from 'Core/Utilities/Template';

import NewVideoOverlayTemplate from 'html/NewVideoOverlay.html';
import { ABGroup, NextSkipIconTest } from 'Core/Models/ABGroup';
import { Campaign } from 'Ads/Models/Campaign';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { Placement } from 'Ads/Models/Placement';
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

export class NewVideoOverlay extends AbstractVideoOverlay implements IPrivacyHandler {

    private _ads: IAdsApi;
    private _localization: Localization;

    private _spinnerEnabled: boolean = false;

    private _skipEnabled: boolean;

    private _videoDurationEnabled: boolean = false;
    private _videoProgress: number;

    private _muteEnabled: boolean = false;

    private _debugMessageVisible: boolean = false;
    private _callButtonVisible: boolean = false;
    private _callButtonEnabled: boolean = true;

    private _skipButtonElement: HTMLElement;
    private _spinnerElement: HTMLElement;
    private _muteButtonElement: HTMLElement;
    private _debugMessageElement: HTMLElement;
    private _callButtonElement: HTMLElement;
    private _timerElement: HTMLElement;

    private _fadeTimer: any;
    private _areControlsVisible: boolean = false;
    private _privacy: AbstractPrivacy;
    private _gdprPopupClicked: boolean = false;
    private _showGDPRBanner: boolean = false;
    private _showPrivacyDuringVideo: boolean | undefined;
    private _gameId: string;
    private _seatId: number | undefined;
    private _abGroup: ABGroup;
    private _campaign: Campaign;

    constructor(parameters: IVideoOverlayParameters<Campaign>, privacy: AbstractPrivacy, showGDPRBanner: boolean, showPrivacyDuringVideo?: boolean) {
        super(parameters.platform, 'new-video-overlay', parameters.placement.muteVideo());

        this._ads = parameters.ads;
        this._localization = new Localization(parameters.deviceInfo.getLanguage(), 'overlay');
        this._showGDPRBanner = showGDPRBanner;
        this._showPrivacyDuringVideo = showPrivacyDuringVideo;
        this._gameId = parameters.clientInfo.getGameId();
        this._template = new Template(NewVideoOverlayTemplate, this._localization);
        this._seatId = parameters.campaign.getSeatId();
        this._abGroup = parameters.coreConfig.getAbGroup();
        this._campaign = parameters.campaign;
        this._templateData = {
            muted: parameters.placement.muteVideo()
        };

        if (this._campaign instanceof PerformanceCampaign || this._campaign instanceof XPromoCampaign) {
            this._templateData.showInstallButton = true;
            this._templateData.gameIcon = this._campaign.getGameIcon() ? this._campaign.getGameIcon().getUrl() : '';
        }

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
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPauseForTestingEvent(event),
                selector: '.debug-message-text'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onClick(event)
            },
            {
                event: 'click',
                listener: (event: Event) => this.onGDPRPopupEvent(event),
                selector: '.gdpr-link'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: '.gdpr-button'
            }
        ];

        if (CustomFeatures.isTimehopApp(this._gameId)) {
            this._bindings.push({
                event: 'swipe',
                listener: (event: Event) => this.onSkipEvent(event)
            });
        }

        if (showPrivacyDuringVideo) {
            this._privacy = privacy;
            this._privacy.render();
            this._privacy.hide();
            document.body.appendChild(this._privacy.container());
            this._privacy.addEventHandler(this);
        }

        setTimeout(() => {
            this.fadeIn();
        }, 1000);
    }

    public hide() {
        super.hide();

        if (this._privacy) {
            this._privacy.hide();
            document.body.removeChild(this._privacy.container());
            delete this._privacy;
        }

        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._handlers.forEach(handler => handler.onGDPRPopupSkipped());
        }
    }

    public render(): void {
        super.render();
        this.setupElementReferences();
        this.choosePrivacyShown();

        if (CustomFeatures.isTencentAdvertisement(this._seatId)) {
            const tencentAdTag = <HTMLElement>this._container.querySelector('.tencent-advertisement');
            if (tencentAdTag) {
                tencentAdTag.innerText = '广告';
            }
        }

        if (CustomFeatures.isCheetahGame(this._gameId)) {
            this._skipButtonElement.classList.add('close-icon-skip');
        } else if (NextSkipIconTest.isValid(this._abGroup)) {
            this._skipButtonElement.classList.add('next-icon-skip');
        }
    }

    public setSpinnerEnabled(value: boolean): void {
        if (this._spinnerEnabled !== value) {
            this._spinnerEnabled = value;
            this._spinnerElement.style.display = value ? 'block' : 'none';
        }
    }

    public setSkipEnabled(value: boolean): void {
        if (this._skipEnabled !== value) {
            this._skipEnabled = value;
        }
    }

    public setVideoDurationEnabled(value: boolean) {
        if (this._videoDurationEnabled !== value) {
            this._videoDurationEnabled = value;
        }
    }

    public setVideoProgress(value: number): void {
        if (NewVideoOverlay.AutoSkip) {
            this._handlers.forEach(handler => handler.onOverlaySkip(value));
        }

        if (this._fadeEnabled && !this._fadeTimer && (!this._skipEnabled || this._skipRemaining <= 0)) {
            this._fadeTimer = setTimeout(() => {
                this.fadeOut();
                this._fadeTimer = undefined;
            }, 3000);
        }

        this._videoProgress = value;
        this._skipRemaining = this._skipDuration - this._videoProgress;
        const timerCount = Math.ceil((this._videoDuration - this._videoProgress) / 1000);
        if (typeof timerCount === 'number' && !isNaN(timerCount)) {
            this._timerElement.innerText = timerCount.toString();
        }

        if (this._skipRemaining <= 0) {
            this.showSkipButton();
        }
    }

    public setMuteEnabled(value: boolean) {
        if (this._muteEnabled !== value) {
            this._muteEnabled = value;
            this._muteButtonElement.style.display = value ? 'block' : 'none';
        }
    }

    public setDebugMessage(value: string): void {
        this._debugMessageElement.innerHTML = value;
    }

    public setDebugMessageVisible(value: boolean) {
        if (this._debugMessageVisible !== value) {
            this._debugMessageElement.style.display = value ? 'block' : 'none';
        }
    }

    public setCallButtonVisible(value: boolean) {
        if ((this._campaign instanceof XPromoCampaign || this._campaign instanceof PerformanceCampaign) && !this._skipEnabled) {
            return;
        }

        if (this._callButtonVisible !== value) {
            this._callButtonElement.style.display = value ? 'block' : 'none';
        }
    }

    public setCallButtonEnabled(value: boolean) {
        if (this._callButtonEnabled !== value) {
            this._callButtonEnabled = value;
        }
    }

    public isMuted(): boolean {
        return this._muted;
    }

    public onPrivacy(url: string): void {
        // do nothing
    }

    public onPrivacyClose(): void {
        if (this._privacy) {
            this._privacy.hide();
        }
        this._isPrivacyShowing = false;
        this._ads.VideoPlayer.play();
    }

    public onGDPROptOut(optOutEnabled: boolean): void {
        // do nothing
    }

    public choosePrivacyShown(): void {
        if (!this._showPrivacyDuringVideo) {
            this._container.classList.remove('show-gdpr-banner');
            this._container.classList.remove('show-gdpr-button');
        } else if (!this._gdprPopupClicked && this._showGDPRBanner) {
            this._container.classList.add('show-gdpr-banner');
            this._container.classList.remove('show-gdpr-button');
        } else {
            this._container.classList.remove('show-gdpr-banner');
            this._container.classList.add('show-gdpr-button');
        }
    }

    private onGDPRPopupEvent(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this._isPrivacyShowing = true;
        if (!this._gdprPopupClicked) {
            this._gdprPopupClicked = true;
            this.choosePrivacyShown();
        }
        this._ads.VideoPlayer.pause();
        if (this._privacy) {
            this._privacy.show();
        }
    }

    private onPrivacyEvent(event: Event) {
        this._isPrivacyShowing = true;
        event.preventDefault();
        event.stopPropagation();
        this._ads.VideoPlayer.pause();
        if (this._privacy) {
            this._privacy.show();
        }
    }

    private onSkipEvent(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        if (this._skipEnabled && this._videoProgress > this._skipDuration) {
            this._handlers.forEach(handler => handler.onOverlaySkip(this._videoProgress));
        }
    }

    private onMuteEvent(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.resetFadeTimer();
        if (this._muted) {
            this._muteButtonElement.classList.remove('muted');
            this._muted = false;
        } else {
            this._muteButtonElement.classList.add('muted');
            this._muted = true;
        }
        this._handlers.forEach(handler => handler.onOverlayMute(this._muted));
    }

    private onCallButtonEvent(event: Event): void {
        if (!this._callButtonEnabled) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.resetFadeTimer();
        this._handlers.forEach(handler => handler.onOverlayCallButton());

        if (this._campaign instanceof PerformanceCampaign || this._campaign instanceof XPromoCampaign) {
            const campaign = this._campaign;
            this._handlers.filter(handler => typeof handler.onOverlayDownload === 'function')
            .forEach((handler) => {
                if (typeof handler.onOverlayDownload === 'function') {
                    handler.onOverlayDownload({
                        clickAttributionUrl: campaign.getClickAttributionUrl(),
                        clickAttributionUrlFollowsRedirects: campaign.getClickAttributionUrlFollowsRedirects(),
                        bypassAppSheet: campaign.getBypassAppSheet(),
                        appStoreId: campaign.getAppStoreId(),
                        store: campaign.getStore(),
                        videoProgress: this._videoProgress
                    });
                }
            });
        }
    }

    private onPauseForTestingEvent(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.resetFadeTimer();
        this._handlers.forEach(handler => handler.onOverlayPauseForTesting(true));
    }

    private onClick(event: Event) {
        this.resetFadeTimer();

        if (this._areControlsVisible) {
            this.fadeOut();
        } else {
            this.fadeIn();
        }
    }

    private setupElementReferences(): void {
        this._skipButtonElement = <HTMLElement>this._container.querySelector('.skip-button');
        this._spinnerElement = <HTMLElement>this._container.querySelector('.buffering-spinner');
        this._muteButtonElement = <HTMLElement>this._container.querySelector('.mute-button');
        this._debugMessageElement = <HTMLElement>this._container.querySelector('.debug-message-text');
        this._callButtonElement = <HTMLElement>this._container.querySelector('.call-button');
        this._timerElement = <HTMLElement>this._container.querySelector('.timer');
    }

    private showSkipButton() {
        if (this._skipEnabled) {
            this._skipButtonElement.classList.add('show-skip-button');
            if (this._campaign instanceof PerformanceCampaign || this._campaign instanceof XPromoCampaign) {
                this.showCallButton();
            }
        }
    }

    private resetFadeTimer() {
        if (this._fadeTimer) {
            clearTimeout(this._fadeTimer);
            this._fadeTimer = undefined;
        }
    }

    private showCallButton() {
        if (!this._areControlsVisible) {
            return;
        }
        this._callButtonElement.classList.add('show-call-button');
        this._callButtonElement.classList.add('show-go-text');
    }

    private fadeIn() {
        this._container.classList.add('fade-in');
        this._areControlsVisible = true;
    }

    private fadeOut() {
        this._container.classList.remove('fade-in');
        this._areControlsVisible = false;
    }
}
