import { VideoState } from 'Ads/AdUnits/VideoAdUnit';
import { BaseVideoEventHandler } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { VideoFileInfo } from 'Ads/Utilities/VideoFileInfo';
import { FinishState } from 'Core/Constants/FinishState';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { Double } from 'Core/Utilities/Double';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { CreativeBlocking, BlockingReason } from 'Core/Utilities/CreativeBlocking';
import { VideoMetric } from 'Ads/Utilities/SDKMetrics';
export class VideoEventHandler extends BaseVideoEventHandler {
    constructor(params) {
        super(params);
        this._operativeEventManager = params.operativeEventManager;
        this._thirdPartyEventManager = params.thirdPartyEventManager;
        this._coreConfig = params.coreConfig;
        this._adsConfig = params.adsConfig;
        this._placement = params.placement;
        this._adUnitStyle = params.adUnitStyle;
        this._video = params.video;
    }
    onProgress(progress) {
        const overlay = this._adUnit.getOverlay();
        if (progress > 0 && this._adUnit.getVideoState() === VideoState.READY) {
            this._adUnit.setVideoState(VideoState.PLAYING);
            if (overlay) {
                overlay.setSpinnerEnabled(false);
            }
        }
        if (progress > 0 && !this._video.hasStarted()) {
            this._video.setStarted(true);
            this.handleStartEvent(progress);
        }
        if (progress >= 0) {
            const lastPosition = this._video.getPosition();
            // consider all leaps more than one million milliseconds (slightly more than 2,5 hours)
            // bugs in native videoplayer that should be ignored, these have been seen in some Android 7 devices
            const ignoreTreshold = lastPosition + 1000000;
            if (progress > ignoreTreshold) {
                this._core.Sdk.logError('Unity Ads video player ignoring too large progress from ' + lastPosition + ' to ' + progress);
                const error = new DiagnosticError(new Error('Too large progress in video player'), {
                    position: progress,
                    lastPosition: lastPosition,
                    duration: this._video.getDuration()
                });
                SessionDiagnostics.trigger('video_player_too_large_progress', error, this._campaign.getSession());
                return;
            }
            if (progress === lastPosition) {
                const repeats = this._video.getPositionRepeats();
                const repeatThreshold = 5000 / this._adUnit.getProgressInterval();
                // if video player has been repeating the same video position for more than 5000 milliseconds, video player is stuck
                if (repeats > repeatThreshold) {
                    this._core.Sdk.logError('Unity Ads video player stuck to ' + progress + 'ms position');
                    this.handleVideoError(VideoMetric.PlayerStuck);
                }
                else {
                    this._video.setPositionRepeats(repeats + 1);
                }
            }
            else {
                this._video.setPositionRepeats(0);
            }
            if (overlay) {
                if (lastPosition > 0 && progress > lastPosition && progress - lastPosition < 100) {
                    overlay.setSpinnerEnabled(true);
                }
                else {
                    overlay.setSpinnerEnabled(false);
                }
            }
            const previousQuartile = this._video.getQuartile();
            this._video.setPosition(progress);
            if (previousQuartile === 0 && this._video.getQuartile() === 1) {
                this.handleFirstQuartileEvent(progress);
            }
            else if (previousQuartile === 1 && this._video.getQuartile() === 2) {
                this.handleMidPointEvent(progress);
            }
            else if (previousQuartile === 2 && this._video.getQuartile() === 3) {
                this.handleThirdQuartileEvent(progress);
            }
        }
        if (overlay) {
            overlay.setVideoProgress(progress);
        }
    }
    onCompleted(url) {
        this._adUnit.setVideoState(VideoState.COMPLETED);
        this._adUnit.setFinishState(FinishState.COMPLETED);
        this.handleCompleteEvent(url);
        this.afterVideoCompleted();
    }
    onPrepared(url, duration, width, height) {
        if (this._adUnit.getVideoState() === VideoState.ERRORED || this._adUnit.getVideoState() !== VideoState.PREPARING) {
            // there can be a small race condition window with prepare timeout and canceling video prepare
            return;
        }
        this._adUnit.setVideoState(VideoState.READY);
        if (duration > VideoFileInfo._maxVideoDuration) {
            CreativeBlocking.report(this._campaign.getCreativeId(), this._campaign.getSeatId(), this._campaign.getId(), BlockingReason.VIDEO_TOO_LONG, {
                videoLength: duration
            });
            return this.handleVideoError(VideoMetric.TooLongError);
        }
        const overlay = this._adUnit.getOverlay();
        this._video.setDuration(duration);
        if (overlay) {
            overlay.setVideoDuration(duration);
            if (this._video.getPosition() > 0) {
                overlay.setVideoProgress(this._video.getPosition());
            }
            overlay.setMuteEnabled(true);
            overlay.setVideoDurationEnabled(true);
        }
        if (TestEnvironment.get('debugOverlayEnabled') && overlay) {
            overlay.setDebugMessageVisible(true);
        }
        this._ads.VideoPlayer.setVolume(new Double(overlay && overlay.isMuted() ? 0 : 1)).then(() => {
            if (this._video.getPosition() > 0) {
                this._ads.VideoPlayer.seekTo(this._video.getPosition()).then(() => {
                    if (!this._adUnit.getContainer().isPaused() && (overlay && !overlay.isPrivacyShowing())) {
                        this._ads.VideoPlayer.play();
                    }
                });
            }
            else {
                if (!this._adUnit.getContainer().isPaused() && (overlay && !overlay.isPrivacyShowing())) {
                    this._ads.VideoPlayer.play();
                }
            }
        });
    }
    onPrepareTimeout(url) {
        this._core.Sdk.logError('Unity Ads video player prepare timeout ' + url);
        this.handleVideoError(VideoMetric.PrepareTimeout);
    }
    onPlay(url) {
        this._ads.VideoPlayer.setProgressEventInterval(this._adUnit.getProgressInterval());
    }
    onPause(url) {
        // EMPTY
    }
    onSeek(url) {
        // EMPTY
    }
    onStop(url) {
        // EMPTY
    }
    handleStartEvent(progress) {
        this._operativeEventManager.sendStart(this.getOperativeEventParams()).then(() => {
            this._adUnit.onStartProcessed.trigger();
        });
        this._ads.Listener.sendStartEvent(this._placement.getId());
    }
    handleFirstQuartileEvent(progress) {
        this._operativeEventManager.sendFirstQuartile(this.getOperativeEventParams());
    }
    handleMidPointEvent(progress) {
        this._operativeEventManager.sendMidpoint(this.getOperativeEventParams());
    }
    handleThirdQuartileEvent(progress) {
        this._operativeEventManager.sendThirdQuartile(this.getOperativeEventParams());
    }
    handleCompleteEvent(url) {
        this._operativeEventManager.sendView(this.getOperativeEventParams());
    }
    getOperativeEventParams() {
        return {
            placement: this._placement,
            videoOrientation: this.getVideoOrientation(),
            adUnitStyle: this._adUnitStyle,
            asset: this._video
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlkZW9FdmVudEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL0V2ZW50SGFuZGxlcnMvVmlkZW9FdmVudEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxxQkFBcUIsRUFBNEIsTUFBTSx5Q0FBeUMsQ0FBQztBQVMxRyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUN0RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDNUQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUU5RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDL0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ2pFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUNuRixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFdkQsTUFBTSxPQUFPLGlCQUFrQixTQUFRLHFCQUFxQjtJQVV4RCxZQUFZLE1BQWdDO1FBQ3hDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVkLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxNQUFNLENBQUMscUJBQXFCLENBQUM7UUFDM0QsSUFBSSxDQUFDLHVCQUF1QixHQUFHLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQztRQUM3RCxJQUFJLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7UUFDckMsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ25DLElBQUksQ0FBQyxVQUFVLEdB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