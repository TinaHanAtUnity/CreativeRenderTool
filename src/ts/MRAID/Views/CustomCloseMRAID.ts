import { ProgrammaticTrackingService, MraidMetric } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Placement } from 'Ads/Models/Placement';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { ABGroup } from 'Core/Models/ABGroup';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { MRAID } from 'MRAID/Views/MRAID';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

export class CustomCloseMRAID extends MRAID {
    protected _mraidCustomCloseCalled: boolean;
    protected _mraidCustomCloseDelay: number;
    private _mraidCustomCloseTimeout: number;
    private _pts: ProgrammaticTrackingService;

    constructor(platform: Platform, core: ICoreApi, deviceInfo: DeviceInfo, placement: Placement, campaign: MRAIDCampaign, privacy: AbstractPrivacy, showGDPRBanner: boolean, abGroup: ABGroup, programmaticTrackingService: ProgrammaticTrackingService, gameSessionId: number = 0, hidePrivacy: boolean = false) {
        super(platform, core, deviceInfo, placement, campaign, privacy, showGDPRBanner, abGroup, gameSessionId, hidePrivacy);

        this._pts = programmaticTrackingService;
        this._mraidCustomCloseCalled = false;

        this._mraidCustomCloseDelay = 5;
        if (!placement.allowSkip()) {
            // If the placement is not skippable, extend the hide time.
            this._mraidCustomCloseDelay = 40;
        }
    }

    private showCloseGraphic(closeElement: HTMLElement, visible: boolean) {
        const close = <HTMLElement>closeElement.querySelector('.close');
        if (visible) {
            close.style.display = 'block';
        } else {
            close.style.display = 'none';
        }
    }

    private setCustomCloseTimeout(element: HTMLElement, hideDuration: number) {
        this._mraidCustomCloseTimeout = window.setTimeout(() => {
            this._pts.reportMetricEvent(MraidMetric.UseCustomCloseHideTimeout);
            this.showCloseGraphic(element, true);
        }, hideDuration);
    }

    private clearCustomCloseTimeout() {
        window.clearTimeout(this._mraidCustomCloseTimeout);
    }

    protected prepareProgressCircle() {
        super.prepareProgressCircle();

        // NOTE: When allowSkip is true and mraid.useCustomClose is also true,
        // move the close button to the left.  This is a temporary test and
        // will likely be removed in the future.
        if (!this._placement.allowSkip()) {
            return;
        }

        if (!this._campaign.isCustomCloseEnabled()) {
            return;
        }

        this._closeElement.style.removeProperty('right');
        this._closeElement.style.left = '0';
    }

    public onCloseEvent(event: Event) {
        super.onCloseEvent(event);
        this._pts.reportMetricEvent(MraidMetric.ClosedByUnityAds);
    }

    public onBridgeClose() {
        super.onBridgeClose();
        this.clearCustomCloseTimeout();
        this._pts.reportMetricEvent(MraidMetric.ClosedByAd);
    }

    public onUseCustomClose(hideClose: boolean) {
        super.onUseCustomClose(hideClose);
        this._pts.reportMetricEvent(MraidMetric.UseCustomCloseCalled);

        if (!this._campaign.isCustomCloseEnabled()) {
            this._pts.reportMetricEvent(MraidMetric.UseCustomCloseRefused);
            return;
        }

        if (!hideClose) {
            this._pts.reportMetricEvent(MraidMetric.UseCustomCloseShowGraphic);
            this.clearCustomCloseTimeout();
            this.showCloseGraphic(this._closeElement, true);
            return;
        }

        if (this._mraidCustomCloseCalled) {
            this._pts.reportMetricEvent(MraidMetric.UseCustomCloseCalledAgain);
            return;
        }

        this._mraidCustomCloseCalled = true;

        const hideDuration = this._mraidCustomCloseDelay * 1000;
        if (hideDuration <= 0) {
            this._pts.reportMetricEvent(MraidMetric.UseCustomCloseExpired);
            this.showCloseGraphic(this._closeElement, true);
            return;
        }

        this._pts.reportMetricEvent(MraidMetric.UseCustomCloseHideGraphic);
        this.showCloseGraphic(this._closeElement, false);
        this.setCustomCloseTimeout(this._closeElement, hideDuration);
    }
}
