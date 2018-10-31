import { VideoState } from 'Ads/AdUnits/VideoAdUnit';
import { BaseVideoEventHandler, IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { Video } from 'Ads/Models/Assets/Video';
import { Placement } from 'Ads/Models/Placement';
import { IVideoEventHandler } from 'Ads/Native/VideoPlayer';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { VideoFileInfo } from 'Ads/Utilities/VideoFileInfo';
import { FinishState } from 'Core/Constants/FinishState';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { Double } from 'Core/Utilities/Double';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';

export class VideoEventHandler extends BaseVideoEventHandler implements IVideoEventHandler {

    protected _operativeEventManager: OperativeEventManager;
    protected _thirdPartyEventManager: ThirdPartyEventManager;
    protected _coreConfig: CoreConfiguration;
    protected _adsConfig: AdsConfiguration;
    protected _placement: Placement;
    protected _adUnitStyle: AdUnitStyle | undefined;
    protected _video: Video;

    constructor(params: IVideoEventHandlerParams) {
        super(params);

        this._operativeEventManager = params.operativeEventManager;
        this._thirdPartyEventManager = params.thirdPartyEventManager;
        this._coreConfig = params.coreConfig;
        this._adsConfig = params.adsConfig;
        this._placement = params.placement;
        this._adUnitStyle = params.adUnitStyle;
        this._video = params.video;
    }

    public onProgress(progress: number): void {
        const overlay = this._adUnit.getOverlay();

        if(progress > 0 && this._adUnit.getVideoState() === VideoState.READY) {
            this._adUnit.setVideoState(VideoState.PLAYING);

            if(overlay) {
                overlay.setSpinnerEnabled(false);
            }
        }

        if(progress > 0 && !this._video.hasStarted()) {
            this._video.setStarted(true);
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
                SessionDiagnostics.trigger('video_player_too_large_progress', error, this._campaign.getSession());

                return;
            }

            if(progress === lastPosition) {
                const repeats: number = this._video.getPositionRepeats();
                const repeatTreshold: number = 5000 / this._adUnit.getProgressInterval();

                // if video player has been repeating the same video position for more than 5000 milliseconds, video player is stuck
                if(repeats > repeatTreshold) {
                    this._nativeBridge.Sdk.logError('Unity Ads video player stuck to ' + progress + 'ms position');

                    const error: any = {
                        repeats: repeats,
                        position: progress,
                        duration: this._video.getDuration(),
                        url: this._video.getUrl(),
                        originalUrl: this._video.getOriginalUrl(),
                        cached: this._video.isCached(),
                        cacheMode: this._adsConfig.getCacheMode(),
                        lowMemory: this._adUnit.isLowMemory()
                    };

                    const fileId = this._video.getFileId();

                    if(fileId) {
                        this._nativeBridge.Cache.getFileInfo(fileId).then((fileInfo) => {
                            error.fileInfo = fileInfo;
                            if(fileInfo.found) {
                                return VideoFileInfo.getVideoInfo(this._nativeBridge, fileId).then(([width, height, duration]) => {
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
                if(lastPosition > 0 && progress > lastPosition && progress - lastPosition < 100) {
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
        this._adUnit.setVideoState(VideoState.COMPLETED);
        this._adUnit.setFinishState(FinishState.COMPLETED);

        this.handleCompleteEvent(url);
        this.afterVideoCompleted();
    }

    public onPrepared(url: string, duration: number, width: number, height: number): void {
        if(this._adUnit.getVideoState() === VideoState.ERRORED || this._adUnit.getVideoState() !== VideoState.PREPARING) {
            // there can be a small race condition window with prepare timeout and canceling video prepare
            return;
        }

        this._adUnit.setVideoState(VideoState.READY);

        if(duration > VideoFileInfo._maxVideoDuration) {
            const originalUrl = this._video.getOriginalUrl();
            const error = new DiagnosticError(new Error('Too long video'), {
                duration: duration,
                campaignId: this._campaign.getId(),
                url: url,
                originalUrl: originalUrl,
                isCached: CampaignAssetInfo.isCached(this._campaign)
            });
            return this.handleVideoError('video_too_long', error);
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

        this._nativeBridge.VideoPlayer.setVolume(new Double(overlay && overlay.isMuted() ? 0 : 1)).then(() => {
            if(this._video.getPosition() > 0) {
                this._nativeBridge.VideoPlayer.seekTo(this._video.getPosition()).then(() => {
                    if(!this._adUnit.getContainer().isPaused() && (overlay && !overlay.isPrivacyShowing())) {
                        this._nativeBridge.VideoPlayer.play();
                    }
                });
            } else {
                if(!this._adUnit.getContainer().isPaused() && (overlay && !overlay.isPrivacyShowing())) {
                    this._nativeBridge.VideoPlayer.play();
                }
            }
        });
    }

    public onPrepareTimeout(url: string): void {
        this._nativeBridge.Sdk.logError('Unity Ads video player prepare timeout '  + url);

        this.handleVideoError('video_player_prepare_timeout', {
            'url': url,
            'position': this._video.getPosition()
        });
    }

    public onPlay(url: string): void {
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
        this._operativeEventManager.sendStart(this.getOperativeEventParams()).then(() => {
            this._adUnit.onStartProcessed.trigger();
        });

        this._nativeBridge.Listener.sendStartEvent(this._placement.getId());
    }

    protected handleFirstQuartileEvent(progress: number): void {
        this._operativeEventManager.sendFirstQuartile(this.getOperativeEventParams());
    }

    protected handleMidPointEvent(progress: number): void {
        this._operativeEventManager.sendMidpoint(this.getOperativeEventParams());
    }

    protected handleThirdQuartileEvent(progress: number): void {
        this._operativeEventManager.sendThirdQuartile(this.getOperativeEventParams());
    }

    protected handleCompleteEvent(url: string): void {
        this._operativeEventManager.sendView(this.getOperativeEventParams());
    }

    private getOperativeEventParams(): IOperativeEventParams {
        return {
            placement: this._placement,
            videoOrientation: this.getVideoOrientation(),
            adUnitStyle: this._adUnitStyle,
            asset: this._video
        };
    }
}
