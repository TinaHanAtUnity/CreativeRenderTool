import { AdUnit } from 'Models/AdUnit';
import { Placement } from 'Placement';
import { Campaign } from 'Campaign';
import { NativeVideoPlayer } from 'Video/NativeVideoPlayer';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { SessionManager } from 'Managers/SessionManager';
import { StorageManager } from 'Managers/StorageManager';
import { NativeBridge } from 'NativeBridge';
import { VideoEventHandlers } from 'EventHandlers/VideoEventHandlers';
import { EndScreenEventHandlers } from 'EventHandlers/EndScreenEventHandlers';
import { OverlayEventHandlers } from 'EventHandlers/OverlayEventHandlers';

export class VideoAdUnit extends AdUnit {
    private _videoPlayer: NativeVideoPlayer;
    private _overlay: Overlay;
    private _endScreen: EndScreen;
    private _videoPosition: number;
    private _videoActive: boolean;
    private _watches: number;

    constructor(placement: Placement, campaign: Campaign, nativeBridge: NativeBridge, sessionManager: SessionManager, storageManager: StorageManager) {
        super(placement, campaign, nativeBridge, sessionManager, storageManager);

        this._videoPosition = 0;
        this._videoActive = true;
        this._watches = 0;

        this.prepareVideoPlayer();
        this.prepareOverlay();
        this.prepareEndScreen();
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

    public getWatches(): number {
        return this._watches;
    }

    public setWatches(watches: number): void {
        this._watches = watches;
    }

    public getVideoPlayer(): NativeVideoPlayer {
        return this._videoPlayer;
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
        this._videoPlayer = null;
        this._overlay = null;
    }

    /*
     PRIVATES
     */
    private prepareVideoPlayer() {
        let videoPlayer = new NativeVideoPlayer(this._nativeBridge);

        videoPlayer.subscribe('prepared', (duration, width, height) => VideoEventHandlers.onVideoPrepared(this, duration, width, height));
        videoPlayer.subscribe('progress', (position) => VideoEventHandlers.onVideoProgress(this, position));
        videoPlayer.subscribe('start', () => VideoEventHandlers.onVideoStart(this));
        videoPlayer.subscribe('completed', (url) => VideoEventHandlers.onVideoCompleted(this, url));

        this._videoPlayer = videoPlayer;
    }

    private prepareOverlay() {
        let overlay = new Overlay(this._placement.muteVideo());

        overlay.render();
        document.body.appendChild(overlay.container());
        overlay.subscribe('skip', () => OverlayEventHandlers.onSkip(this));
        overlay.subscribe('mute', (muted) => OverlayEventHandlers.onMute(this, muted));

        if(!this._placement.allowSkip()) {
            overlay.setSkipEnabled(false);
        } else {
            overlay.setSkipEnabled(true);
            overlay.setSkipDuration(this._placement.allowSkipInSeconds());
        }

        this._overlay = overlay;
    }

    private prepareEndScreen() {
        let endScreen = new EndScreen(this);

        endScreen.render();
        endScreen.hide();
        document.body.appendChild(endScreen.container());
        endScreen.subscribe('replay', () => EndScreenEventHandlers.onReplay(this));
        endScreen.subscribe('download', () => EndScreenEventHandlers.onDownload(this));

        this._endScreen = endScreen;
    }

}
