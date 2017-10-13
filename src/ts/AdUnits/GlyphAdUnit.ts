import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Placement } from 'Models/Placement';
import { GlyphCampaign } from 'Models/Campaigns/GlyphCampaign';
import { GlyphView } from 'Views/GlyphView';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { Double } from 'Utilities/Double';
import { IObserver4, IObserver1, IObserver0 } from 'Utilities/IObserver';

enum PlayerState {
    NONE,
    PLAYING,
    PAUSED,
    ENDED
}

export class GlyphAdUnit extends AbstractAdUnit {
    private _operativeEventManager: OperativeEventManager;
    private _view: GlyphView;
    private _options: any;

    private _videoPreparedHandler: IObserver4<string, number, number, number>;
    private _videoProgressHandler: IObserver1<number>;
    private _videoPlayHandler: IObserver0;
    private _videoPauseHandler: IObserver0;
    private _videoCompleteHandler: IObserver0;

    private _playerState: PlayerState = PlayerState.NONE;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, operativeEventManager: OperativeEventManager, placement: Placement, campaign: GlyphCampaign, view: GlyphView, options: any) {
        super(nativeBridge, ForceOrientation.NONE, container, placement, campaign);
        this._operativeEventManager = operativeEventManager;
        this._view = view;

        this._options = options;

        this._view.onPrepareVideo.subscribe((url) => this.onPrepareVideo(url));
        this._view.onPlayVideo.subscribe(() => this.onPlayVideo());
        this._videoPreparedHandler = (url, duration, width, height) => this.onVideoPrepared(url, duration, width, height);
        this._videoProgressHandler = (progress) => this.onVideoProgress(progress);
        this._videoPlayHandler = () => this.onVideoPlay();
        this._videoPauseHandler = () => this.onVideoPause();
        this._videoCompleteHandler = () => this.onVideoComplete();
    }

    public show(): Promise<void> {
        this.onShow();
        this.showView();
        return this._container.open(this, true, false, this._forceOrientation, true, false, true, false, this._options);
    }

    public hide(): Promise<void> {
        this.onHide();
        this.hideView();
        return this._container.close();
    }

    public isCached(): boolean {
        return false;
    }

    public description(): string {
        return 'Glyph';
    }

    private onShow() {
        this.setShowing(true);
        this._nativeBridge.VideoPlayer.onPrepared.subscribe(this._videoPreparedHandler);
        this._nativeBridge.VideoPlayer.onProgress.subscribe(this._videoProgressHandler);
        this._nativeBridge.VideoPlayer.onPlay.subscribe(this._videoPlayHandler);
        this._nativeBridge.VideoPlayer.onPause.subscribe(this._videoPauseHandler);
        this._nativeBridge.VideoPlayer.onCompleted.subscribe(this._videoCompleteHandler);
    }

    private showView() {
        this._view.show();
        document.body.appendChild(this._view.container());
    }

    private onHide() {
        this.setShowing(false);
        this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());
        this.onClose.trigger();
        this._nativeBridge.VideoPlayer.onPrepared.unsubscribe(this._videoPreparedHandler);
        this._nativeBridge.VideoPlayer.onProgress.unsubscribe(this._videoProgressHandler);
        this._nativeBridge.VideoPlayer.onPlay.unsubscribe(this._videoPlayHandler);
        this._nativeBridge.VideoPlayer.onPause.unsubscribe(this._videoPauseHandler);
        this._nativeBridge.VideoPlayer.onCompleted.unsubscribe(this._videoCompleteHandler);
    }

    private hideView() {
        this._view.hide();
        document.body.removeChild(this._view.container());
    }

    private onVideoPrepared(url: string, duration: number, width: number, height: number) {
        this._view.onVideoPrepared(url, duration / 1000.0, width, height);
    }

    private onVideoProgress(progress: number) {
        this._view.onVideoProgress(progress / 1000.0);
    }

    private onPrepareVideo(url: string) {
        this._nativeBridge.VideoPlayer.prepare(url, new Double(1.0), 10000);
    }

    private onPlayVideo() {
        this._nativeBridge.VideoPlayer.play();
    }

    private onVideoPlay() {
        if (this._playerState === PlayerState.PAUSED) {
            this._view.notifyPlay();
        }
        this._playerState = PlayerState.PLAYING;
        this._view.notifyPlaying();
    }

    private onVideoPause() {
        this._playerState = PlayerState.PAUSED;
        this._view.notifyPause();
    }

    private onVideoComplete() {
        this._playerState = PlayerState.ENDED;
        this._view.notifyEnd();
    }
}
