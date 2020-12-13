import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { AdUnitContainerSystemMessage, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { CampaignAssetInfo, VideoType } from 'Ads/Utilities/CampaignAssetInfo';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { WebViewError } from 'Core/Errors/WebViewError';
import { Double } from 'Core/Utilities/Double';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
export var VideoState;
(function (VideoState) {
    VideoState[VideoState["NOT_READY"] = 0] = "NOT_READY";
    VideoState[VideoState["PREPARING"] = 1] = "PREPARING";
    VideoState[VideoState["READY"] = 2] = "READY";
    VideoState[VideoState["PLAYING"] = 3] = "PLAYING";
    VideoState[VideoState["PAUSED"] = 4] = "PAUSED";
    VideoState[VideoState["COMPLETED"] = 5] = "COMPLETED";
    VideoState[VideoState["SKIPPED"] = 6] = "SKIPPED";
    VideoState[VideoState["ERRORED"] = 7] = "ERRORED";
})(VideoState || (VideoState = {}));
export class VideoAdUnit extends AbstractAdUnit {
    constructor(parameters) {
        super(parameters);
        this._videoState = VideoState.NOT_READY;
        this._video = parameters.video;
        this._videoReady = false;
        this._active = false;
        this._overlay = parameters.overlay;
        this._deviceInfo = parameters.deviceInfo;
        this._options = parameters.options;
        this._prepareCalled = false;
        this._lowMemory = false;
        this._placement = parameters.placement;
        this._campaign = parameters.campaign;
        this._clientInfo = parameters.clientInfo;
        this.prepareOverlay();
    }
    show() {
        this.setShowing(true);
        this.setActive(true);
        this._container.addEventHandler(this);
        return this._container.open(this, ['videoplayer', 'webview'], true, this.getForceOrientation(), this._placement.disableBackButton(), false, true, false, this._options).then(() => {
            this.onStart.trigger();
        });
    }
    hide() {
        if (!this.isShowing()) {
            return Promise.resolve();
        }
        this.setShowing(false);
        this.hideChildren();
        this.unsetReferences();
        const gameId = this._clientInfo.getGameId();
        if (!CustomFeatures.gameSpawnsNewViewControllerOnFinish(gameId)) {
            this._ads.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());
        }
        this._container.removeEventHandler(this);
        return this._container.close().then(() => {
            this.onClose.trigger();
            if (CustomFeatures.gameSpawnsNewViewControllerOnFinish(gameId)) {
                this._ads.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());
            }
        });
    }
    setVideoState(videoState) {
        this._videoState = videoState;
    }
    getVideoState() {
        return this._videoState;
    }
    canShowVideo() {
        return this.getVideoState() !== VideoState.ERRORED && this.getVideoState() !== VideoState.COMPLETED && this.getVideoState() !== VideoState.SKIPPED;
    }
    canPlayVideo() {
        return (this.getVideoState() === VideoState.READY || this.getVideoState() === VideoState.PLAYING || this.getVideoState() === VideoState.PAUSED);
    }
    canPrepareVideo() {
        return this.canShowVideo() && this.getVideoState() === VideoState.NOT_READY;
    }
    getOverlay() {
        return this._overlay;
    }
    getProgressInterval() {
        return VideoAdUnit._progressInterval;
    }
    getVideo() {
        return this._video;
    }
    isActive() {
        return this._active;
    }
    setActive(value) {
        this._active = value;
    }
    getVideoOrientation() {
        let videoOrientation = 'landscape';
        const portraitVideo = CampaignAssetInfo.getPortraitVideo(this._campaign);
        if (portraitVideo && this._finalVideoUrl === portraitVideo.getUrl()) {
            videoOrientation = 'portrait';
        }
        this._core.Sdk.logDebug('Returning ' + videoOrientation + ' as video orientation for locked orientation ' + Orientation[this._container.getLockedOrientation()]);
        return videoOrientation;
    }
    isLowMemory() {
        return this._lowMemory;
    }
    onContainerShow() {
        if (this.isShowing() && this.isActive()) {
            if (this._platform === Platform.IOS && IosUtils.hasVideoStallingApi(this._deviceInfo.getOsVersion())) {
                if (this.getVideo().isCached()) {
                    this._ads.VideoPlayer.setAutomaticallyWaitsToMinimizeStalling(false);
                }
                else {
                    this._ads.VideoPlayer.setAutomaticallyWaitsToMinimizeStalling(true);
                }
            }
            this.prepareVideo();
        }
    }
    onContainerDestroy() {
        if (this.isShowing()) {
            this.setActive(false);
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }
    onContainerBackground() {
        if (this.isShowing() && CustomFeatures.isSimejiJapaneseKeyboardApp(this._clientInfo.getGameId())) {
            this.setActive(false);
            this.setFinishState(FinishState.SKIPPED);
            this.setVideoState(VideoState.SKIPPED);
            this.hide();
            return;
        }
        if (this.isShowing() && this.getContainer().isPaused()) {
            this.setActive(false);
            if (this.canShowVideo()) {
                this.setVideoState(VideoState.PAUSED);
                /*
                    We try pause the video-player and if we get a VIDEOVIEW_NULL error
                    we'll know that the video-player has been destroyed. In this case
                    set the video not ready so that the onContainerForeground can
                    re-prepare the video.
                */
                this._ads.VideoPlayer.pause().catch((error) => {
                    if (error === 'VIDEOVIEW_NULL') {
                        this.setVideoState(VideoState.NOT_READY);
                    }
                });
            }
        }
    }
    isAppSheetOpen() {
        return false;
    }
    onContainerForeground() {
        if (this.isShowing() && !this.isActive() && !this.getContainer().isPaused()) {
            this.setActive(true);
            /*
                Check if we can show the video and if the video is paused.
                In that case call video-player play to continue playing the video.
                If not, check if we are allowed to prepare it. In that case prepare the
                video again. When the video-prepared event is received by the video-event-handler
                it will seek the video to correct position and call play.
            */
            if (!this.isAppSheetOpen() && this.canShowVideo() && this.getVideoState() === VideoState.PAUSED) {
                this.setVideoState(VideoState.PLAYING);
                this._ads.VideoPlayer.play();
            }
            else if (this.canPrepareVideo()) {
                this.prepareVideo();
            }
        }
    }
    onContainerSystemMessage(message) {
        switch (message) {
            case AdUnitContainerSystemMessage.MEMORY_WARNING:
                if (this.isShowing()) {
                    this._lowMemory = true;
                }
                break;
            case AdUnitContainerSystemMessage.AUDIO_SESSION_INTERRUPT_BEGAN:
                if (this.isShowing() && this.isActive() && this.getVideoState() === VideoState.PLAYING) {
                    this.setVideoState(VideoState.PAUSED);
                    this._ads.VideoPlayer.pause();
                }
                break;
            case AdUnitContainerSystemMessage.AUDIO_SESSION_INTERRUPT_ENDED:
            case AdUnitContainerSystemMessage.AUDIO_SESSION_ROUTE_CHANGED:
                if (!this.isAppSheetOpen() && this.isShowing() && this.isActive() && this.canPlayVideo()) {
                    this.setVideoState(VideoState.PLAYING);
                    this._ads.VideoPlayer.play();
                }
                break;
            default:
        }
    }
    getVideoViewRectangle() {
        return this._ads.VideoPlayer.getVideoViewRectangle();
    }
    getDeviceInfo() {
        return this._deviceInfo;
    }
    unsetReferences() {
        delete this._overlay;
    }
    prepareOverlay() {
        const overlay = this.getOverlay();
        if (overlay) {
            overlay.render();
            document.body.appendChild(overlay.container());
            if (!this._placement.allowSkip()) {
                overlay.setSkipEnabled(false);
            }
            else {
                overlay.setSkipEnabled(true);
                overlay.setSkipDuration(this._placement.allowSkipInSeconds());
            }
        }
    }
    hideChildren() {
        const overlay = this.getOverlay();
        if (overlay) {
            overlay.hide();
            const container = overlay.container();
            if (container && container.parentElement) {
                container.parentElement.removeChild(container);
            }
        }
    }
    prepareVideo() {
        this.setVideoState(VideoState.PREPARING);
        this.getValidVideoUrl().then(url => {
            this._finalVideoUrl = url;
            this._ads.VideoPlayer.prepare(url, new Double(this._placement.muteVideo() ? 0 : 1), 10000);
        });
    }
    // todo: this is first attempt to get rid of around 1% of failed starts
    // if this approach is successful, this should somehow be refactored as part of AssetManager to validate
    // other things too, like endscreen assets
    getValidVideoUrl() {
        let streamingUrl = this.getVideo().getOriginalUrl();
        if (this._campaign instanceof PerformanceCampaign || this._campaign instanceof XPromoCampaign) {
            // Should this use this._container.getLockedOrientation() instead?
            const orientedStreamingVideo = CampaignAssetInfo.getOrientedVideo(this._campaign, this.getForceOrientation(), VideoType.STREAM);
            if (!orientedStreamingVideo) {
                throw new WebViewError('Unable to fallback to an oriented streaming video');
            }
            streamingUrl = orientedStreamingVideo.getOriginalUrl();
        }
        // check that if we think video has been cached, it is still available on device cache directory
        return Promise.resolve().then(() => {
            if (this.getVideo().isCached() && this.getVideo().getFileId()) {
                return this._core.Cache.getFileInfo(this.getVideo().getFileId()).then(result => {
                    if (result.found) {
                        const remoteVideoSize = this.getVideo().getSize();
                        if (remoteVideoSize && remoteVideoSize !== result.size) {
                            SessionDiagnostics.trigger('video_size_mismatch', {
                                remoteVideoSize: remoteVideoSize,
                                localVideoSize: result.size,
                                creativeId: this.getVideo().getCreativeId()
                            }, this._campaign.getSession());
                            // this condition is most commonly triggered on Android that probably has some unknown issue with resuming downloads
                            // if comet has given video size that does not match local file size, use streaming fallback
                            return streamingUrl;
                        }
                        return this.getVideo().getUrl();
                    }
                    else {
                        SessionDiagnostics.trigger('cached_file_not_found', new DiagnosticError(new Error('File not found'), {
                            url: this.getVideo().getUrl(),
                            originalUrl: this.getVideo().getOriginalUrl(),
                            campaignId: this._campaign.getId()
                        }), this._campaign.getSession());
                        // Modify asset cached status to false
                        this.getVideo().setCachedUrl(undefined);
                        // cached file not found (deleted by the system?), use streaming fallback
                        return streamingUrl;
                    }
                }).catch(error => {
                    SessionDiagnostics.trigger('cached_file_not_found', new DiagnosticError(new Error(error), {
                        url: this.getVideo().getUrl(),
                        originalUrl: this.getVideo().getOriginalUrl(),
                        campaignId: this._campaign.getId()
                    }), this._campaign.getSession());
                    // Modify asset cached status to false
                    this.getVideo().setCachedUrl(undefined);
                    // cached file not found (deleted by the system?), use streaming fallback
                    return streamingUrl;
                });
            }
            else {
                return this.getVideo().getUrl();
            }
        });
    }
}
VideoAdUnit._progressInterval = 250;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlkZW9BZFVuaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL0FkVW5pdHMvVmlkZW9BZFVuaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBcUIsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRSxPQUFPLEVBQ0gsNEJBQTRCLEVBRTVCLFdBQVcsRUFDZCxNQUFNLHdDQUF3QyxDQUFDO0FBSWhELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUMvRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2xELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBRXRFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzlELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUd4RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDL0MsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDN0UsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBTzlELE1BQU0sQ0FBTixJQUFZLFVBU1g7QUFURCxXQUFZLFVBQVU7SUFDbEIscURBQVMsQ0FBQTtJQUNULHFEQUFTLENBQUE7SUFDVCw2Q0FBSyxDQUFBO0lBQ0wsaURBQU8sQ0FBQTtJQUNQLCtDQUFNLENBQUE7SUFDTixxREFBUyxDQUFBO0lBQ1QsaURBQU8sQ0FBQTtJQUNQLGlEQUFPLENBQUE7QUFD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