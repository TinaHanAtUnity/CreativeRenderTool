import { IOverlayHandler } from 'Views/AbstractVideoOverlay';
import { NativeBridge } from 'Native/NativeBridge';
import { IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { OperativeEventManager, IOperativeSkipEventParams } from 'Managers/OperativeEventManager';
import { ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { VideoAdUnit, VideoState } from 'AdUnits/VideoAdUnit';
import { FinishState } from 'Constants/FinishState';
import { Double } from 'Utilities/Double';
import { Campaign } from 'Models/Campaign';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Placement } from 'Models/Placement';
import { AdUnitStyle } from 'Models/AdUnitStyle';
import { GdprManager, GDPREventAction } from 'Managers/GdprManager';
import { Configuration } from 'Models/Configuration';

export class OverlayEventHandler<T extends Campaign> implements IOverlayHandler {
    protected _placement: Placement;
    protected _nativeBridge: NativeBridge;
    private _adUnit: VideoAdUnit<T>;
    private _operativeEventManager: OperativeEventManager;
    private _campaign: T;
    private _adUnitStyle?: AdUnitStyle;
    private _configuration: Configuration;
    private _gdprManager: GdprManager;

    constructor(nativeBridge: NativeBridge, adUnit: VideoAdUnit<T>, parameters: IAdUnitParameters<T>, adUnitStyle?: AdUnitStyle) {
        this._nativeBridge = nativeBridge;
        this._operativeEventManager = parameters.operativeEventManager;
        this._adUnit = adUnit;
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
        this._adUnitStyle = adUnitStyle;
        this._configuration = parameters.configuration;
        this._gdprManager = parameters.gdprManager;
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
        this._nativeBridge.VideoPlayer.setVolume(new Double(isMuted ? 0.0 : 1.0));
    }

    public onOverlayCallButton(): void {
        // EMPTY
    }

    public onOverlayPauseForTesting(paused: boolean): void {
        // EMPTY
    }

    public onGDPRPopupSkipped(): void {
        if (!this._configuration.isOptOutRecorded()) {
            this._configuration.setOptOutRecorded(true);
        }
        this._gdprManager.sendGDPREvent(GDPREventAction.SKIP);
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
