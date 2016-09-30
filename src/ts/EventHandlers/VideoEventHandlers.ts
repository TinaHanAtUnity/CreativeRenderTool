import { Double } from 'Utilities/Double';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
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
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';

export class VideoEventHandlers {

    public static onVideoPrepared(nativeBridge: NativeBridge, adUnit: AbstractAdUnit, videoAdUnit: VideoAdUnit, duration: number, metaData: MetaData): void {
        const overlay = videoAdUnit.getOverlay();

        videoAdUnit.setVideoDuration(duration);
        if(overlay) {
            overlay.setVideoDuration(duration);
            if(videoAdUnit.getVideoPosition() > 0) {
                overlay.setVideoProgress(videoAdUnit.getVideoPosition());
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
            if(videoAdUnit.getVideoPosition() > 0) {
                nativeBridge.VideoPlayer.seekTo(videoAdUnit.getVideoPosition()).then(() => {
                    nativeBridge.VideoPlayer.play();
                });
            } else {
                nativeBridge.VideoPlayer.play();
            }
        });
    }

    public static onVideoProgress(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: AbstractAdUnit, videoAdUnit: VideoAdUnit, position: number): void {
        // todo: video progress event should be handled here and not delegated to session manager
        sessionManager.sendProgress(adUnit, sessionManager.getSession(), position, videoAdUnit.getVideoPosition());

        const overlay = videoAdUnit.getOverlay();
        if(position > 0) {
            let lastPosition = videoAdUnit.getVideoPosition();

            // consider all leaps more than one million milliseconds (slightly more than 2,5 hours)
            // bugs in native videoplayer that should be ignored, these have been seen in some Android 7 devices
            let ignoreTreshold: number = lastPosition + 1000000;
            if(position > ignoreTreshold) {
                nativeBridge.Sdk.logError('Unity Ads video player ignoring too large progress from ' + lastPosition + ' to ' + position);

                let error: DiagnosticError = new DiagnosticError(new Error('Too large progress in video player'), {
                    position: position,
                    lastPosition: lastPosition,
                    duration: videoAdUnit.getVideoDuration()
                });
                Diagnostics.trigger({
                    type: 'video_player_too_large_progress',
                    error: error
                });

                return;
            }

            if(position === lastPosition) {
                let repeats: number = videoAdUnit.getVideoPositionRepeats();
                let repeatTreshold: number = 5000 / videoAdUnit.getProgressInterval();

                // if video player has been repeating the same video position for more than 5000 milliseconds, video player is stuck
                if(repeats > repeatTreshold) {
                    nativeBridge.Sdk.logError('Unity Ads video player stuck to ' + position + 'ms position');
                    this.handleVideoError(nativeBridge, videoAdUnit);

                    let error: DiagnosticError = new DiagnosticError(new Error('Video player stuck'), {
                        repeats: repeats,
                        position: position,
                        duration: videoAdUnit.getVideoDuration()
                    });
                    Diagnostics.trigger({
                        type: 'video_player_stuck',
                        error: error
                    });

                    return;
                } else {
                    videoAdUnit.setVideoPositionRepeats(repeats + 1);
                }
            } else {
                videoAdUnit.setVideoPositionRepeats(0);
            }

            if (overlay) {
                if(lastPosition > 0 && position - lastPosition < 100) {
                    overlay.setSpinnerEnabled(true);
                } else {
                    overlay.setSpinnerEnabled(false);
                }
            }

            let previousQuartile: number = videoAdUnit.getVideoQuartile();
            videoAdUnit.setVideoPosition(position);

            if(previousQuartile === 0 && videoAdUnit.getVideoQuartile() === 1) {
                sessionManager.sendFirstQuartile(adUnit);
            } else if(previousQuartile === 1 && videoAdUnit.getVideoQuartile() === 2) {
                sessionManager.sendMidpoint(adUnit);
            } else if(previousQuartile === 2 && videoAdUnit.getVideoQuartile() === 3) {
                sessionManager.sendThirdQuartile(adUnit);
            }
        }

        if(overlay) {
            overlay.setVideoProgress(position);
        }
    }

    public static onVideoStart(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: AbstractAdUnit, videoAdUnit: VideoAdUnit): void {
        sessionManager.sendImpressionEvent(adUnit);
        sessionManager.sendStart(adUnit);

        const overlay = videoAdUnit.getOverlay();
        if(overlay) {
            overlay.setSpinnerEnabled(false);
        }
        nativeBridge.VideoPlayer.setProgressEventInterval(videoAdUnit.getProgressInterval());

        if(videoAdUnit.getWatches() === 0) {
            // send start callback only for first watch, never for rewatches
            nativeBridge.Listener.sendStartEvent(adUnit.getPlacement().getId());
        }

        videoAdUnit.newWatch();
    }

    public static onVideoCompleted(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: AbstractAdUnit, videoAdUnit: VideoAdUnit, metaData: MetaData): void {
        videoAdUnit.setVideoActive(false);
        videoAdUnit.setFinishState(FinishState.COMPLETED);
        sessionManager.sendView(adUnit);

        if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.IosAdUnit.setViews(['webview']);
        } else {
            nativeBridge.AndroidAdUnit.setViews(['webview']);
        }

        this.afterVideoCompleted(nativeBridge, videoAdUnit);

        metaData.get<boolean>('integration_test', false).then(([found, integrationTest]) => {
            if(found && integrationTest) {
                if(nativeBridge.getPlatform() === Platform.ANDROID) {
                    nativeBridge.rawInvoke('com.unity3d.ads.test.integration.IntegrationTest', 'onVideoCompleted', [adUnit.getPlacement().getId()]);
                } else {
                    nativeBridge.rawInvoke('UADSIntegrationTest', 'onVideoCompleted', [adUnit.getPlacement().getId()]);
                }
            }
        });
    }

    public static onAndroidGenericVideoError(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit, what: number, extra: number, url: string) {
        nativeBridge.Sdk.logError('Unity Ads video player error ' + ' ' + what + ' ' + extra + ' ' + url);

        this.handleVideoError(nativeBridge, videoAdUnit);

        Diagnostics.trigger({
            'type': 'video_player_generic_error',
            'url': url,
            'error': {
                'what': what,
                'extra': extra
            }
        });
    }

    public static onIosGenericVideoError(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit, url: string, description: string) {
        nativeBridge.Sdk.logError('Unity Ads video player generic error '  + url + ' ' + description);

        this.handleVideoError(nativeBridge, videoAdUnit);

        Diagnostics.trigger({
            'type': 'video_player_generic_error',
            'url': url,
            'error': {
                'description': description
            }
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

    public static onPauseError(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit, url: string) {
        nativeBridge.Sdk.logError('Unity Ads video player pause error '  + url);

        this.handleVideoError(nativeBridge, videoAdUnit);

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

    protected static afterVideoCompleted(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit) {
        const overlay = videoAdUnit.getOverlay();
        if(overlay) {
            overlay.hide();
        }
        videoAdUnit.onVideoFinish.trigger();

        if(nativeBridge.getPlatform() === Platform.ANDROID) {
            nativeBridge.AndroidAdUnit.setOrientation(ScreenOrientation.SCREEN_ORIENTATION_FULL_SENSOR);
        } else if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.IosAdUnit.setSupportedOrientations(UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL);
        }
    };

    private static handleVideoError(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit) {
        videoAdUnit.setVideoActive(false);
        videoAdUnit.setFinishState(FinishState.ERROR);
        nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.VIDEO_PLAYER_ERROR], 'Video player error');

        if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.IosAdUnit.setViews(['webview']);
        } else {
            nativeBridge.AndroidAdUnit.setViews(['webview']);
        }

        const overlay = videoAdUnit.getOverlay();
        if(overlay) {
            overlay.hide();
        }

        videoAdUnit.onVideoError.trigger();
        videoAdUnit.onVideoFinish.trigger();
    }
}
