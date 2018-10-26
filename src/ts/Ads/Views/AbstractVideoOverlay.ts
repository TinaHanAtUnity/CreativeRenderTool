import { IGDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { Platform } from 'Core/Constants/Platform';
import { View } from 'Core/Views/View';
import { IVideoOverlayDownloadParameters } from 'Performance/EventHandlers/PerformanceOverlayWithCTAButtonEventHandler';

export interface IOverlayHandler extends IGDPREventHandler {
    onOverlaySkip(position: number): void;
    onOverlayMute(isMuted: boolean): void;
    onOverlayPauseForTesting(paused: boolean): void;
    onOverlayCallButton(): void;
    onOverlayClose(): void;
    onOverlayDownload?(parameters: IVideoOverlayDownloadParameters): void;
}

export abstract class AbstractVideoOverlay extends View<IOverlayHandler> {

    public static setAutoSkip(value: boolean) {
        AbstractVideoOverlay.AutoSkip = value;
    }

    protected static AutoSkip: boolean = false;

    protected _skipDuration: number;
    protected _skipRemaining: number;

    protected _videoDuration: number;

    protected _muted: boolean;

    protected _fadeEnabled: boolean = true;
    protected _isPrivacyShowing: boolean = false;

    constructor(platform: Platform, containerId: string, muted: boolean) {
        super(platform, containerId);
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

    public isPrivacyShowing(): boolean {
        return this._isPrivacyShowing;
    }

    public abstract setSpinnerEnabled(value: boolean): void;

    public abstract setSkipEnabled(value: boolean): void;

    public abstract setVideoDurationEnabled(value: boolean): void;

    public abstract setVideoProgress(value: number): void;

    public abstract setMuteEnabled(value: boolean): void;

    public abstract setDebugMessage(value: string): void;

    public abstract setDebugMessageVisible(value: boolean): void;

    public abstract setCallButtonVisible(value: boolean): void;

    public abstract setCallButtonEnabled(value: boolean): void;
}
