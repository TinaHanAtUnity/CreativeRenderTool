import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { ViewConfiguration } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { VideoAdUnit, VideoState } from 'Ads/AdUnits/VideoAdUnit';
import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { IOperativeSkipEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { IOverlayHandler } from 'Ads/Views/AbstractVideoOverlay';
import { FinishState } from 'Core/Constants/FinishState';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Double } from 'Core/Utilities/Double';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { KeyCode } from "../../Core/Constants/Android/KeyCode";
import { Video } from "../Models/Assets/Video";

export class OverlayEventHandler<T extends Campaign> extends GDPREventHandler implements IOverlayHandler {
    protected _placement: Placement;
    protected _nativeBridge: NativeBridge;
    protected _campaign: T;

    private _adUnit: VideoAdUnit<T>;
    private _operativeEventManager: OperativeEventManager;
    private _adUnitStyle?: AdUnitStyle;

    constructor(nativeBridge: NativeBridge, adUnit: VideoAdUnit<T>, parameters: IAdUnitParameters<T>, adUnitStyle?: AdUnitStyle) {
        super(parameters.gdprManager, parameters.coreConfig, parameters.adsConfig);
        this._nativeBridge = nativeBridge;
        this._operativeEventManager = parameters.operativeEventManager;
        this._adUnit = adUnit;
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
        this._adUnitStyle = adUnitStyle;
    }

    public onOverlaySkip(position: number): void {
        this._nativeBridge.VideoPlayer.pause();
        this._adUnit.setVideoState(VideoState.SKIPPED);
        this._adUnit.setFinishState(FinishState.SKIPPED);
        this._operativeEventManager.sendSkip(this.getOperativeSkipEventParams());

        this._adUnit.getContainer().reconfigure(ViewConfiguration.ENDSCREEN);

        const overlay = this._adUnit.getOverlay();
        if (overlay) {
            overlay.hide();
        }

        this._adUnit.onFinish.trigger();
    }

    public onOverlayMute(isMuted: boolean): void {
        this._nativeBridge.VideoPlayer.setVolume(new Double(isMuted ? 0 : 1));
    }

    public onOverlayCallButton(): void {
        // EMPTY
    }

    public onOverlayPauseForTesting(paused: boolean): void {
        // EMPTY
    }

    public onOverlayClose(): void {
        this._nativeBridge.VideoPlayer.pause();
        this._adUnit.setActive(false);
        this._adUnit.setVideoState(VideoState.SKIPPED);
        this._adUnit.setFinishState(FinishState.SKIPPED);
        this._operativeEventManager.sendSkip(this.getOperativeSkipEventParams());

        this._adUnit.onFinish.trigger();
        this._adUnit.hide();
    }

    public onKeyEvent(keyCode: number): void {
        // todo: add source game ID check
        if(keyCode === KeyCode.BACK && this.canSkipVideo()) {
            this.onOverlaySkip(this._adUnit.getVideo().getPosition());
        }
    }

    private canSkipVideo(): boolean {
        if(!this._placement.allowSkip() || !this._adUnit.isShowing() || !this._adUnit.canPlayVideo()) {
            return false;
        }

        const position = this._adUnit.getVideo().getPosition();
        const allowSkipInMs = this._placement.allowSkipInSeconds() * 1000;
        return position >= allowSkipInMs;
    }

    private getVideoOrientation(): string | undefined {
        if(this._adUnit instanceof PerformanceAdUnit) {
            return (<PerformanceAdUnit>this._adUnit).getVideoOrientation();
        }

        return undefined;
    }

    private getOperativeSkipEventParams(): IOperativeSkipEventParams {
        return {
            placement: this._placement,
            videoOrientation: this.getVideoOrientation(),
            adUnitStyle: this._adUnitStyle,
            asset: this._adUnit.getVideo(),
            videoProgress: this._adUnit.getVideo().getPosition()
        };
    }
}
