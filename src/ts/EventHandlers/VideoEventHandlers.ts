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

export class VideoEventHandlers {

    public static isVast(arg: any): arg is VastAdUnit {
        return arg.getVast !== undefined;
    }

    public static onVideoPrepared(nativeBridge: NativeBridge, adUnit: VideoAdUnit, duration: number, metaData: MetaData): void {
        let overlay = adUnit.getOverlay();

        adUnit.setVideoDuration(duration);
        overlay.setVideoDuration(duration);
        if(adUnit.getVideoPosition() > 0) {
            overlay.setVideoProgress(adUnit.getVideoPosition());
        }
        if(adUnit.getPlacement().allowSkip()) {
            overlay.setSkipVisible(true);
        }
        overlay.setMuteEnabled(true);
        overlay.setVideoDurationEnabled(true);

        if (this.isVast(adUnit) && adUnit.getVideoClickThroughURL()) {
            overlay.setCallButtonVisible(true);
        }

        metaData.get<boolean>('test.debugOverlayEnabled', false).then(([found, debugOverlayEnabled]) => {
            if(found && debugOverlayEnabled) {
                overlay.setDebugMessageVisible(true);
                let debugMessage = '';
                if (this.isVast(adUnit)) {
                    debugMessage = 'Programmatic Ad';
                } else {
                    debugMessage = 'Performance Ad';
                }
                overlay.setDebugMessage(debugMessage);
            }
        });

        nativeBridge.VideoPlayer.setVolume(new Double(overlay.isMuted() ? 0.0 : 1.0)).then(() => {
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
        // todo: video progress event should be handled here and not delegated to session manager
        sessionManager.sendProgress(adUnit, sessionManager.getSession(), position, adUnit.getVideoPosition());

        if(position > 0) {
            let lastPosition = adUnit.getVideoPosition();

            // consider all leaps more than one million milliseconds (slightly more than 2,5 hours)
            // bugs in native videoplayer that should be ignored, these have been seen in some Android 7 devices
            let ignoreTreshold: number = lastPosition + 1000000;
            if(position > ignoreTreshold) {
                nativeBridge.Sdk.logError('Unity Ads video player ignoring too large progress from ' + lastPosition + ' to ' + position);

                let error: DiagnosticError = new DiagnosticError(new Error('Too large progress in video player'), {
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
                let repeats: number = adUnit.getVideoPositionRepeats();
                let repeatTreshold: number = 5000 / adUnit.getProgressInterval();

                // if video player has been repeating the same video position for more than 5000 milliseconds, video player is stuck
                if(repeats > repeatTreshold) {
                    nativeBridge.Sdk.logError('Unity Ads video player stuck to ' + position + 'ms position');
                    this.handleVideoError(nativeBridge, adUnit);

                    let error: DiagnosticError = new DiagnosticError(new Error('Video player stuck'), {
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

            if(lastPosition > 0 && position - lastPosition < 100) {
                adUnit.getOverlay().setSpinnerEnabled(true);
            } else {
                adUnit.getOverlay().setSpinnerEnabled(false);
            }

            let previousQuartile: number = adUnit.getVideoQuartile();
            adUnit.setVideoPosition(position);

            if(previousQuartile === 0 && adUnit.getVideoQuartile() === 1) {
                sessionManager.sendFirstQuartile(adUnit);
            } else if(previousQuartile === 1 && adUnit.getVideoQuartile() === 2) {
                sessionManager.sendMidpoint(adUnit);
            } else if(previousQuartile === 2 && adUnit.getVideoQuartile() === 3) {
                sessionManager.sendThirdQuartile(adUnit);
            }
        }

        adUnit.getOverlay().setVideoProgress(position);
    }

    public static onVideoStart(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit): void {
        sessionManager.sendImpressionEvent(adUnit);
        sessionManager.sendStart(adUnit);

        adUnit.getOverlay().setSpinnerEnabled(false);
        nativeBridge.VideoPlayer.setProgressEventInterval(adUnit.getProgressInterval());

        if(adUnit.getWatches() === 0) {
            // send start callback only for first watch, never for rewatches
            nativeBridge.Listener.sendStartEvent(adUnit.getPlacement().getId());
        }

        adUnit.newWatch();
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
        adUnit.getOverlay().hide();
        let endScreen = adUnit.getEndScreen();
        if(endScreen) {
            endScreen.show();
        }
        adUnit.onNewAdRequestAllowed.trigger();

        if(nativeBridge.getPlatform() === Platform.ANDROID) {
            nativeBridge.AndroidAdUnit.setOrientation(ScreenOrientation.SCREEN_ORIENTATION_FULL_SENSOR);
        } else if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.IosAdUnit.setSupportedOrientations(UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL);
        }
    };

    private static handleVideoError(nativeBridge: NativeBridge, adUnit: VideoAdUnit) {
        adUnit.setVideoActive(false);
        adUnit.setFinishState(FinishState.ERROR);
        nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.VIDEO_PLAYER_ERROR], 'Video player error');

        if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.IosAdUnit.setViews(['webview']);
        } else {
            nativeBridge.AndroidAdUnit.setViews(['webview']);
        }

        adUnit.getOverlay().hide();

        let endScreen = adUnit.getEndScreen();
        if(endScreen) {
            endScreen.show();
        }

        adUnit.onNewAdRequestAllowed.trigger();
    }
}
