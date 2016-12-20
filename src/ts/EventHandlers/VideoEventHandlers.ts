import { Double } from 'Utilities/Double';
import { VideoAdUnitController } from 'AdUnits/VideoAdUnitController';
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

export class VideoEventHandlers {

    public static onVideoPrepared(nativeBridge: NativeBridge, adUnit: VideoAdUnit, duration: number, metaData: MetaData): void {
        if(adUnit.getVideoAdUnitController().getVideoErrorStatus()) {
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

        const overlay = adUnit.getVideoAdUnitController().getOverlay();

        adUnit.getVideoAdUnitController().setVideoDuration(duration);
        if(overlay) {
            overlay.setVideoDuration(duration);
            if(adUnit.getVideoAdUnitController().getVideoPosition() > 0) {
                overlay.setVideoProgress(adUnit.getVideoAdUnitController().getVideoPosition());
            }
            if(adUnit.getPlacement().allowSkip()) {
                overlay.setSkipVisible(true);
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
            if(adUnit.getVideoAdUnitController().getVideoPosition() > 0) {
                nativeBridge.VideoPlayer.seekTo(adUnit.getVideoAdUnitController().getVideoPosition()).then(() => {
                    nativeBridge.VideoPlayer.play();
                });
            } else {
                nativeBridge.VideoPlayer.play();
            }
        });
    }

    public static onVideoProgress(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit, position: number): void {
        if(position > 0 && !adUnit.getVideoAdUnitController().isVideoStarted()) {
            adUnit.getVideoAdUnitController().setVideoStarted(true);

            sessionManager.sendStart(adUnit);

            const overlay = adUnit.getVideoAdUnitController().getOverlay();
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
                adUnit.getVideoAdUnitController().getVideoPosition());
        }

        const overlay = adUnit.getVideoAdUnitController().getOverlay();
        if(position >= 0) {
            const lastPosition = adUnit.getVideoAdUnitController().getVideoPosition();

            // consider all leaps more than one million milliseconds (slightly more than 2,5 hours)
            // bugs in native videoplayer that should be ignored, these have been seen in some Android 7 devices
            const ignoreTreshold: number = lastPosition + 1000000;
            if(position > ignoreTreshold) {
                nativeBridge.Sdk.logError('Unity Ads video player ignoring too large progress from ' + lastPosition + ' to ' + position);

                const error: DiagnosticError = new DiagnosticError(new Error('Too large progress in video player'), {
                    position: position,
                    lastPosition: lastPosition,
                    duration: adUnit.getVideoAdUnitController().getVideoDuration()
                });
                Diagnostics.trigger({
                    type: 'video_player_too_large_progress',
                    error: error
                });

                return;
            }

            if(position === lastPosition) {
                const repeats: number = adUnit.getVideoAdUnitController().getVideoPositionRepeats();
                const repeatTreshold: number = 5000 / adUnit.getVideoAdUnitController().getProgressInterval();

                // if video player has been repeating the same video position for more than 5000 milliseconds, video player is stuck
                if(repeats > repeatTreshold) {
                    nativeBridge.Sdk.logError('Unity Ads video player stuck to ' + position + 'ms position');
                    this.handleVideoError(nativeBridge, adUnit.getVideoAdUnitController());

                    const error: DiagnosticError = new DiagnosticError(new Error('Video player stuck'), {
                        repeats: repeats,
                        position: position,
                        duration: adUnit.getVideoAdUnitController().getVideoDuration()
                    });
                    Diagnostics.trigger({
                        type: 'video_player_stuck',
                        error: error
                    });

                    return;
                } else {
                    adUnit.getVideoAdUnitController().setVideoPositionRepeats(repeats + 1);
                }
            } else {
                adUnit.getVideoAdUnitController().setVideoPositionRepeats(0);
            }

            if (overlay) {
                if(lastPosition > 0 && position - lastPosition < 100) {
                    overlay.setSpinnerEnabled(true);
                } else {
                    overlay.setSpinnerEnabled(false);
                }
            }

            const previousQuartile: number = adUnit.getVideoAdUnitController().getVideoQuartile();
            adUnit.getVideoAdUnitController().setVideoPosition(position);

            if(previousQuartile === 0 && adUnit.getVideoAdUnitController().getVideoQuartile() === 1) {
                sessionManager.sendFirstQuartile(adUnit);
            } else if(previousQuartile === 1 && adUnit.getVideoAdUnitController().getVideoQuartile() === 2) {
                sessionManager.sendMidpoint(adUnit);
            } else if(previousQuartile === 2 && adUnit.getVideoAdUnitController().getVideoQuartile() === 3) {
                sessionManager.sendThirdQuartile(adUnit);
            }
        }

        if(overlay) {
            overlay.setVideoProgress(position);
        }
    }

    public static onVideoPlay(nativeBridge: NativeBridge, adUnit: VideoAdUnit): void {
        nativeBridge.VideoPlayer.setProgressEventInterval(adUnit.getVideoAdUnitController().getProgressInterval());
    }

    public static onVideoCompleted(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit, metaData: MetaData): void {
        adUnit.getVideoAdUnitController().setVideoActive(false);
        adUnit.getVideoAdUnitController().setFinishState(FinishState.COMPLETED);
        sessionManager.sendView(adUnit);

        if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.IosAdUnit.setViews(['webview']);
        } else {
            nativeBridge.AndroidAdUnit.setViews(['webview']);
        }

        this.afterVideoCompleted(nativeBridge, adUnit.getVideoAdUnitController());
    }

    public static onAndroidGenericVideoError(nativeBridge: NativeBridge, videoAdUnitController: VideoAdUnitController, what: number, extra: number, url: string) {
        nativeBridge.Sdk.logError('Unity Ads video player error ' + ' ' + what + ' ' + extra + ' ' + url);

        this.handleVideoError(nativeBridge, videoAdUnitController);

        Diagnostics.trigger({
            'type': 'video_player_generic_error',
            'url': url,
            'error': {
                'what': what,
                'extra': extra
            }
        });
    }

    public static onIosGenericVideoError(nativeBridge: NativeBridge, videoAdUnitController: VideoAdUnitController, url: string, description: string) {
        nativeBridge.Sdk.logError('Unity Ads video player generic error '  + url + ' ' + description);

        this.handleVideoError(nativeBridge, videoAdUnitController);

        Diagnostics.trigger({
            'type': 'video_player_generic_error',
            'url': url,
            'error': {
                'description': description
            }
        });
    }

    public static onVideoPrepareTimeout(nativeBridge: NativeBridge, videoAdUnitController: VideoAdUnitController, url: string): void {
        nativeBridge.Sdk.logError('Unity Ads video player prepare timeout '  + url);

        this.handleVideoError(nativeBridge, videoAdUnitController);

        Diagnostics.trigger({
            'type': 'video_player_prepare_timeout',
            'url': url
        });
    }

    public static onPrepareError(nativeBridge: NativeBridge, videoAdUnitController: VideoAdUnitController, url: string) {
        nativeBridge.Sdk.logError('Unity Ads video player prepare error '  + url);

        this.handleVideoError(nativeBridge, videoAdUnitController);

        Diagnostics.trigger({
            'type': 'video_player_prepare_error',
            'url': url
        });
    }

    public static onSeekToError(nativeBridge: NativeBridge, videoAdUnitController: VideoAdUnitController, url: string) {
        nativeBridge.Sdk.logError('Unity Ads video player seek to error '  + url);

        this.handleVideoError(nativeBridge, videoAdUnitController);

        Diagnostics.trigger({
            'type': 'video_player_seek_to_error',
            'url': url
        });
    }

    public static onPauseError(nativeBridge: NativeBridge, videoAdUnitController: VideoAdUnitController, url: string) {
        nativeBridge.Sdk.logError('Unity Ads video player pause error '  + url);

        this.handleVideoError(nativeBridge, videoAdUnitController);

        Diagnostics.trigger({
            'type': 'video_player_pause_error',
            'url': url
        });
    }

    public static onIllegalStateError(nativeBridge: NativeBridge, videoAdUnitController: VideoAdUnitController) {
        nativeBridge.Sdk.logError('Unity Ads video player illegal state error');

        this.handleVideoError(nativeBridge, videoAdUnitController);

        Diagnostics.trigger({
            'type': 'video_player_illegal_state_error'
        });
    }

    protected static afterVideoCompleted(nativeBridge: NativeBridge, videoAdUnitController: VideoAdUnitController) {
        const overlay = videoAdUnitController.getOverlay();
        if(overlay) {
            overlay.hide();
        }
        videoAdUnitController.onVideoFinish.trigger();

        if(nativeBridge.getPlatform() === Platform.ANDROID) {
            nativeBridge.AndroidAdUnit.setOrientation(ScreenOrientation.SCREEN_ORIENTATION_FULL_SENSOR);
        } else if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.IosAdUnit.setSupportedOrientations(UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL);
        }
    };

    private static handleVideoError(nativeBridge: NativeBridge, videoAdUnitController: VideoAdUnitController) {
        videoAdUnitController.setVideoErrorStatus(true);
        videoAdUnitController.setVideoActive(false);
        videoAdUnitController.setFinishState(FinishState.ERROR);
        nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.VIDEO_PLAYER_ERROR], 'Video player error');

        if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.IosAdUnit.setViews(['webview']);
        } else {
            nativeBridge.AndroidAdUnit.setViews(['webview']);
        }

        const overlay = videoAdUnitController.getOverlay();
        if(overlay) {
            overlay.hide();
        }

        videoAdUnitController.onVideoError.trigger();
        videoAdUnitController.onVideoFinish.trigger();
    }
}
