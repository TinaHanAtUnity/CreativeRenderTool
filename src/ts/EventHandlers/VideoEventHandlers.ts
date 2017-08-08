import { Double } from 'Utilities/Double';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { FinishState } from 'Constants/FinishState';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { TestEnvironment } from 'Utilities/TestEnvironment';
import { AdUnitContainer, ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { Configuration } from 'Models/Configuration';
import { Platform } from 'Constants/Platform';
import { VideoMetadata } from 'Constants/Android/VideoMetadata';
import { ViewController } from 'AdUnits/Containers/ViewController';

export class VideoEventHandlers {

    public static onVideoPrepared(nativeBridge: NativeBridge, adUnit: VideoAdUnit, duration: number): void {
        if(adUnit.getVideo().getErrorStatus() || !adUnit.isPrepareCalled()) {
            // there can be a small race condition window with prepare timeout and canceling video prepare
            return;
        }

        adUnit.getContainer().addDiagnosticsEvent({type: 'onVideoPrepared'});
        adUnit.setPrepareCalled(false);
        adUnit.setVideoReady(true);

        if(duration > 40000) {
            const campaign = adUnit.getCampaign();
            const url = adUnit.getVideo().getUrl();
            const originalUrl = adUnit.getVideo().getOriginalUrl();
            const error: DiagnosticError = new DiagnosticError(new Error('Too long video'), {
                duration: duration,
                campaignId: campaign.getId(),
                url: url,
                originalUrl: originalUrl
            });
            Diagnostics.trigger('video_too_long', error);
        }

        const overlay = adUnit.getOverlay();

        adUnit.getVideo().setDuration(duration);
        if(overlay) {
            overlay.setVideoDuration(duration);
            if(adUnit.getVideo().getPosition() > 0) {
                overlay.setVideoProgress(adUnit.getVideo().getPosition());
            }

            overlay.setMuteEnabled(true);
            overlay.setVideoDurationEnabled(true);

            if (adUnit instanceof VastAdUnit && (<VastAdUnit>adUnit).getVideoClickThroughURL()) {
                overlay.setCallButtonVisible(true);
                overlay.setFadeEnabled(false);
            }
        }

        if(TestEnvironment.get('debugOverlayEnabled') && overlay) {
            overlay.setDebugMessageVisible(true);
            let debugMessage = '';
            if(adUnit instanceof VastAdUnit) {
                debugMessage = 'Programmatic Ad';
            } else {
                debugMessage = 'Performance Ad';
            }
            overlay.setDebugMessage(debugMessage);
        }

        nativeBridge.VideoPlayer.setVolume(new Double(overlay && overlay.isMuted() ? 0.0 : 1.0)).then(() => {
            if(adUnit.getVideo().getPosition() > 0) {
                nativeBridge.VideoPlayer.seekTo(adUnit.getVideo().getPosition()).then(() => {
                    if(!adUnit.getContainer().isPaused()) {
                        nativeBridge.VideoPlayer.play();
                    }
                });
            } else {
                if(!adUnit.getContainer().isPaused()) {
                    nativeBridge.VideoPlayer.play();
                }
            }
        });
    }

    public static onVideoProgress(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit, position: number, configuration: Configuration): void {
        if(position > 0 && !adUnit.getVideo().hasStarted()) {
            adUnit.getContainer().addDiagnosticsEvent({type: 'videoStarted'});
            adUnit.getVideo().setStarted(true);

            sessionManager.sendStart(adUnit);

            const overlay = adUnit.getOverlay();
            if(overlay) {
                overlay.setSpinnerEnabled(false);
            }

            nativeBridge.Listener.sendStartEvent(adUnit.getPlacement().getId());
        }

        if (sessionManager.getSession() && adUnit instanceof VastAdUnit) {
            (<VastAdUnit>adUnit).sendProgressEvents(
                sessionManager.getEventManager(),
                sessionManager.getSession().getId(),
                sessionManager.getClientInfo().getSdkVersion(),
                position,
                adUnit.getVideo().getPosition());
        }

        const overlay = adUnit.getOverlay();
        if(position >= 0) {
            const lastPosition = adUnit.getVideo().getPosition();

            // consider all leaps more than one million milliseconds (slightly more than 2,5 hours)
            // bugs in native videoplayer that should be ignored, these have been seen in some Android 7 devices
            const ignoreTreshold: number = lastPosition + 1000000;
            if(position > ignoreTreshold) {
                nativeBridge.Sdk.logError('Unity Ads video player ignoring too large progress from ' + lastPosition + ' to ' + position);

                const error: DiagnosticError = new DiagnosticError(new Error('Too large progress in video player'), {
                    position: position,
                    lastPosition: lastPosition,
                    duration: adUnit.getVideo().getDuration()
                });
                Diagnostics.trigger('video_player_too_large_progress', error);

                return;
            }

            if(position === lastPosition) {
                const repeats: number = adUnit.getVideo().getPositionRepeats();
                const repeatTreshold: number = 5000 / adUnit.getProgressInterval();

                // if video player has been repeating the same video position for more than 5000 milliseconds, video player is stuck
                if(repeats > repeatTreshold) {
                    adUnit.getContainer().addDiagnosticsEvent({type: 'videoStuck'});
                    nativeBridge.Sdk.logError('Unity Ads video player stuck to ' + position + 'ms position');
                    this.handleVideoError(nativeBridge, adUnit);

                    const error: any = {
                        repeats: repeats,
                        position: position,
                        duration: adUnit.getVideo().getDuration(),
                        url: adUnit.getVideo().getUrl(),
                        originalUrl: adUnit.getVideo().getOriginalUrl(),
                        cached: adUnit.getVideo().isCached(),
                        cacheMode: configuration.getCacheMode(),
                        lowMemory: adUnit.isLowMemory()
                    };

                    const container = adUnit.getContainer();
                    error.events = container.getDiagnosticsEvents();
                    const fileId = adUnit.getVideo().getFileId();

                    if(fileId) {
                        nativeBridge.Cache.getFileInfo(fileId).then((fileInfo) => {
                            error.fileInfo = fileInfo;

                            if(fileInfo.found) {
                                if(nativeBridge.getPlatform() === Platform.IOS) {
                                    return nativeBridge.Cache.Ios.getVideoInfo(fileId).then(([width, height, duration]) => {
                                        const videoInfo: any = {
                                            width: width,
                                            height: height,
                                            duration: duration
                                        };
                                        error.videoInfo = videoInfo;
                                        return error;
                                    });
                                } else {
                                    const metadataKeys = [VideoMetadata.METADATA_KEY_VIDEO_WIDTH, VideoMetadata.METADATA_KEY_VIDEO_HEIGHT, VideoMetadata.METADATA_KEY_DURATION];
                                    return nativeBridge.Cache.Android.getMetaData(fileId, metadataKeys).then(results => {
                                        let width: number = 0;
                                        let height: number = 0;
                                        let duration: number = 0;

                                        for (const entry of results) {
                                            const key = entry[0];
                                            const value = entry[1];

                                            switch (key) {
                                                case VideoMetadata.METADATA_KEY_VIDEO_WIDTH:
                                                    width = value;
                                                    break;

                                                case VideoMetadata.METADATA_KEY_VIDEO_HEIGHT:
                                                    height = value;
                                                    break;

                                                case VideoMetadata.METADATA_KEY_DURATION:
                                                    duration = value;
                                                    break;

                                                default:
                                                    // unknown key, ignore
                                                    break;
                                            }
                                        }

                                        const videoInfo: any = {
                                            width: width,
                                            height: height,
                                            duration: duration
                                        };
                                        error.videoInfo = videoInfo;
                                        return error;
                                    });
                                }
                            } else {
                                return error;
                            }
                        }).then((videoError) => {
                            Diagnostics.trigger('video_player_stuck', videoError);
                        }).catch(() => {
                            Diagnostics.trigger('video_player_stuck', error);
                        });
                    } else {
                        Diagnostics.trigger('video_player_stuck', error);
                    }

                    return;
                } else {
                    adUnit.getVideo().setPositionRepeats(repeats + 1);
                }
            } else {
                adUnit.getVideo().setPositionRepeats(0);
            }

            if (overlay) {
                if(lastPosition > 0 && position - lastPosition < 100) {
                    overlay.setSpinnerEnabled(true);
                } else {
                    overlay.setSpinnerEnabled(false);
                }
            }

            const previousQuartile: number = adUnit.getVideo().getQuartile();
            adUnit.getVideo().setPosition(position);

            if(previousQuartile === 0 && adUnit.getVideo().getQuartile() === 1) {
                sessionManager.sendFirstQuartile(adUnit);
            } else if(previousQuartile === 1 && adUnit.getVideo().getQuartile() === 2) {
                sessionManager.sendMidpoint(adUnit);
            } else if(previousQuartile === 2 && adUnit.getVideo().getQuartile() === 3) {
                sessionManager.sendThirdQuartile(adUnit);
            }
        }

        if(overlay) {
            overlay.setVideoProgress(position);
        }
    }

    public static onVideoPlay(nativeBridge: NativeBridge, adUnit: VideoAdUnit): void {
        adUnit.getContainer().addDiagnosticsEvent({type: 'onVideoPlay'});
        nativeBridge.VideoPlayer.setProgressEventInterval(adUnit.getProgressInterval());
    }

    public static onVideoCompleted(sessionManager: SessionManager, adUnit: VideoAdUnit): void {
        adUnit.getContainer().addDiagnosticsEvent({type: 'onVideoCompleted'});
        adUnit.setActive(false);
        adUnit.setFinishState(FinishState.COMPLETED);
        sessionManager.sendView(adUnit);

        this.afterVideoCompleted(adUnit);
    }

    public static onAndroidGenericVideoError(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit, what: number, extra: number, url: string) {
        videoAdUnit.getContainer().addDiagnosticsEvent({type: 'onAndroidGenericVideoError', what: what, extra: extra});
        nativeBridge.Sdk.logError('Unity Ads video player error ' + ' ' + what + ' ' + extra + ' ' + url);

        this.handleVideoError(nativeBridge, videoAdUnit);

        Diagnostics.trigger('video_player_generic_error', {
            'url': url,
            'position': videoAdUnit.getVideo().getPosition(),
            'what': what,
            'extra': extra
        });
    }

    public static onIosGenericVideoError(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit, url: string, description: string) {
        videoAdUnit.getContainer().addDiagnosticsEvent({type: 'onIosGenericVideoError', description: description});
        nativeBridge.Sdk.logError('Unity Ads video player generic error '  + url + ' ' + description);

        this.handleVideoError(nativeBridge, videoAdUnit);

        Diagnostics.trigger('video_player_generic_error', {
            'url': url,
            'position': videoAdUnit.getVideo().getPosition(),
            'description': description
        });
    }

    public static onVideoPrepareTimeout(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit, url: string): void {
        videoAdUnit.getContainer().addDiagnosticsEvent({type: 'onVideoPrepareTimeout'});
        nativeBridge.Sdk.logError('Unity Ads video player prepare timeout '  + url);

        this.handleVideoError(nativeBridge, videoAdUnit);

        Diagnostics.trigger('video_player_prepare_timeout', {
            'url': url,
            'position': videoAdUnit.getVideo().getPosition()
        });
    }

    public static onPrepareError(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit, url: string) {
        videoAdUnit.getContainer().addDiagnosticsEvent({type: 'onPrepareError'});
        nativeBridge.Sdk.logError('Unity Ads video player prepare error '  + url);

        this.handleVideoError(nativeBridge, videoAdUnit);

        Diagnostics.trigger('video_player_prepare_error', {
            'url': url,
            'position': videoAdUnit.getVideo().getPosition()
        });
    }

    public static onSeekToError(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit, url: string) {
        videoAdUnit.getContainer().addDiagnosticsEvent({type: 'onSeekToError'});
        nativeBridge.Sdk.logError('Unity Ads video player seek to error '  + url);

        this.handleVideoError(nativeBridge, videoAdUnit);

        Diagnostics.trigger('video_player_seek_to_error', {
            'url': url,
            'position': videoAdUnit.getVideo().getPosition()
        });
    }

    public static onPauseError(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit, url: string) {
        videoAdUnit.getContainer().addDiagnosticsEvent({type: 'onPauseError'});
        nativeBridge.Sdk.logError('Unity Ads video player pause error '  + url);

        this.handleVideoError(nativeBridge, videoAdUnit);

        Diagnostics.trigger('video_player_pause_error', {
            'url': url,
            'position': videoAdUnit.getVideo().getPosition()
        });
    }

    public static onIllegalStateError(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit) {
        videoAdUnit.getContainer().addDiagnosticsEvent({type: 'onIllegalStateError'});
        nativeBridge.Sdk.logError('Unity Ads video player illegal state error');

        this.handleVideoError(nativeBridge, videoAdUnit);

        Diagnostics.trigger('video_player_illegal_state_error', {
            'position': videoAdUnit.getVideo().getPosition()
        });
    }

    public static onIosVideoLikelyToKeepUp(nativeBridge: NativeBridge, adUnit: VideoAdUnit, container: AdUnitContainer, likelyToKeepUp: boolean): void {
        adUnit.getContainer().addDiagnosticsEvent({type: 'onIosVideoLikelyToKeepUp', likelyToKeepUp: likelyToKeepUp});
        if(!container.isPaused() && adUnit.getVideo().hasStarted() && likelyToKeepUp) {
            nativeBridge.VideoPlayer.play();
        }
    }

    protected static afterVideoCompleted(adUnit: VideoAdUnit) {
        adUnit.getContainer().addDiagnosticsEvent({type: 'afterVideoCompleted'});
        adUnit.getContainer().reconfigure(ViewConfiguration.ENDSCREEN);

        const overlay = adUnit.getOverlay();
        if(overlay) {
            overlay.hide();
        }
        adUnit.onFinish.trigger();
    }

    protected static updateViewsOnVideoError(videoAdUnit: VideoAdUnit) {
        videoAdUnit.getContainer().addDiagnosticsEvent({type: 'updateViewsOnVideoError'});
        videoAdUnit.getContainer().reconfigure(ViewConfiguration.ENDSCREEN);
    }

    private static handleVideoError(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit) {
        videoAdUnit.getVideo().setErrorStatus(true);
        videoAdUnit.setActive(false);
        videoAdUnit.setFinishState(FinishState.ERROR);

        this.updateViewsOnVideoError(videoAdUnit);

        const overlay = videoAdUnit.getOverlay();
        if(overlay) {
            overlay.hide();
        }

        videoAdUnit.onError.trigger();
        videoAdUnit.onFinish.trigger();

        if(!videoAdUnit.getVideo().hasStarted()) {
            videoAdUnit.hide();
            nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.VIDEO_PLAYER_ERROR], 'Video player prepare error');
        } else {
            nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.VIDEO_PLAYER_ERROR], 'Video player error');
        }
    }
}
