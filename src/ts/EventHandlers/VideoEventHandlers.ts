import { Double } from 'Utilities/Double';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { FinishState } from 'Constants/FinishState';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { Platform } from 'Constants/Platform';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { UIInterfaceOrientationMask } from 'Constants/iOS/UIInterfaceOrientationMask';
import { MetaData } from 'Utilities/MetaData';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Overlay } from 'Views/Overlay';

export class VideoEventHandlers {

    public static onVideoPrepared(nativeBridge: NativeBridge, adUnit: VideoAdUnit, duration: number, metaData: MetaData): void {
        if(adUnit.getVideoErrorStatus()) {
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
            Diagnostics.trigger({
                type: 'video_too_long',
                error: error
            });
        }

        const overlay = adUnit.getOverlay();

        adUnit.setVideoDuration(duration);
        if(overlay) {
            overlay.setVideoDuration(duration);
            if(adUnit.getVideoPosition() > 0) {
                overlay.setVideoProgress(adUnit.getVideoPosition());
            }
            if(overlay instanceof Overlay && adUnit.getPlacement().allowSkip()) {
                (<Overlay>overlay).setSkipVisible(true);
            }
            overlay.setMuteEnabled(true);
            overlay.setVideoDurationEnabled(true);

            if (adUnit instanceof VastAdUnit && (<VastAdUnit>adUnit).getVideoClickThroughURL()) {
                overlay.setCallButtonVisible(true);
            }
        }

        metaData.get<boolean>('test.debugOverlayEnabled', false).then(([found, debugOverlayEnabled]) => {
            if(found && debugOverlayEnabled && overlay) {
                overlay.setDebugMessageVisible(true);
                let debugMessage = '';
                if (adUnit instanceof VastAdUnit) {
                    debugMessage = 'Programmatic Ad';
                } else {
                    debugMessage = 'Performance Ad';
                }
                overlay.setDebugMessage(debugMessage);
            }
        });

        nativeBridge.VideoPlayer.setVolume(new Double(overlay && overlay.isMuted() ? 0.0 : 1.0)).then(() => {
            if(adUnit.getVideoPosition() > 0) {
                nativeBridge.VideoPlayer.seekTo(adUnit.getVideoPosition()).then(() => {
                    nativeBridge.VideoPlayer.play();
                });
            } else {
                nativeBridge.VideoPlayer.play();
            }
        });
    }

    public static onVideoProgress(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit, position: number): void {
        if(position > 0 && !adUnit.isVideoStarted()) {
            adUnit.setVideoStarted(true);

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
                adUnit.getVideoPosition());
        }

        const overlay = adUnit.getOverlay();
        if(position >= 0) {
            const lastPosition = adUnit.getVideoPosition();

            // consider all leaps more than one million milliseconds (slightly more than 2,5 hours)
            // bugs in native videoplayer that should be ignored, these have been seen in some Android 7 devices
            const ignoreTreshold: number = lastPosition + 1000000;
            if(position > ignoreTreshold) {
                nativeBridge.Sdk.logError('Unity Ads video player ignoring too large progress from ' + lastPosition + ' to ' + position);

                const error: DiagnosticError = new DiagnosticError(new Error('Too large progress in video player'), {
                    position: position,
                    lastPosition: lastPosition,
                    duration: adUnit.getVideoDuration()
                });
                Diagnostics.trigger({
                    type: 'video_player_too_large_progress',
                    error: error
                });

                return;
            }

            if(position === lastPosition) {
                const repeats: number = adUnit.getVideoPositionRepeats();
                const repeatTreshold: number = 5000 / adUnit.getProgressInterval();

                // if video player has been repeating the same video position for more than 5000 milliseconds, video player is stuck
                if(repeats > repeatTreshold) {
                    nativeBridge.Sdk.logError('Unity Ads video player stuck to ' + position + 'ms position');
                    this.handleVideoError(nativeBridge, adUnit);

                    const error: DiagnosticError = new DiagnosticError(new Error('Video player stuck'), {
                        repeats: repeats,
                        position: position,
                        duration: adUnit.getVideoDuration()
                    });
                    Diagnostics.trigger({
                        type: 'video_player_stuck',
                        error: error
                    });

                    return;
                } else {
                    adUnit.setVideoPositionRepeats(repeats + 1);
                }
            } else {
                adUnit.setVideoPositionRepeats(0);
            }

            if (overlay) {
                if(lastPosition > 0 && position - lastPosition < 100) {
                    overlay.setSpinnerEnabled(true);
                } else {
                    overlay.setSpinnerEnabled(false);
                }
            }

            const previousQuartile: number = adUnit.getVideoQuartile();
            adUnit.setVideoPosition(position);

            if(previousQuartile === 0 && adUnit.getVideoQuartile() === 1) {
                sessionManager.sendFirstQuartile(adUnit);
            } else if(previousQuartile === 1 && adUnit.getVideoQuartile() === 2) {
                sessionManager.sendMidpoint(adUnit);
            } else if(previousQuartile === 2 && adUnit.getVideoQuartile() === 3) {
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

    public static onVideoCompleted(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit, metaData: MetaData): void {
        adUnit.setVideoActive(false);
        adUnit.setFinishState(FinishState.COMPLETED);
        sessionManager.sendView(adUnit);

        if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.IosAdUnit.setViews(['webview']);
        } else {
            nativeBridge.AndroidAdUnit.setViews(['webview']);
        }

        this.afterVideoCompleted(nativeBridge, adUnit);
    }

    public static onAndroidGenericVideoError(nativeBridge: NativeBridge, adUnit: VideoAdUnit, what: number, extra: number, url: string) {
        nativeBridge.Sdk.logError('Unity Ads video player error ' + ' ' + what + ' ' + extra + ' ' + url);

        this.handleVideoError(nativeBridge, adUnit);

        Diagnostics.trigger({
            'type': 'video_player_generic_error',
            'url': url,
            'error': {
                'what': what,
                'extra': extra
            }
        });
    }

    public static onIosGenericVideoError(nativeBridge: NativeBridge, adUnit: VideoAdUnit, url: string, description: string) {
        nativeBridge.Sdk.logError('Unity Ads video player generic error '  + url + ' ' + description);

        this.handleVideoError(nativeBridge, adUnit);

        Diagnostics.trigger({
            'type': 'video_player_generic_error',
            'url': url,
            'error': {
                'description': description
            }
        });
    }

    public static onVideoPrepareTimeout(nativeBridge: NativeBridge, adUnit: VideoAdUnit, url: string): void {
        nativeBridge.Sdk.logError('Unity Ads video player prepare timeout '  + url);

        this.handleVideoError(nativeBridge, adUnit);

        Diagnostics.trigger({
            'type': 'video_player_prepare_timeout',
            'url': url
        });
    }

    public static onPrepareError(nativeBridge: NativeBridge, adUnit: VideoAdUnit, url: string) {
        nativeBridge.Sdk.logError('Unity Ads video player prepare error '  + url);

        this.handleVideoError(nativeBridge, adUnit);

        Diagnostics.trigger({
            'type': 'video_player_prepare_error',
            'url': url
        });
    }

    public static onSeekToError(nativeBridge: NativeBridge, adUnit: VideoAdUnit, url: string) {
        nativeBridge.Sdk.logError('Unity Ads video player seek to error '  + url);

        this.handleVideoError(nativeBridge, adUnit);

        Diagnostics.trigger({
            'type': 'video_player_seek_to_error',
            'url': url
        });
    }

    public static onPauseError(nativeBridge: NativeBridge, adUnit: VideoAdUnit, url: string) {
        nativeBridge.Sdk.logError('Unity Ads video player pause error '  + url);

        this.handleVideoError(nativeBridge, adUnit);

        Diagnostics.trigger({
            'type': 'video_player_pause_error',
            'url': url
        });
    }

    public static onIllegalStateError(nativeBridge: NativeBridge, adUnit: VideoAdUnit) {
        nativeBridge.Sdk.logError('Unity Ads video player illegal state error');

        this.handleVideoError(nativeBridge, adUnit);

        Diagnostics.trigger({
            'type': 'video_player_illegal_state_error'
        });
    }

    protected static afterVideoCompleted(nativeBridge: NativeBridge, adUnit: VideoAdUnit) {
        const overlay = adUnit.getOverlay();
        if(overlay) {
            overlay.hide();
        }
        adUnit.onVideoFinish.trigger();

        if(nativeBridge.getPlatform() === Platform.ANDROID) {
            nativeBridge.AndroidAdUnit.setOrientation(ScreenOrientation.SCREEN_ORIENTATION_FULL_SENSOR);
        } else if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.IosAdUnit.setSupportedOrientations(UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL);
        }
    };

    private static handleVideoError(nativeBridge: NativeBridge, adUnit: VideoAdUnit) {
        adUnit.setVideoErrorStatus(true);
        adUnit.setVideoActive(false);
        adUnit.setFinishState(FinishState.ERROR);
        nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.VIDEO_PLAYER_ERROR], 'Video player error');

        if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.IosAdUnit.setViews(['webview']);
        } else {
            nativeBridge.AndroidAdUnit.setViews(['webview']);
        }

        const overlay = adUnit.getOverlay();
        if(overlay) {
            overlay.hide();
        }

        adUnit.onVideoError.trigger();
        adUnit.onVideoFinish.trigger();
    }
}
