import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { FinishState } from 'Constants/FinishState';
import { Double } from 'Utilities/Double';
import { Video } from 'Models/Assets/Video';
import { Overlay } from 'Views/Overlay';
import { IosUtils } from 'Utilities/IosUtils';
import { Platform } from 'Constants/Platform';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { WebViewError } from 'Errors/WebViewError';
import { ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Campaign } from 'Models/Campaign';

export interface IVideoAdUnitParameters<T extends Campaign> extends IAdUnitParameters<T> {
    video: Video;
    overlay: Overlay;
}

export abstract class VideoAdUnit<T extends Campaign> extends AbstractAdUnit {

    private static _progressInterval: number = 250;

    protected _onShowObserver: any;
    protected _onSystemKillObserver: any;
    protected _onSystemInterruptObserver: any;
    protected _onLowMemoryWarningObserver: any;

    protected _options: any;
    private _video: Video;
    private _active: boolean;
    private _overlay: Overlay | undefined;
    private _deviceInfo: DeviceInfo;
    private _videoOrientation: 'landscape' | 'portrait' | undefined;
    private _lowMemory: boolean;
    private _prepareCalled: boolean;
    private _videoReady: boolean;

    constructor(nativeBridge: NativeBridge, parameters: IVideoAdUnitParameters<T>) {
        super(nativeBridge, parameters.forceOrientation, parameters.container, parameters.placement, parameters.campaign);

        this._video = parameters.video;
        this._videoReady = false;
        this._active = false;
        this._overlay = parameters.overlay;
        this._deviceInfo = parameters.deviceInfo;
        this._options = parameters.options;
        this._prepareCalled = false;
        this._lowMemory = false;

        this.prepareOverlay();
    }

    public show(): Promise<void> {
        this.setShowing(true);
        this.onStart.trigger();
        this.setActive(true);

        this._onShowObserver = this._container.onShow.subscribe(() => this.onShow());
        this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());
        this._onSystemInterruptObserver = this._container.onSystemInterrupt.subscribe((interruptStarted) => this.onSystemInterrupt(interruptStarted));
        this._onLowMemoryWarningObserver = this._container.onLowMemoryWarning.subscribe(() => this.onLowMemoryWarning());

        return this._container.open(this, true, true, this.getForceOrientation(), this._placement.disableBackButton(), false, true, false, this._options);
    }

    public hide(): Promise<void> {
        if(!this.isShowing()) {
            return Promise.resolve();
        }
        this.setShowing(false);

        this.hideChildren();
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());

        return this._container.close().then(() => {
            this.onClose.trigger();
        });
    }

    public isVideoReady(): boolean {
        return this._videoReady;
    }

    public setVideoReady(ready: boolean): void {
        this._videoReady = ready;
    }

    public isPrepareCalled(): boolean {
        return this._prepareCalled;
    }

    public setPrepareCalled(prepareCalled: boolean): void {
        this._prepareCalled = prepareCalled;
    }

    public isCached(): boolean {
        return this._video.isCached();
    }

    public getOverlay(): Overlay | undefined {
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
        return this._videoOrientation;
    }

    public isLowMemory(): boolean {
        return this._lowMemory;
    }

    protected unsetReferences() {
        delete this._overlay;
    }

    protected prepareOverlay() {
        const overlay = this.getOverlay();

        if(overlay) {
            overlay.render();
            document.body.appendChild(overlay.container());

            if(!this.getPlacement().allowSkip()) {
                overlay.setSkipEnabled(false);
            } else {
                overlay.setSkipEnabled(true);
                overlay.setSkipDuration(this.getPlacement().allowSkipInSeconds());
            }
        }
    }

    protected onShow() {
        if(this.isShowing() && this.isActive()) {
            if(this._nativeBridge.getPlatform() === Platform.IOS && IosUtils.hasVideoStallingApi(this._deviceInfo.getOsVersion())) {
                if(this.getVideo().isCached()) {
                    this._nativeBridge.VideoPlayer.setAutomaticallyWaitsToMinimizeStalling(false);
                } else {
                    this._nativeBridge.VideoPlayer.setAutomaticallyWaitsToMinimizeStalling(true);
                }
            }

            this.getValidVideoUrl().then(url => {
                this.setPrepareCalled(true);
                this._nativeBridge.VideoPlayer.prepare(url, new Double(this._placement.muteVideo() ? 0.0 : 1.0), 10000);
            });
        }
    }

    protected onSystemKill() {
        if(this.isShowing()) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    protected onSystemInterrupt(interruptStarted: boolean): void {
        if(this.isShowing() && this.isActive()) {
            if(interruptStarted) {
                this._nativeBridge.Sdk.logInfo('Pausing Unity Ads video playback due to interrupt');
                this._nativeBridge.VideoPlayer.pause();
            } else if (!interruptStarted && this.isVideoReady() && !this.getContainer().isPaused()) {
                this._nativeBridge.Sdk.logInfo('Continuing Unity Ads video playback after interrupt');
                this._nativeBridge.VideoPlayer.play();
            }
        }
    }

    protected onLowMemoryWarning(): void {
        if(this.isShowing()) {
            this._lowMemory = true;
        }
    }

    protected hideChildren() {
        const overlay = this.getOverlay();

        if(overlay) {
            overlay.container().parentElement!.removeChild(overlay.container());
        }
    }

    // todo: this is first attempt to get rid of around 1% of failed starts
    // if this approach is successful, this should somehow be refactored as part of AssetManager to validate
    // other things too, like endscreen assets
    private getValidVideoUrl(): Promise<string> {
        let streamingUrl: string = this.getVideo().getOriginalUrl();

        if(this._campaign instanceof PerformanceCampaign) {
            const orientation = this.getForceOrientation();

            const landscapeStreaming = this._campaign.getStreamingVideo();
            const portraitStreaming = this._campaign.getStreamingPortraitVideo();

            if(orientation === ForceOrientation.LANDSCAPE) {
                if(landscapeStreaming) {
                    streamingUrl = landscapeStreaming.getOriginalUrl();
                } else if(portraitStreaming) {
                    streamingUrl = portraitStreaming.getOriginalUrl();
                }
            } else if(orientation === ForceOrientation.PORTRAIT) {
                if(portraitStreaming) {
                    streamingUrl = portraitStreaming.getOriginalUrl();
                } else if(landscapeStreaming) {
                    streamingUrl = landscapeStreaming.getOriginalUrl();
                }
            } else {
                throw new WebViewError('Unable to fallback to an oriented streaming video');
            }
        }

        // check that if we think video has been cached, it is still available on device cache directory
        return Promise.resolve().then(() => {
            if(this.getVideo().isCached() && this.getVideo().getFileId()) {
                return this._nativeBridge.Cache.getFileInfo(<string>this.getVideo().getFileId()).then(result => {
                    if(result.found) {
                        return this.getVideo().getUrl();
                    } else {
                        Diagnostics.trigger('cached_file_not_found', new DiagnosticError(new Error('File not found'), {
                            url: this.getVideo().getUrl(),
                            originalUrl: this.getVideo().getOriginalUrl(),
                            campaignId: this._campaign.getId()
                        }));

                        // Modify asset cached status to false
                        this.getVideo().setCachedUrl(undefined);

                        // cached file not found (deleted by the system?), use streaming fallback
                        return streamingUrl;
                    }
                }).catch(error => {
                    Diagnostics.trigger('cached_file_not_found', new DiagnosticError(new Error(error), {
                        url: this.getVideo().getUrl(),
                        originalUrl: this.getVideo().getOriginalUrl(),
                        campaignId: this._campaign.getId()
                    }));

                    // Modify asset cached status to false
                    this.getVideo().setCachedUrl(undefined);

                    // cached file not found (deleted by the system?), use streaming fallback
                    return streamingUrl;
                });
            } else {
                return this.getVideo().getUrl();
            }
        }).then(finalVideoUrl => {
            this._videoOrientation = 'landscape';
            if(this._campaign instanceof PerformanceCampaign) {
                const portraitVideo = this._campaign.getPortraitVideo();
                const portraitStreamingVideo = this._campaign.getStreamingPortraitVideo();
                if((portraitVideo && finalVideoUrl === portraitVideo.getCachedUrl()) || (portraitStreamingVideo && finalVideoUrl === portraitStreamingVideo.getOriginalUrl())) {
                    this._videoOrientation = 'portrait';
                }
            }
            this._nativeBridge.Sdk.logDebug('Choosing ' + this._videoOrientation + ' video for locked orientation ' + ForceOrientation[this._container.getLockedOrientation()].toLowerCase());
            return finalVideoUrl;
        });
    }
}
