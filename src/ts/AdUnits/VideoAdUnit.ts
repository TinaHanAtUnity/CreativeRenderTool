import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { FinishState } from 'Constants/FinishState';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Double } from 'Utilities/Double';
import { Video } from 'Models/Assets/Video';
import { Overlay } from 'Views/Overlay';
import { IosUtils } from 'Utilities/IosUtils';
import { Platform } from 'Constants/Platform';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { WebViewError } from 'Errors/WebViewError';

export abstract class VideoAdUnit extends AbstractAdUnit {

    private static _progressInterval: number = 250;

    protected _onShowObserver: any;
    protected _onSystemKillObserver: any;
    protected _onSystemInterruptObserver: any;

    protected _options: any;
    private _video: Video;
    private _active: boolean;
    private _overlay: Overlay | undefined;
    private _deviceInfo: DeviceInfo;
    private _videoOrientation: 'landscape' | 'portrait' | undefined;

    constructor(nativeBridge: NativeBridge, forceOrientation: ForceOrientation, container: AdUnitContainer, placement: Placement, campaign: Campaign, video: Video, overlay: Overlay, deviceInfo: DeviceInfo, options: any) {
        super(nativeBridge, forceOrientation, container, placement, campaign);

        this._video = video;
        this._active = false;
        this._overlay = overlay;
        this._deviceInfo = deviceInfo;
        this._options = options;
    }

    public show(): Promise<void> {
        this.setShowing(true);
        this.onStart.trigger();
        this.setActive(true);

        this._onShowObserver = this._container.onShow.subscribe(() => this.onShow());
        this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());
        this._onSystemInterruptObserver = this._container.onSystemInterrupt.subscribe(() => this.onSystemInterrupt());

        return this._container.open(this, true, true, this.getForceOrientation(), this._placement.disableBackButton(), this._options);
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

    protected unsetReferences() {
        delete this._overlay;
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

    protected onSystemInterrupt(): void {
        if(this.isShowing() && this.isActive()) {
            this._nativeBridge.Sdk.logInfo('Continuing Unity Ads video playback after interrupt');
            this._nativeBridge.VideoPlayer.play();
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

                        // cached file not found (deleted by the system?), use streaming fallback
                        return streamingUrl;
                    }
                }).catch(error => {
                    Diagnostics.trigger('cached_file_not_found', new DiagnosticError(new Error(error), {
                        url: this.getVideo().getUrl(),
                        originalUrl: this.getVideo().getOriginalUrl(),
                        campaignId: this._campaign.getId()
                    }));

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
