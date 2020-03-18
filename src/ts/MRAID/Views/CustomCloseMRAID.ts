import { Placement } from 'Ads/Models/Placement';
import { MraidMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { ABGroup } from 'Core/Models/ABGroup';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { MRAID } from 'MRAID/Views/MRAID';

export class CustomCloseMRAID extends MRAID {
    protected _mraidCustomCloseCalled: boolean;
    protected _mraidCustomCloseDelay: number;
    private _mraidCustomCloseTimeout: number;

    constructor(platform: Platform, core: ICoreApi, deviceInfo: DeviceInfo, placement: Placement, campaign: MRAIDCampaign, privacy: AbstractPrivacy, showGDPRBanner: boolean, abGroup: ABGroup, gameSessionId: number = 0, hidePrivacy: boolean = false) {
        super(platform, core, deviceInfo, placement, campaign, privacy, showGDPRBanner, abGroup, gameSessionId, hidePrivacy);

        this._mraidCustomCloseCalled = false;

        this._mraidCustomCloseDelay = placement.allowSkip() ? 5 : 40;
    }

    public show(): void {
        super.show();
        // NOTE: When allowSkip is true, move the close button to the left.
        // This is a temporary test and will likely be removed in the future.
        if (this._placement.allowSkip()) {
            this.moveCloseGraphicLeft();
        }
    }

    public onCloseEvent(event: Event) {
        super.onCloseEvent(event);
        SDKMetrics.reportMetricEvent(MraidMetric.ClosedByUnityAds);
    }

    public onBridgeClose() {
        super.onBridgeClose();
        this.clearCustomCloseTimeout();
        SDKMetrics.reportMetricEvent(MraidMetric.ClosedByAdUnit);
    }

    public onUseCustomClose(shouldHideClose: boolean) {
        super.onUseCustomClose(shouldHideClose);
        SDKMetrics.reportMetricEvent(MraidMetric.UseCustomCloseCalled);

        if (!shouldHideClose) {
            this.clearCustomCloseTimeout();
            this.setCloseVisibility(true);
            return;
        }

        if (this._mraidCustomCloseCalled) {
            return;
        }
        this._mraidCustomCloseCalled = true;

        this.setupCustomClose();
    }

    private setCloseVisibility(visible: boolean) {
        const closeElement = <HTMLElement> this._container.querySelector('.close');
        if (closeElement) {
            closeElement.style.display = visible ? 'block' : 'none';
        }
    }

    private setupCustomClose() {
        SDKMetrics.reportMetricEvent(MraidMetric.CloseHidden);
        this.setCloseVisibility(false);
        const hideDuration = this._mraidCustomCloseDelay * 1000;
        this._mraidCustomCloseTimeout = window.setTimeout(() => {
            this.setCloseVisibility(true);
        }, hideDuration);
    }

    private clearCustomCloseTimeout() {
        window.clearTimeout(this._mraidCustomCloseTimeout);
    }

    private moveCloseGraphicLeft() {
        SDKMetrics.reportMetricEvent(MraidMetric.CloseMovedToLeft);
        const closeRegionElement = <HTMLElement> this._container.querySelector('.close-region');
        if (closeRegionElement) {
            closeRegionElement.style.removeProperty('right');
            closeRegionElement.style.left = '0';
        }
    }
}
