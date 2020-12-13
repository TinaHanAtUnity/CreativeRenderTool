import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { Localization } from 'Core/Utilities/Localization';
import { Template } from 'Core/Utilities/Template';
import VideoOverlayTemplate from 'html/VideoOverlay.html';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
export class VideoOverlay extends AbstractVideoOverlay {
    constructor(parameters, privacy, showGDPRBanner, showPrivacyDuringVideo, attachTap) {
        super(parameters.platform, 'video-overlay', parameters.placement.muteVideo(), attachTap);
        this._spinnerEnabled = false;
        this._videoDurationEnabled = false;
        this._muteEnabled = false;
        this._showPrivacyDuringVideo = false;
        this._debugMessageVisible = false;
        this._callButtonVisible = false;
        this._callButtonEnabled = true;
        this._areControlsVisible = false;
        this._useCloseIconInsteadOfSkipIcon = false;
        this._disableFadeOutOnClick = false;
        this._ads = parameters.ads;
        this._localization = new Localization(parameters.deviceInfo.getLanguage(), 'overlay');
        this._gameId = parameters.clientInfo.getGameId();
        this._template = new Template(VideoOverlayTemplate, this._localization);
        this._country = parameters.coreConfig.getCountry();
        this._campaign = parameters.campaign;
        this._showGDPRBanner = showGDPRBanner;
        this._showPrivacyDuringVideo = showPrivacyDuringVideo;
        this._useCloseIconInsteadOfSkipIcon = parameters.placement.useCloseIconInsteadOfSkipIcon();
        //Disable click fadeout for placements that disabled overlay fadeout for Mobilityware
        this._disableFadeOutOnClick = CustomFeatures.shouldVideoOverlayRemainVisible(parameters.coreConfig.getOrganizationId()) && parameters.placement.disableVideoControlsFade();
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
                listener: (event) => this.onSkipEvent(event),
                selector: '.skip-button'
            },
            {
                event: 'click',
                listener: (event) => this.onMuteEvent(event),
                selector: '.mute-button'
            },
            {
                event: 'click',
                listener: (event) => this.onCallButtonEvent(event),
                selector: '.call-button'
            },
            {
                event: 'click',
                listener: (event) => this.onPauseForTestingEvent(event),
                selector: '.debug-message-text'
            },
            {
                event: 'click',
                listener: (event) => this.onClick(event)
            },
            {
                event: 'click',
                listener: (event) => this.onGDPRPopupEvent(event),
                selector: '.gdpr-link'
            },
            {
                event: 'click',
                listener: (event) => this.onPrivacyEvent(event),
                selector: '.gdpr-button'
            }
        ];
        if (CustomFeatures.isTimehopApp(this._gameId)) {
            this._bindings.push({
                event: 'swipe',
                listener: (event) => this.onSkipEvent(event)
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
    hide() {
        super.hide();
        this.cleanUpPrivacy();
        if (this._showGDPRBanner) {
            this._handlers.forEach(handler => handler.onGDPRPopupSkipped());
        }
    }
    render() {
        super.render();
        this.setupElementReferences();
        this.choosePrivacyShown();
        if (this._country === 'CN' && this._chinaAdvertisementElement) {
            this._chinaAdvertisementElement.style.display = 'block';
        }
        if (CustomFeatures.isCloseIconSkipEnabled(this._gameId) || this._useCloseIconInsteadOfSkipIcon) {
            this._skipButtonElement.classList.add('close-icon-skip');
        }
    }
    setSpinnerEnabled(value) {
        if (this._spinnerEnabled !== value) {
            this._spinnerEnabled = value;
            this._spinnerElement.style.display = value ? 'block' : 'none';
        }
    }
    setSkipEnabled(value) {
        if (this._skipEnabled !== value) {
            this._skipEnabled = value;
        }
    }
    setVideoDurationEnabled(value) {
        if (this._videoDurationEnabled !== value) {
            this._videoDurationEnabled = value;
        }
    }
    setVideoProgress(value) {
        if (VideoOverlay.AutoSkip) {
            this._handlers.forEach(handler => handler.onOverlaySkip(value));
        }
        if (this._fadeEnabled && !this._fadeTimer && (!this._skipEnabled || this._skipRemaining <= 0)) {
            this._fadeTimer = window.setTimeout(() => {
                this.fadeOut();
                this._fadeTimer = undefined;
            }, 3000);
        }
        this._videoProgress = value;
        this._skipRemaining = this._skipDuration - this._videoProgress;
        const timerCount = Math.ceil((this._videoDuration - this._videoProgress) / 1000);
        if (typeof timerCount === 'number' && !isNaN(timerCount) && timerCount > 0) {
            this._timerElement.innerText = timerCount.toString();
        }
        if (this._skipRemaining <= 0) {
            this.showSkipButton();
            this._chinaAdvertisementElement.classList.add('with-skip-button');
        }
        if (!this._skipEnabled && this._videoProgress > 5000) {
            this.showCTAButton();
            return;
        }
    }
    showCTAButton() {
        if (this._campaign instanceof PerformanceCampaign || this._campaign instanceof XPromoCampaign) {
            this.showCallButton();
        }
    }
    setMuteEnabled(value) {
        if (this._muteEnabled !== value) {
            this._muteEnabled = value;
            this._muteButtonElement.style.display = value ? 'block' : 'none';
        }
    }
    setDebugMessage(value) {
        this._debugMessageElement.innerHTML = value;
    }
    setDebugMessageVisible(value) {
        if (this._debugMessageVisible !== value) {
            this._debugMessageElement.style.display = value ? 'block' : 'none';
        }
    }
    setCallButtonVisible(value) {
        if (this._callButtonVisible !== value) {
            this._callButtonElement.style.display = value ? 'block' : 'none';
        }
    }
    setCallButtonEnabled(value) {
        if (this._callButtonEnabled !== value) {
            this._callButtonEnabled = value;
        }
    }
    isMuted() {
        return this._muted;
    }
    onPrivacyClose() {
        if (this._privacy) {
            this._privacy.hide();
        }
        this._isPrivacyShowing = false;
        this._ads.VideoPlayer.play();
    }
    choosePrivacyShown() {
        if (!this._showPrivacyDuringVideo) {
            this._container.classList.remove('show-gdpr-banner');
            this._container.classList.remove('show-gdpr-button');
        }
        else if (this._showGDPRBanner) {
            this._container.classList.add('show-gdpr-banner');
            this._container.classList.remove('show-gdpr-button');
        }
        else {
            this._container.classList.remove('show-gdpr-banner');
            this._container.classList.add('show-gdpr-button');
        }
    }
    onGDPRPopupEvent(event) {
        this._showGDPRBanner = false;
        this.choosePrivacyShown();
        this.onPrivacyEvent(event);
    }
    onPrivacyEvent(event) {
        this._isPrivacyShowing = true;
        event.preventDefault();
        event.stopPropagation();
        this._ads.VideoPlayer.pause();
        if (this._privacy) {
            this._privacy.show();
        }
    }
    onSkipEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this._skipEnabled && this._videoProgress > this._skipDuration) {
            this._handlers.forEach(handler => handler.onOverlaySkip(this._videoProgress));
        }
    }
    onMuteEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        this.resetFadeTimer();
        if (this._muted) {
            this._muteButtonElement.classList.remove('muted');
            this._muted = false;
        }
        else {
            this._muteButtonElement.classList.add('muted');
            this._muted = true;
        }
        this._handlers.forEach(handler => handler.onOverlayMute(this._muted));
    }
    onCallButtonEvent(event) {
        if (!this._callButtonEnabled) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.resetFadeTimer();
        this._handlers.forEach(handler => handler.onOverlayCallButton());
        this.triggerOnOverlayDownload();
    }
    triggerOnOverlayDownload() {
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
                        videoDuration: this._videoDuration,
                        videoProgress: this._videoProgress,
                        appDownloadUrl: campaign instanceof PerformanceCampaign ? campaign.getAppDownloadUrl() : undefined,
                        skipEnabled: this._skipEnabled
                    });
                }
            });
        }
    }
    onPauseForTestingEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        this.resetFadeTimer();
        this._handlers.forEach(handler => handler.onOverlayPauseForTesting(true));
    }
    onClick(event) {
        if (this._disableFadeOutOnClick) {
            return;
        }
        this.resetFadeTimer();
        if (this._areControlsVisible) {
            this.fadeOut();
        }
        else {
            this.fadeIn();
        }
    }
    setupElementReferences() {
        this._skipButtonElement = this._container.querySelector('.skip-button');
        this._spinnerElement = this._container.querySelector('.buffering-spinner');
        this._muteButtonElement = this._container.querySelector('.mute-button');
        this._debugMessageElement = this._container.querySelector('.debug-message-text');
        this._callButtonElement = this._container.querySelector('.call-button');
        this._timerElement = this._container.querySelector('.timer');
        this._chinaAdvertisementElement = this._container.querySelector('.china-advertisement');
    }
    showSkipButton() {
        if (this._skipEnabled) {
            this._skipButtonElement.classList.add('show-skip-button');
            this.showCTAButton();
        }
    }
    resetFadeTimer() {
        if (this._fadeTimer) {
            clearTimeout(this._fadeTimer);
            this._fadeTimer = undefined;
        }
    }
    showCallButton() {
        this._callButtonElement.classList.add('show-call-button');
        this._callButtonElement.classList.add('show-go-text');
    }
    fadeIn() {
        if (!this._container) {
            return;
        }
        this._container.classList.add('fade-in');
        this._areControlsVisible = true;
        if (this._campaign instanceof PerformanceCampaign || this._campaign instanceof XPromoCampaign) {
            return;
        }
        setTimeout(() => {
            this.showCallButton();
        }, 500);
    }
    fadeOut() {
        this._container.classList.remove('fade-in');
        this._areControlsVisible = false;
    }
    cleanUpPrivacy() {
        if (this._privacy) {
            this._privacy.hide();
            const container = this._privacy.container();
            if (container && container.parentElement) {
                container.parentElement.removeChild(container);
            }
            delete this._privacy;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlkZW9PdmVybGF5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9WaWV3cy9WaWRlb092ZXJsYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTlELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRXRFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxvQkFBb0IsTUFBTSx3QkFBd0IsQ0FBQztBQUUxRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUs3RSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFZOUQsTUFBTSxPQUFPLFlBQWEsU0FBUSxvQkFBb0I7SUF3Q2xELFlBQVksVUFBNkMsRUFBRSxPQUF3QixFQUFFLGNBQXVCLEVBQUUsc0JBQStCLEVBQUUsU0FBK0I7UUFDMUssS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsZUFBZSxFQUFFLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFqQ3JGLG9CQUFlLEdBQVksS0FBSyxDQUFDO1FBSWpDLDBCQUFxQixHQUFZLEtBQUssQ0FBQztRQUd2QyxpQkFBWSxHQUFZLEtBQUssQ0FBQztRQUM5Qiw0QkFBdUIsR0FBWSxLQUFLLENBQUM7UUFFekMseUJBQW9CLEdBQVksS0FBSyxDQUFDO1FBQ3BDLHVCQUFrQixHQUFZLEtBQUssQ0FBQztRQUN0Qyx1QkFBa0IsR0FBWSxJQUFJLENBQUM7UUFXbkMsd0JBQW1CLEdBQVksS0FBSyxDQUFDO1FBTXJDLG1DQUE4QixHQUF3QixLQUFLLENBQUM7UUFDNUQsMkJBQXNCLEdBQXdCLEtBQUssQ0FBQztRQUt4RCxJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUM7UUFDM0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLFlBQVksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3RGLElBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNqRCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksUUFBUSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbkQsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1FBQ3RDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxzQkFBc0IsQ0FBQztRQUN0RCxJQUFJLENBQUMsOEJBQThCLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO1FBRTNGLHFGQUFxRjtRQUNyRixJQUFJLENBQUMsc0JBQXNCLEdBQUcsY0FBYyxDQUFDLCtCQUErQixDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUUzSyxJQUFJLENBQUMsYUFBYSxHQUFHO1lBQ2pCLEtBQUssRUFBRSxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRTtTQUMxQyxDQUFDO1FBRUYsSUFBSSxJQUFJLENBQUMsU0FBUyxZQUFZLG1CQUFtQixJQUFJLElBQUksQ0FBQyxTQUFTLFlBQVksY0FBYyxFQUFFO1lBQzNGLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1lBQzVDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztTQUMzRztRQUVELElBQUksQ0FBQyxTQUFTLEdBQUc7WUFDYjtnQkFDSSxLQUFLLEVBQUUsT0FBTztnQkFDZCxRQUFRLEVBQUUsQ0FBQyxLQUFZLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO2dCQUNuRCxRQUFRLEVBQUUsY0FBYzthQUMzQjtZQUNEO2dCQUNJLEtBQUssRUFBRSxPQUFPO2dCQUNkLFFBQVEsRUFBRSxDQUFDLEtBQVksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7Z0JBQ25ELFFBQVEsRUFBRSxjQUFjO2FBQzNCO1lBQ0Q7Z0JBQ0ksS0FBSyxFQUFFLE9BQU87Z0JBQ2QsUUFBUSxFQUFFLENBQUMsS0FBWSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO2dCQUN6RCxRQUFRLEVBQUUsY0FBYzthQUMzQjtZQUNEO2dCQUNJLEtBQUssRUFBRSxPQUFPO2dCQUNkLFFBQVEsRUFBRSxDQUFDLEtBQVksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztnQkFDOUQsUUFBUSxFQUFFLHFCQUFxQjthQUNsQztZQUNEO2dCQUNJLEtBQUssRUFBRSxPQUFPO2dCQUNkLFFBQVEsRUFBRSxDQUFDLEtBQVksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7YUFDbEQ7WUFDRDtnQkFDSSxLQUFLLEVBQUUsT0FBTztnQkFDZCxRQUFRLEVBQUUsQ0FBQyxLQUFZLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7Z0JBQ3hELFFBQVEsRUFBRSxZQUFZO2FBQ3pCO1lBQ0Q7Z0JBQ0ksS0FBSyxFQUFFLE9BQU87Z0JBQ2QsUUFBUSxFQUFFLENBQUMsS0FBWSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztnQkFDdEQsUUFBUSxFQUFFLGNBQWM7YUFDM0I7U0FDSixDQUFDO1FBRUYsSUFBSSxjQUFjLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUMzQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztnQkFDaEIsS0FBSyxFQUFFLE9BQU87Z0JBQ2QsUUFBUSxFQUFFLENBQUMsS0FBWSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQzthQUN0RCxDQUFDLENBQUM7U0FDTjtRQUVELElBQUksc0JBQXNCLEVBQUU7WUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7WUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3JCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QztRQUVELFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDWixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbEIsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVNLElBQUk7UUFDUCxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFdEIsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQztTQUNuRTtJQUNMLENBQUM7SUFFTSxNQUFNO1FBQ1QsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFFMUIsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsMEJBQTBCLEVBQUU7WUFDM0QsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1NBQzNEO1FBRUQsSUFBSSxjQUFjLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyw4QkFBOEIsRUFBRTtZQUM1RixJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1NBQzVEO0lBQ0wsQ0FBQztJQUVNLGlCQUFpQixDQUFDLEtBQWM7UUFDbkMsSUFBSSxJQUFJLENBQUMsZUFBZSxLQUFLLEtBQUssRUFBRTtZQUNoQyxJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztZQUM3QixJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztTQUNqRTtJQUNMLENBQUM7SUFFTSxjQUFjLENBQUMsS0FBYztRQUNoQyxJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssS0FBSyxFQUFFO1lBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1NBQzdCO0lBQ0wsQ0FBQztJQUVNLHVCQUF1QixDQUFDLEtBQWM7UUFDekMsSUFBSSxJQUFJLENBQUMscUJBQXFCLEtBQUssS0FBSyxFQUFFO1lBQ3RDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUM7U0FDdEM7SUFDTCxDQUFDO0lBRU0sZ0JBQWdCLENBQUMsS0FBYTtRQUNqQyxJQUFJLFlBQVksQ0FBQyxRQUFRLEVBQUU7WUFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDbkU7UUFFRCxJQUFJLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxjQUFjLElBQUksQ0FBQyxDQUFDLEVBQUU7WUFDM0YsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDckMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNmLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1lBQ2hDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNaO1FBRUQsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7UUFDNUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7UUFFL0QsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBRWpGLElBQUksT0FBTyxVQUFVLEtBQUssUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLFVBQVUsR0FBRyxDQUFDLEVBQUU7WUFDeEUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ3hEO1FBRUQsSUFBSSxJQUFJLENBQUMsY0FBYyxJQUFJLENBQUMsRUFBRTtZQUMxQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztTQUNyRTtRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxFQUFFO1lBQ2xELElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNyQixPQUFPO1NBQ1Y7SUFDTCxDQUFDO0lBRVMsYUFBYTtRQUNuQixJQUFJLElBQUksQ0FBQyxTQUFTLFlBQVksbUJBQW1CLElBQUksSUFBSSxDQUFDLFNBQVMsWUFBWSxjQUFjLEVBQUU7WUFDM0YsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ3pCO0lBQ0wsQ0FBQztJQUVNLGNBQWMsQ0FBQyxLQUFjO1FBQ2hDLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxLQUFLLEVBQUU7WUFDN0IsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7WUFDMUIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztTQUNwRTtJQUNMLENBQUM7SUFFTSxlQUFlLENBQUMsS0FBYTtRQUNoQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUNoRCxDQUFDO0lBRU0sc0JBQXNCLENBQUMsS0FBYztRQUN4QyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsS0FBSyxLQUFLLEVBQUU7WUFDckMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztTQUN0RTtJQUNMLENBQUM7SUFFTSxvQkFBb0IsQ0FBQyxLQUFjO1FBQ3RDLElBQUksSUFBSSxDQUFDLGtCQUFrQixLQUFLLEtBQUssRUFBRTtZQUNuQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1NBQ3BFO0lBQ0wsQ0FBQztJQUVNLG9CQUFvQixDQUFDLEtBQWM7UUFDdEMsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEtBQUssS0FBSyxFQUFFO1lBQ25DLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7U0FDbkM7SUFDTCxDQUFDO0lBRU0sT0FBTztRQUNWLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRU0sY0FBYztRQUNqQixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDZixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3hCO1FBQ0QsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztRQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRVMsa0JBQWtCO1FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUU7WUFDL0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7U0FDeEQ7YUFBTSxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDN0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7U0FDeEQ7YUFBTTtZQUNILElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1NBQ3JEO0lBQ0wsQ0FBQztJQUVTLGdCQUFnQixDQUFDLEtBQVk7UUFDbkMsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7UUFDN0IsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRVMsY0FBYyxDQUFDLEtBQVk7UUFDakMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztRQUM5QixLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdkIsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzlCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNmLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDeEI7SUFDTCxDQUFDO0lBRU8sV0FBVyxDQUFDLEtBQVk7UUFDNUIsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3ZCLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4QixJQUFJLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQy9ELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztTQUNqRjtJQUNMLENBQUM7SUFFTyxXQUFXLENBQUMsS0FBWTtRQUM1QixLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdkIsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDYixJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztTQUN2QjthQUFNO1lBQ0gsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7U0FDdEI7UUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVPLGlCQUFpQixDQUFDLEtBQVk7UUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUMxQixPQUFPO1NBQ1Y7UUFDRCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdkIsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVPLHdCQUF3QjtRQUM1QixJQUFJLElBQUksQ0FBQyxTQUFTLFlBQVksbUJBQW1CLElBQUksSUFBSSxDQUFDLFNBQVMsWUFBWSxjQUFjLEVBQUU7WUFDM0YsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUNoQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sT0FBTyxDQUFDLGlCQUFpQixLQUFLLFVBQVUsQ0FBQztpQkFDaEYsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ2pCLElBQUksT0FBTyxPQUFPLENBQUMsaUJBQWlCLEtBQUssVUFBVSxFQUFFO29CQUNqRCxPQUFPLENBQUMsaUJBQWlCLENBQUM7d0JBQ3RCLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRTt3QkFDdEQsbUNBQW1DLEVBQUUsUUFBUSxDQUFDLHNDQUFzQyxFQUFFO3dCQUN0RixjQUFjLEVBQUUsUUFBUSxDQUFDLGlCQUFpQixFQUFFO3dCQUM1QyxVQUFVLEVBQUUsUUFBUSxDQUFDLGFBQWEsRUFBRTt3QkFDcEMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUU7d0JBQzFCLGFBQWEsRUFBRSxJQUFJLENBQUMsY0FBYzt3QkFDbEMsYUFBYSxFQUFFLElBQUksQ0FBQyxjQUFjO3dCQUNsQyxjQUFjLEVBQUUsUUFBUSxZQUFZLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUzt3QkFDbEcsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZO3FCQUNqQyxDQUFDLENBQUM7aUJBQ047WUFDTCxDQUFDLENBQUMsQ0FBQztTQUNOO0lBQ0wsQ0FBQztJQUVPLHNCQUFzQixDQUFDLEtBQVk7UUFDdkMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3ZCLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRU8sT0FBTyxDQUFDLEtBQVk7UUFDeEIsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEVBQUU7WUFDN0IsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXRCLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQzFCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNsQjthQUFNO1lBQ0gsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ2pCO0lBQ0wsQ0FBQztJQUVPLHNCQUFzQjtRQUMxQixJQUFJLENBQUMsa0JBQWtCLEdBQWlCLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3RGLElBQUksQ0FBQyxlQUFlLEdBQWlCLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDekYsSUFBSSxDQUFDLGtCQUFrQixHQUFpQixJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN0RixJQUFJLENBQUMsb0JBQW9CLEdBQWlCLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDL0YsSUFBSSxDQUFDLGtCQUFrQixHQUFpQixJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN0RixJQUFJLENBQUMsYUFBYSxHQUFpQixJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzRSxJQUFJLENBQUMsMEJBQTBCLEdBQW1CLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLHNCQUFzQixDQUFDLENBQUM7SUFDNUcsQ0FBQztJQUVPLGNBQWM7UUFDbEIsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ25CLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1NBQ3hCO0lBQ0wsQ0FBQztJQUVPLGNBQWM7UUFDbEIsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pCLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7U0FDL0I7SUFDTCxDQUFDO0lBRVMsY0FBYztRQUNwQixJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFTyxNQUFNO1FBQ1YsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbEIsT0FBTztTQUNWO1FBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUM7UUFFaEMsSUFBSSxJQUFJLENBQUMsU0FBUyxZQUFZLG1CQUFtQixJQUFJLElBQUksQ0FBQyxTQUFTLFlBQVksY0FBYyxFQUFFO1lBQzNGLE9BQU87U0FDVjtRQUVELFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDWixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDMUIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ1osQ0FBQztJQUVPLE9BQU87UUFDWCxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQztJQUNyQyxDQUFDO0lBRVMsY0FBYztRQUNwQixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDZixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3JCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDNUMsSUFBSSxTQUFTLElBQUksU0FBUyxDQUFDLGFBQWEsRUFBRTtnQkFDdEMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDbEQ7WUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7U0FDeEI7SUFDTCxDQUFDO0NBQ0oifQ==