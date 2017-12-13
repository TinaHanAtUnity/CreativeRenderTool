import { IOverlayHandler } from 'Views/AbstractOverlay';
import { NativeBridge } from 'Native/NativeBridge';
import { IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { FinishState } from 'Constants/FinishState';
import { Double } from 'Utilities/Double';
import { Campaign } from 'Models/Campaign';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';

export class OverlayEventHandler<T extends Campaign> implements IOverlayHandler {
    protected _nativeBridge: NativeBridge;
    private _adUnit: VideoAdUnit<T>;
    private _operativeEventManager: OperativeEventManager;
    private _comScoreTrackingService: ComScoreTrackingService;
    private _abGroup: number;
    private _campaign: T;

    constructor(nativeBridge: NativeBridge, adUnit: VideoAdUnit<T>, parameters: IAdUnitParameters<T>) {
        this._nativeBridge = nativeBridge;
        this._operativeEventManager = parameters.operativeEventManager;
        this._comScoreTrackingService = parameters.comScoreTrackingService;
        this._abGroup = parameters.campaign.getAbGroup();
        this._adUnit = adUnit;
        this._campaign = parameters.campaign;
    }

    public onOverlaySkip(position: number): void {
        this._nativeBridge.VideoPlayer.pause();
        this._adUnit.setActive(false);
        this._adUnit.setFinishState(FinishState.SKIPPED);
        this._operativeEventManager.sendSkip(this._campaign.getSession(), this._campaign, this._adUnit.getVideo().getPosition(), this.getVideoOrientation());

        if (this._abGroup === 5) {
            const sessionId = this._campaign.getSession().getId();
            const positionAtSkip = this._adUnit.getVideo().getPosition();
            const comScoreDuration = (this._adUnit.getVideo().getDuration()).toString(10);
            const creativeId = this._campaign.getCreativeId();
            const category = this._campaign.getCategory();
            const subCategory = this._campaign.getSubCategory();
            this._comScoreTrackingService.sendEvent('end', sessionId, comScoreDuration, positionAtSkip, creativeId, category, subCategory);
        }

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

    public onOverlayClose(): void {
        this._nativeBridge.VideoPlayer.pause();
        this._adUnit.setActive(false);
        this._adUnit.setFinishState(FinishState.SKIPPED);
        this._operativeEventManager.sendSkip(this._campaign.getSession(), this._campaign, this._adUnit.getVideo().getPosition(), this.getVideoOrientation());

        this._adUnit.onFinish.trigger();

        this._adUnit.hide();
    }

    private getVideoOrientation(): string | undefined {
        if(this._adUnit instanceof PerformanceAdUnit) {
            return (<PerformanceAdUnit>this._adUnit).getVideoOrientation();
        }

        return undefined;
    }
}
