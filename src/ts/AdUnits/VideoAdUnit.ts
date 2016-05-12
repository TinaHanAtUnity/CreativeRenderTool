import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { SystemUiVisibility } from 'Constants/Android/SystemUiVisibility';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { FinishState } from 'Constants/FinishState';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Double } from 'Utilities/Double';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { InterfaceOrientation } from 'Constants/iOS/InterfaceOrientation';

export class VideoAdUnit extends AbstractAdUnit {

    private _overlay: Overlay;
    private _endScreen: EndScreen;
    private _videoPosition: number;
    private _videoActive: boolean;
    private _watches: number;
    private _onResumeObserver: any;
    private _onPauseObserver: any;
    private _onDestroyObserver: any;
    private _onViewControllerDidAppearObserver: any;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: Campaign, overlay: Overlay, endScreen: EndScreen) {
        super(nativeBridge, placement, campaign);

        if(nativeBridge.getPlatform() === Platform.IOS) {
            this._onViewControllerDidAppearObserver = this._nativeBridge.IosAdUnit.onViewControllerDidAppear.subscribe(() => this.onViewDidAppear());
        } else {
            this._onResumeObserver = this._nativeBridge.AndroidAdUnit.onResume.subscribe(() => this.onResume());
            this._onPauseObserver = this._nativeBridge.AndroidAdUnit.onPause.subscribe((finishing) => this.onPause(finishing));
            this._onDestroyObserver = this._nativeBridge.AndroidAdUnit.onDestroy.subscribe((finishing) => this.onDestroy(finishing));
        }

        this._videoPosition = 0;
        this._videoActive = true;
        this._watches = 0;

        this._overlay = overlay;
        this._endScreen = endScreen;
    }

    public showAndroid(orientation: ScreenOrientation, keyEvents: any[]): Promise<void> {
        this._showing = true;
        this.setVideoActive(true);
        return this._nativeBridge.AndroidAdUnit.open(['videoplayer', 'webview'], orientation, keyEvents, SystemUiVisibility.LOW_PROFILE);
    }

    public showIos(supportedOrientations: InterfaceOrientation): Promise<void> {
        this._showing = true;
        this.setVideoActive(true);
        return this._nativeBridge.IosAdUnit.open(['videoplayer', 'webview'], supportedOrientations, true, true);
    }

    public hide(): Promise<void> {
        if (this.isVideoActive()) {
            this._nativeBridge.VideoPlayer.stop();
        }

        this.getOverlay().container().parentElement.removeChild(this.getOverlay().container());
        this.getEndScreen().container().parentElement.removeChild(this.getEndScreen().container());
        this.unsetReferences();

        this._nativeBridge.Listener.sendFinishEvent(this.getPlacement().getId(), this.getFinishState());

        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            this._nativeBridge.IosAdUnit.onViewControllerDidAppear.unsubscribe(this._onViewControllerDidAppearObserver);
        } else {
            this._nativeBridge.AndroidAdUnit.onResume.unsubscribe(this._onResumeObserver);
            this._nativeBridge.AndroidAdUnit.onPause.unsubscribe(this._onPauseObserver);
            this._nativeBridge.AndroidAdUnit.onDestroy.unsubscribe(this._onDestroyObserver);
        }

        return this._nativeAdUnit.close().then(() => {
            this._showing = false;
            this.onClose.trigger();
        });
    }

    public isShowing(): boolean {
        return this._showing;
    }

    public getWatches(): number {
        return this._watches;
    }

    public getVideoPosition(): number {
        return this._videoPosition;
    }

    public setVideoPosition(position: number): void {
        this._videoPosition = position;
    }

    public isVideoActive(): boolean {
        return this._videoActive;
    }

    public setVideoActive(active: boolean): void {
        this._videoActive = active;
    }

    public setWatches(watches: number): void {
        this._watches = watches;
    }

    public getOverlay(): Overlay {
        return this._overlay;
    }

    public getEndScreen(): EndScreen {
        return this._endScreen;
    }

    public newWatch() {
        this._watches += 1;
    }

    public unsetReferences() {
        this._endScreen = null;
        this._overlay = null;
    }

    /*
     ANDROID ACTIVITY LIFECYCLE EVENTS
     */

    private onResume(): void {
        if (this._showing && this.isVideoActive()) {
            this._nativeBridge.VideoPlayer.prepare(this.getCampaign().getVideoUrl(), new Double(this.getPlacement().muteVideo() ? 0.0 : 1.0));
        }
    }

    private onPause(finishing: boolean): void {
        if (finishing && this._showing) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    private onDestroy(finishing: boolean): void {
        if (this._showing && finishing) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    /*
     IOS VIEWCONTROLLER EVENTS
     */

    private onViewDidAppear(): void {
        this.onResume();
    }
}
