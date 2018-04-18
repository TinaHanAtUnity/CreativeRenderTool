import { Double } from 'Utilities/Double';
import { FinishState } from 'Constants/FinishState';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { TestEnvironment } from 'Utilities/TestEnvironment';
import { Configuration } from 'Models/Configuration';
import { FileInfo } from 'Utilities/FileInfo';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';
import { Placement } from 'Models/Placement';
import { AdUnitStyle } from 'Models/AdUnitStyle';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { IVideoEventHandler } from 'Native/Api/VideoPlayer';
import { Video } from 'Models/Assets/Video';
import { BaseVideoEventHandler, IVideoEventHandlerParams } from 'EventHandlers/BaseVideoEventHandler';

export class VideoEventHandler extends BaseVideoEventHandler implements IVideoEventHandler {

    protected _operativeEventManager: OperativeEventManager;
    protected _thirdPartyEventManager: ThirdPartyEventManager;
    protected _comScoreTrackingService: ComScoreTrackingService;
    protected _configuration: Configuration;
    protected _placement: Placement;
    protected _adUnitStyle: AdUnitStyle | undefined;
    protected _video: Video;

    constructor(params: IVideoEventHandlerParams) {
        super(params);

        this._operativeEventManager = params.operativeEventManager;
        this._thirdPartyEventManager = params.thirdPartyEventManager;
        this._comScoreTrackingService = params.comScoreTrackingService;
        this._configuration = params.configuration;
        this._placement = params.placement;
        this._adUnitStyle = params.adUnitStyle;
        this._video = params.video;
    }

    public onProgress(progress: number): void {
        this._adUnit.getContainer().addDiagnosticsEvent({type: 'onVideoProgress', position: progress});
        const overlay = this._adUnit.getOverlay();

        if(progress > 0 && !this._video.hasStarted()) {
            this._adUnit.getContainer().addDiagnosticsEvent({type: 'videoStarted'});
            this._video.setStarted(true);

            if(overlay) {
                overlay.setSpinnerEnabled(false);
            }

            this.handleStartEvent(progress);
        }

        if(progress >= 0) {
            const lastPosition = this._video.getPosition();

            // consider all leaps more than one million milliseconds (slightly more than 2,5 hours)
            // bugs in native videoplayer that should be ignored, these have been seen in some Android 7 devices
            const ignoreTreshold: number = lastPosition + 1000000;
            if(progress > ignoreTreshold) {
                this._nativeBridge.Sdk.logError('Unity Ads video player ignoring too large progress from ' + lastPosition + ' to ' + progress);

                const error: DiagnosticError = new DiagnosticError(new Error('Too large progress in video player'), {
                    position: progress,
                    lastPosition: lastPosition,
                    duration: this._video.getDuration()
                });
                Diagnostics.trigger('video_player_too_large_progress', error, this._campaign.getSession());

                return;
            }

            if(progress === lastPosition) {
                const repeats: number = this._video.getPositionRepeats();
                const repeatTreshold: number = 5000 / this._adUnit.getProgressInterval();

                // if video player has been repeating the same video position for more than 5000 milliseconds, video player is stuck
                if(repeats > repeatTreshold) {
                    this._adUnit.getContainer().addDiagnosticsEvent({type: 'videoStuck'});
                    this._nativeBridge.Sdk.logError('Unity Ads video player stuck to ' + progress + 'ms position');

                    const error: any = {
                        repeats: repeats,
                        position: progress,
                        duration: this._video.getDuration(),
                        url: this._video.getUrl(),
                        originalUrl: this._video.getOriginalUrl(),
                        cached: this._video.isCached(),
                        cacheMode: this._configuration.getCacheMode(),
                        lowMemory: this._adUnit.isLowMemory()
                    };

                    const container = this._adUnit.getContainer();
                    error.events = container.getDiagnosticsEvents();
                    const fileId = this._video.getFileId();

                    if(fileId) {
                        this._nativeBridge.Cache.getFileInfo(fileId).then((fileInfo) => {
                            error.fileInfo = fileInfo;
                            if(fileInfo.found) {
                                return FileInfo.getVideoInfo(this._nativeBridge, fileId).then(([width, height, duration]) => {
                                    const videoInfo: any = {
                                        width: width,
                                        height: height,
                                        duration: duration
                                    };
                                    error.videoInfo = videoInfo;
                                    return error;
                                });
                            } else {
                                return error;
                            }
                        }).then((videoError) => {
                            this.handleVideoError('video_player_stuck', videoError);
                        }).catch(() => {
                            this.handleVideoError('video_player_stuck', error);
                        });
                    } else {
                        this.handleVideoError('video_player_stuck', error);
                    }

                    return;
                } else {
                    this._video.setPositionRepeats(repeats + 1);
                }
            } else {
                this._video.setPositionRepeats(0);
            }

            if(overlay) {
                if(lastPosition > 0 && progress - lastPosition < 100) {
                    overlay.setSpinnerEnabled(true);
                } else {
                    overlay.setSpinnerEnabled(false);
                }
            }

            const previousQuartile: number = this._video.getQuartile();
            this._video.setPosition(progress);

            if(previousQuartile === 0 && this._video.getQuartile() === 1) {
                this.handleFirstQuartileEvent(progress);
            } else if(previousQuartile === 1 && this._video.getQuartile() === 2) {
                this.handleMidPointEvent(progress);
            } else if(previousQuartile === 2 && this._video.getQuartile() === 3) {
                this.handleThirdQuartileEvent(progress);
            }
        }

        if(overlay) {
            overlay.setVideoProgress(progress);
        }
    }

    public onCompleted(url: string): void {
        this._adUnit.getContainer().addDiagnosticsEvent({type: 'onVideoCompleted'});
        this._adUnit.setActive(false);
        this._adUnit.setFinishState(FinishState.COMPLETED);

        this.handleCompleteEvent(url);
        this.afterVideoCompleted();
    }

    public onPrepared(url: string, duration: number, width: number, height: number): void {
        if(this._video.getErrorStatus() || !this._adUnit.isPrepareCalled()) {
            // there can be a small race condition window with prepare timeout and canceling video prepare
            return;
        }

        this._adUnit.getContainer().addDiagnosticsEvent({type: 'onVideoPrepared'});
        this._adUnit.setPrepareCalled(false);
        this._adUnit.setVideoReady(true);

        if(duration > 40000) {
            const originalUrl = this._video.getOriginalUrl();
            const error: DiagnosticError = new DiagnosticError(new Error('Too long video'), {
                duration: duration,
                campaignId: this._campaign.getId(),
                url: url,
                originalUrl: originalUrl
            });
            Diagnostics.trigger('video_too_long', error, this._campaign.getSession());
            this.handleVideoError('video_too_long_error');
            return;
        }

        const overlay = this._adUnit.getOverlay();

        this._video.setDuration(duration);
        if(overlay) {
            overlay.setVideoDuration(duration);
            if(this._video.getPosition() > 0) {
                overlay.setVideoProgress(this._video.getPosition());
            }

            overlay.setMuteEnabled(true);
            overlay.setVideoDurationEnabled(true);
        }

        if(TestEnvironment.get('debugOverlayEnabled') && overlay) {
            overlay.setDebugMessageVisible(true);
        }

        this._nativeBridge.VideoPlayer.setVolume(new Double(overlay && overlay.isMuted() ? 0.0 : 1.0)).then(() => {
            if(this._video.getPosition() > 0) {
                this._nativeBridge.VideoPlayer.seekTo(this._video.getPosition()).then(() => {
                    if(!this._adUnit.getContainer().isPaused()) {
                        this._nativeBridge.VideoPlayer.play();
                    }
                });
            } else {
                if(!this._adUnit.getContainer().isPaused()) {
                    this._nativeBridge.VideoPlayer.play();
                }
            }
        });
    }

    public onPrepareTimeout(url: string): void {
        this._adUnit.getContainer().addDiagnosticsEvent({type: 'onVideoPrepareTimeout'});
        this._nativeBridge.Sdk.logError('Unity Ads video player prepare timeout '  + url);

        this.handleVideoError('video_player_prepare_timeout', {
            'url': url,
            'position': this._video.getPosition()
        });
    }

    public onPlay(url: string): void {
        this._adUnit.getContainer().addDiagnosticsEvent({type: 'onVideoPlay'});
        this._nativeBridge.VideoPlayer.setProgressEventInterval(this._adUnit.getProgressInterval());
    }

    public onPause(url: string): void {
        // EMPTY
    }

    public onSeek(url: string): void {
        // EMPTY
    }

    public onStop(url: string): void {
        // EMPTY
    }

    protected handleStartEvent(progress: number): void {
        this._operativeEventManager.sendStart(this._placement, this.getVideoOrientation(), this._adUnitStyle).then(() => {
            this._adUnit.onStartProcessed.trigger();
        });

        const comScoreDuration = (this._video.getDuration()).toString(10);
        const sessionId = this._campaign.getSession().getId();
        const creativeId = this._campaign.getCreativeId();
        let category;
        let subCategory;
        if (this._campaign instanceof VastCampaign) {
            category = this._campaign.getCategory();
            subCategory = this._campaign.getSubcategory();
        }
        this._comScoreTrackingService.sendEvent('play', sessionId, comScoreDuration, progress, creativeId, category, subCategory);
        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
    }

    protected handleFirstQuartileEvent(progress: number): void {
        this._operativeEventManager.sendFirstQuartile(this._placement, this.getVideoOrientation(), this._adUnitStyle);
    }

    protected handleMidPointEvent(progress: number): void {
        this._operativeEventManager.sendMidpoint(this._placement, this.getVideoOrientation(), this._adUnitStyle);
    }

    protected handleThirdQuartileEvent(progress: number): void {
        this._operativeEventManager.sendThirdQuartile(this._placement, this.getVideoOrientation(), this._adUnitStyle);
    }

    protected handleCompleteEvent(url: string): void {
        this._operativeEventManager.sendView(this._placement, this.getVideoOrientation(), this._adUnitStyle);

        const comScorePlayedTime = this._video.getPosition();
        const comScoreDuration = (this._video.getDuration()).toString(10);
        const sessionId = this._campaign.getSession().getId();
        const creativeId = this._campaign.getCreativeId();
        this._comScoreTrackingService.sendEvent('end', sessionId, comScoreDuration, comScorePlayedTime, creativeId, undefined, undefined);
    }
}
