import { AdUnit } from 'Models/AdUnit';
import { Placement } from 'Placement';
import { Campaign } from 'Campaign';
import { NativeVideoPlayer } from 'Video/NativeVideoPlayer';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { SessionManager } from 'Managers/SessionManager';
import { StorageManager } from 'Managers/StorageManager';

export class VideoAdUnit extends AdUnit {
    private _videoPlayer: NativeVideoPlayer;
    private _overlay: Overlay;
    private _endScreen: EndScreen;
    private _videoPosition: number;
    private _videoActive: boolean;
    private _watches: number;

    constructor(placement: Placement, campaign: Campaign, videoPlayer: NativeVideoPlayer, overlay: Overlay, sessionManager: SessionManager, storageManager: StorageManager) {
        super(placement, campaign, sessionManager, storageManager);

        this._videoPosition = 0;
        this._videoActive = true;
        this._watches = 0;
        this._videoPlayer = videoPlayer;
        this._overlay = overlay;
        this._endScreen = new EndScreen(this);
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
}