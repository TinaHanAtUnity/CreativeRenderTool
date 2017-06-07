import { Double } from 'Utilities/Double';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { FinishState } from 'Constants/FinishState';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { TestEnvironment } from 'Utilities/TestEnvironment';
import { ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';

export class VideoEventHandlers {

    public static onVideoPrepared(nativeBridge: NativeBridge, adUnit: VideoAdUnit, duration: number): void {
        if(adUnit.getVideo().getErrorStatus()) {
            // there can be a small race condition window with prepare timeout and canceling video prepare
            return;
        }

        if(duration > 40000) {
            const campaign = adUnit.getCampaign();
            let url: string;
            let originalUrl: string;
            if(campaign instanceof PerformanceCampaign) {
                url = (<PerformanceCampaign>campaign).getVideo().getUrl();
                originalUrl = (<PerformanceCampaign>campaign).getVideo().getOriginalUrl();
            } else if(campaign instanceof VastCampaign) {
                url = (<VastCampaign>campaign).getVideo().getUrl();
                originalUrl = (<VastCampaign>campaign).getVideo().getOriginalUrl();
            } else {
                throw new Error('Unknown campaign type');
            }

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
                    nativeBridge.VideoPlayer.play();
                });
            } else {
                nativeBridge.VideoPlayer.play();
            }
        });
    }

    public static onVideoProgress(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit, position: number): void {
        if(position > 0 && !adUnit.getVideo().hasStarted()) {
            adUnit.getVideo().setStarted(true);

            sessionManager.sendStart(adUnit).then(() => {
                if(adUnit.getVideo().isCached() && adUnit.getVideo().getPosition() + 5000 < adUnit.getVideo().getDuration()) {
                    adUnit.setStartProcessedTreshold(adUnit.getVideo().getPosition() + 5000);
                }
            });

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

            const startProcessedTreshold: number | undefined = adUnit.getStartProcessedTreshold();
            if(!adUnit.isStartProcessed() && startProcessedTreshold && position > startProcessedTreshold) {
                adUnit.setStartProcessed(true);
                adUnit.onStartProcessed.trigger();
            }

            if(position === lastPosition) {
                const repeats: number = adUnit.getVideo().getPositionRepeats();
                const repeatTreshold: number = 5000 / adUnit.getProgressInterval();

                // if video player has been repeating the same video position for more than 5000 milliseconds, video player is stuck
                if(repeats > repeatTreshold) {
                    nativeBridge.Sdk.logError('Unity Ads video player stuck to ' + position + 'ms position');
                    this.handleVideoError(nativeBridge, adUnit);

                    const error: DiagnosticError = new DiagnosticError(new Error('Video player stuck'), {
                        repeats: repeats,
                        position: position,
                        duration: adUnit.getVideo().getDuration()
                    });
                    Diagnostics.trigger('video_player_stuck', error);

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
        nativeBridge.VideoPlayer.setProgressEventInterval(adUnit.getProgressInterval());
    }

    public static onVideoCompleted(sessionManager: SessionManager, adUnit: VideoAdUnit): void {
        adUnit.getVideo().setActive(false);
        adUnit.setFinishState(FinishState.COMPLETED);
        sessionManager.sendView(adUnit);

        this.afterVideoCompleted(adUnit);
    }

    public static onAndroidGenericVideoError(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit, what: number, extra: number, url: string) {
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
        nativeBridge.Sdk.logError('Unity Ads video player generic error '  + url + ' ' + description);

        this.handleVideoError(nativeBridge, videoAdUnit);

        Diagnostics.trigger('video_player_generic_error', {
            'url': url,
            'position': videoAdUnit.getVideo().getPosition(),
            'description': description
        });
    }

    public static onVideoPrepareTimeout(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit, url: string): void {
        nativeBridge.Sdk.logError('Unity Ads video player prepare timeout '  + url);

        this.handleVideoError(nativeBridge, videoAdUnit);

        Diagnostics.trigger('video_player_prepare_timeout', {
            'url': url,
            'position': videoAdUnit.getVideo().getPosition()
        });
    }

    public static onPrepareError(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit, url: string) {
        nativeBridge.Sdk.logError('Unity Ads video player prepare error '  + url);

        this.handleVideoError(nativeBridge, videoAdUnit);

        Diagnostics.trigger('video_player_prepare_error', {
            'url': url,
            'position': videoAdUnit.getVideo().getPosition()
        });
    }

    public static onSeekToError(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit, url: string) {
        nativeBridge.Sdk.logError('Unity Ads video player seek to error '  + url);

        this.handleVideoError(nativeBridge, videoAdUnit);

        Diagnostics.trigger('video_player_seek_to_error', {
            'url': url,
            'position': videoAdUnit.getVideo().getPosition()
        });
    }

    public static onPauseError(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit, url: string) {
        nativeBridge.Sdk.logError('Unity Ads video player pause error '  + url);

        this.handleVideoError(nativeBridge, videoAdUnit);

        Diagnostics.trigger('video_player_pause_error', {
            'url': url,
            'position': videoAdUnit.getVideo().getPosition()
        });
    }

    public static onIllegalStateError(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit) {
        nativeBridge.Sdk.logError('Unity Ads video player illegal state error');

        this.handleVideoError(nativeBridge, videoAdUnit);

        Diagnostics.trigger('video_player_illegal_state_error', {
            'position': videoAdUnit.getVideo().getPosition()
        });
    }

    protected static afterVideoCompleted(adUnit: VideoAdUnit) {
        adUnit.getContainer().reconfigure(ViewConfiguration.ENDSCREEN);

        const overlay = adUnit.getOverlay();
        if(overlay) {
            overlay.hide();
        }
        adUnit.onFinish.trigger();
    }

    protected static updateViewsOnVideoError(videoAdUnit: VideoAdUnit) {
        videoAdUnit.getContainer().reconfigure(ViewConfiguration.ENDSCREEN);
    }

    private static handleVideoError(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit) {
        videoAdUnit.getVideo().setErrorStatus(true);
        videoAdUnit.getVideo().setActive(false);
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
