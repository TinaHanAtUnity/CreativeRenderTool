import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import {
    AdUnitContainerSystemMessage,
    IAdUnitContainerListener,
    Orientation
} from 'Ads/AdUnits/Containers/AdUnitContainer';
import { Video } from 'Ads/Models/Assets/Video';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { CampaignAssetInfo, VideoType } from 'Ads/Utilities/CampaignAssetInfo';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { WebViewError } from 'Core/Errors/WebViewError';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Double } from 'Core/Utilities/Double';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';

export interface IVideoAdUnitParameters<T extends Campaign> extends IAdUnitParameters<T> {
    video: Video;
    overlay: AbstractVideoOverlay;
}

export enum VideoState {
    NOT_READY,
    PREPARING,
    READY,
    PLAYING,
    PAUSED,
    COMPLETED,
    SKIPPED,
    ERRORED
}

export abstract class VideoAdUnit<T extends Campaign = Campaign> extends AbstractAdUnit implements IAdUnitContainerListener {

    private static _progressInterval: number = 250;

    protected _options: unknown;
    protected _deviceInfo: DeviceInfo;
    protected _overlay: AbstractVideoOverlay | undefined;
    private _video: Video;
    private _active: boolean;
    private _lowMemory: boolean;
    private _prepareCalled: boolean;
    private _videoReady: boolean;
    private _placement: Placement;
    private _campaign: T;
    private _finalVideoUrl: string;
    private _videoState: VideoState = VideoState.NOT_READY;
    private _clientInfo: ClientInfo;

    constructor(parameters: IVideoAdUnitParameters<T>) {
        super(parameters);

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

    public abstract onVideoError(): void;

    public show(): Promise<void> {
        this.setShowing(true);
        this.setActive(true);

        this._container.addEventHandler(this);

        return this._container.open(this, ['videoplayer', 'webview'], true, this.getForceOrientation(), this._placement.disableBackButton(), false, true, false, this._options).then(() => {
            this.onStart.trigger();
        });
    }

    public hide(): Promise<void> {
        if(!this.isShowing()) {
            return Promise.resolve();
        }

        this.setShowing(false);
        this.hideChildren();
        this.unsetReferences();

        this._ads.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());
        this._container.removeEventHandler(this);

        return this._container.close().then(() => {
            this.onClose.trigger();
        });
    }

    public setVideoState(videoState: VideoState): void {
        this._videoState = videoState;
    }

    public getVideoState(): VideoState {
        return this._videoState;
    }

    public canShowVideo(): boolean {
        return this.getVideoState() !== VideoState.ERRORED && this.getVideoState() !== VideoState.COMPLETED && this.getVideoState() !== VideoState.SKIPPED;
    }

    public canPlayVideo(): boolean {
        return (this.getVideoState() === VideoState.READY || this.getVideoState() === VideoState.PLAYING || this.getVideoState() === VideoState.PAUSED);
    }

    public canPrepareVideo(): boolean {
        return this.canShowVideo() && this.getVideoState() === VideoState.NOT_READY;
    }

    public getOverlay(): AbstractVideoOverlay | undefined {
        return this._overlay;
    }

    public getProgressInterval(): number {
        return VideoAdUnit._progressInterval;
    }

    public getVideo(): Video {
        return this._video;
    }

    public isActive() {
        return this._active;
    }

    public setActive(value: boolean) {
        this._active = value;
    }

    public getVideoOrientation(): 'landscape' | 'portrait' | undefined {
        let videoOrientation: 'landscape' | 'portrait' | undefined = 'landscape';
        const portraitVideo = CampaignAssetInfo.getPortraitVideo(this._campaign);
        if(portraitVideo && this._finalVideoUrl === portraitVideo.getUrl()) {
            videoOrientation = 'portrait';
        }

        this._core.Sdk.logDebug('Returning ' + videoOrientation + ' as video orientation for locked orientation ' + Orientation[this._container.getLockedOrientation()]);

        return videoOrientation;
    }

    public isLowMemory(): boolean {
        return this._lowMemory;
    }

    public onContainerShow(): void {
        if(this.isShowing() && this.isActive()) {
            if(this._platform === Platform.IOS && IosUtils.hasVideoStallingApi(this._deviceInfo.getOsVersion())) {
                if(this.getVideo().isCached()) {
                    this._ads.VideoPlayer.setAutomaticallyWaitsToMinimizeStalling(false);
                } else {
                    this._ads.VideoPlayer.setAutomaticallyWaitsToMinimizeStalling(true);
                }
            }

            this.prepareVideo();
        }
    }

    public onContainerDestroy(): void {
        if(this.isShowing()) {
            this.setActive(false);
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    public onContainerBackground(): void {
        if(this.isShowing() && CustomFeatures.isSimejiJapaneseKeyboardApp(this._clientInfo.getGameId())) {
            this.setActive(false);
            this.setFinishState(FinishState.SKIPPED);
            this.setVideoState(VideoState.SKIPPED);
            this.hide();
            return;
        }

        if(this.isShowing() && this.getContainer().isPaused()) {
            this.setActive(false);
            if(this.canShowVideo()) {
                this.setVideoState(VideoState.PAUSED);
                /*
                    We try pause the video-player and if we get a VIDEOVIEW_NULL error
                    we'll know that the video-player has been destroyed. In this case
                    set the video not ready so that the onContainerForeground can
                    re-prepare the video.
                */
                this._ads.VideoPlayer.pause().catch((error) => {
                    if(error === 'VIDEOVIEW_NULL') {
                        this.setVideoState(VideoState.NOT_READY);
                    }
                });
            }
        }
    }

    public isAppSheetOpen(): boolean {
        return false;
    }

    public onContainerForeground(): void {
        if(this.isShowing() && !this.isActive() && !this.getContainer().isPaused()) {
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
            } else if(this.canPrepareVideo()) {
                this.prepareVideo();
            }
        }
    }

    public onContainerSystemMessage(message: AdUnitContainerSystemMessage): void {
        switch(message) {
            case AdUnitContainerSystemMessage.MEMORY_WARNING:
                if(this.isShowing()) {
                    this._lowMemory = true;
                }
                break;

            case AdUnitContainerSystemMessage.AUDIO_SESSION_INTERRUPT_BEGAN:
                if(this.isShowing() && this.isActive() && this.getVideoState() === VideoState.PLAYING) {
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

    protected unsetReferences() {
        delete this._overlay;
    }

    protected prepareOverlay() {
        const overlay = this.getOverlay();

        if(overlay) {
            overlay.render();
            document.body.appendChild(overlay.container());

            if(!this._placement.allowSkip()) {
                overlay.setSkipEnabled(false);
            } else {
                overlay.setSkipEnabled(true);
                overlay.setSkipDuration(this._placement.allowSkipInSeconds());
            }
        }
    }

    protected hideChildren() {
        const overlay = this.getOverlay();

        if(overlay) {
            overlay.hide();
            const container = overlay.container();
            if(container && container.parentElement) {
                container.parentElement.removeChild(container);
            }
        }
    }

    private prepareVideo() {
        this.setVideoState(VideoState.PREPARING);
        this.getValidVideoUrl().then(url => {
            this._finalVideoUrl = url;
            this._ads.VideoPlayer.prepare(url, new Double(this._placement.muteVideo() ? 0 : 1), 10000);
        });
    }

    // todo: this is first attempt to get rid of around 1% of failed starts
    // if this approach is successful, this should somehow be refactored as part of AssetManager to validate
    // other things too, like endscreen assets
    private getValidVideoUrl(): Promise<string> {
        let streamingUrl: string = this.getVideo().getOriginalUrl();

        if(this._campaign instanceof PerformanceCampaign || this._campaign instanceof XPromoCampaign) {
            // Should this use this._container.getLockedOrientation() instead?
            const orientedStreamingVideo = CampaignAssetInfo.getOrientedVideo(this._campaign, this.getForceOrientation(), VideoType.STREAM);
            if(!orientedStreamingVideo) {
                throw new WebViewError('Unable to fallback to an oriented streaming video');
            }

            streamingUrl = orientedStreamingVideo.getOriginalUrl();
        }

        // check that if we think video has been cached, it is still available on device cache directory
        return Promise.resolve().then(() => {
            if(this.getVideo().isCached() && this.getVideo().getFileId()) {
                return this._core.Cache.getFileInfo(<string>this.getVideo().getFileId()).then(result => {
                    if(result.found) {
                        const remoteVideoSize: number | undefined = this.getVideo().getSize();
                        if(remoteVideoSize && remoteVideoSize !== result.size) {
                            SessionDiagnostics.trigger('video_size_mismatch', {
                                remoteVideoSize: remoteVideoSize,
                                localVideoSize: result.size
                            }, this._campaign.getSession());

                            // this condition is most commonly triggered on Android that probably has some unknown issue with resuming downloads
                            // if comet has given video size that does not match local file size, use streaming fallback
                            return streamingUrl;
                        }

                        return this.getVideo().getUrl();
                    } else {
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
            } else {
                return this.getVideo().getUrl();
            }
        });
    }
}
