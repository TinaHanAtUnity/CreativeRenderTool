import { VideoState } from 'Ads/AdUnits/VideoAdUnit';
import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { FinishState } from 'Core/Constants/FinishState';
import { Double } from 'Core/Utilities/Double';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
export class OverlayEventHandler extends GDPREventHandler {
    constructor(adUnit, parameters, adUnitStyle) {
        super(parameters.privacyManager, parameters.coreConfig, parameters.adsConfig, parameters.privacySDK);
        this._ads = parameters.ads;
        this._operativeEventManager = parameters.operativeEventManager;
        this._adUnit = adUnit;
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
        this._adUnitStyle = adUnitStyle;
    }
    onOverlaySkip(position) {
        this._ads.VideoPlayer.pause();
        this._adUnit.setVideoState(VideoState.SKIPPED);
        this._adUnit.setFinishState(FinishState.SKIPPED);
        this._operativeEventManager.sendSkip(this.getOperativeSkipEventParams());
        this._adUnit.getContainer().reconfigure(0 /* ENDSCREEN */);
        const overlay = this._adUnit.getOverlay();
        if (overlay) {
            overlay.hide();
        }
        this._adUnit.onFinish.trigger();
    }
    onOverlayMute(isMuted) {
        this._ads.VideoPlayer.setVolume(new Double(isMuted ? 0 : 1));
    }
    onOverlayCallButton() {
        // EMPTY
    }
    onOverlayPauseForTesting(paused) {
        // EMPTY
    }
    onOverlayClose() {
        this._ads.VideoPlayer.pause();
        this._adUnit.setActive(false);
        this._adUnit.setVideoState(VideoState.SKIPPED);
        this._adUnit.setFinishState(FinishState.SKIPPED);
        this._operativeEventManager.sendSkip(this.getOperativeSkipEventParams());
        this._adUnit.onFinish.trigger();
        this._adUnit.hide();
    }
    onKeyEvent(keyCode) {
        if (keyCode === 4 /* BACK */ && this.canSkipVideo()) {
            if (!this._placement.skipEndCardOnClose()) {
                this.onOverlaySkip(this._adUnit.getVideo().getPosition());
            }
            else {
                this.onOverlayClose();
            }
        }
    }
    canSkipVideo() {
        if (!this._placement.allowSkip() || !this._adUnit.isShowing() || !this._adUnit.canPlayVideo()) {
            return false;
        }
        const position = this._adUnit.getVideo().getPosition();
        const allowSkipInMs = this._placement.allowSkipInSeconds() * 1000;
        return position >= allowSkipInMs;
    }
    getVideoOrientation() {
        if (this._adUnit instanceof PerformanceAdUnit) {
            return this._adUnit.getVideoOrientation();
        }
        return undefined;
    }
    getOperativeSkipEventParams() {
        return {
            placement: this._placement,
            videoOrientation: this.getVideoOrientation(),
            adUnitStyle: this._adUnitStyle,
            asset: this._adUnit.getVideo(),
            videoProgress: this._adUnit.getVideo().getPosition()
        };
    }
    onShowPrivacyPopUp(x, y, width, height) {
        return Promise.resolve();
    }
    onClosePrivacyPopUp() {
        return Promise.resolve();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3ZlcmxheUV2ZW50SGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvRXZlbnRIYW5kbGVycy9PdmVybGF5RXZlbnRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBdUMsVUFBVSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDMUYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFRdEUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUUxRSxNQUFNLE9BQU8sbUJBQXdDLFNBQVEsZ0JBQWdCO0lBU3pFLFlBQVksTUFBc0IsRUFBRSxVQUFxQyxFQUFFLFdBQXlCO1FBQ2hHLEtBQUssQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLFVBQVUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckcsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDO1FBQzNCLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxVQUFVLENBQUMscUJBQXFCLENBQUM7UUFDL0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztRQUN2QyxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztJQUNwQyxDQUFDO0lBRU0sYUFBYSxDQUFDLFFBQWdCO1FBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FB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