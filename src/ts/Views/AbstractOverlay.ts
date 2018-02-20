import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';

export interface IOverlayHandler {
    onOverlaySkip(position: number): void;
    onOverlayMute(isMuted: boolean): void;
    onOverlayPauseForTesting(paused: boolean): void;
    onOverlayCallButton(): void;
    onOverlayClose(): void;
}

export abstract class AbstractOverlay extends View<IOverlayHandler> {

    public static setAutoSkip(value: boolean) {
        AbstractOverlay.AutoSkip = value;
    }

    protected static AutoSkip: boolean = false;

    protected _abGroup: number;
    protected _skipDuration: number;
    protected _skipRemaining: number;

    protected _videoDuration: number;

    protected _muted: boolean;

    protected _fadeEnabled: boolean = true;

    constructor(nativeBridge: NativeBridge, containerId: string, muted: boolean, abGroup: number = 0) {
        super(nativeBridge, containerId);
        this._abGroup = abGroup;
        this._muted = muted;
    }

    public setSkipDuration(value: number): void {
        this._skipDuration = this._skipRemaining = value * 1000;
    }

    public setVideoDuration(value: number): void {
        this._videoDuration = value;
    }

    public isMuted(): boolean {
        return this._muted;
    }

    public setFadeEnabled(value: boolean) {
        if(this._fadeEnabled !== value) {
            this._fadeEnabled = value;
        }
    }

    public abstract setSpinnerEnabled(value: boolean): void;

    public abstract setSkipEnabled(value: boolean): void;

    public abstract setVideoDurationEnabled(value: boolean): void;

    public abstract setVideoProgress(value: number): void;

    public abstract setMuteEnabled(value: boolean): void;

    public abstract setDebugMessage(value: string): void;

    public abstract setDebugMessageVisible(value: boolean): void;

    public abstract setCallButtonVisible(value: boolean): void;
}
