import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { MoatViewabilityService } from 'Ads/Utilities/MoatViewabilityService';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { MOAT } from 'Ads/Views/MOAT';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { Url } from 'Core/Utilities/Url';

export class VastOverlayEventHandler extends OverlayEventHandler<VastCampaign> {
    private _platform: Platform;
    private _core: ICoreApi;
    private _vastAdUnit: VastAdUnit;
    private _request: RequestManager;
    private _vastCampaign: VastCampaign;
    private _moat?: MOAT;
    private _vastOverlay?: AbstractVideoOverlay;

    constructor(adUnit: VastAdUnit, parameters: IAdUnitParameters<VastCampaign>) {
        super(adUnit, parameters);

        this._platform = parameters.platform;
        this._core = parameters.core;
        this._vastAdUnit = adUnit;
        this._request = parameters.request;
        this._vastCampaign = parameters.campaign;
        this._placement = parameters.placement;
        this._moat = MoatViewabilityService.getMoat();
        this._vastOverlay = this._vastAdUnit.getOverlay();
    }

    public onOverlaySkip(position: number): void {
        super.onOverlaySkip(position);

        const endScreen = this._vastAdUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
            this._vastAdUnit.onFinish.trigger();
        } else {
            this._vastAdUnit.hide();
        }
    }

    public onOverlayMute(isMuted: boolean): void {
        super.onOverlayMute(isMuted);
        if (isMuted) {
            if (this._moat) {
                this._moat.volumeChange(0);
            }
            this._vastAdUnit.sendTrackingEvent('mute', this._vastCampaign.getSession().getId());
        } else {
            if (this._moat) {
                this._moat.volumeChange(this._vastAdUnit.getVolume());
            }
            this._vastAdUnit.sendTrackingEvent('unmute', this._vastCampaign.getSession().getId());
        }
    }

    public onOverlayCallButton(): Promise<void> {
        super.onOverlayCallButton();

        this.setCallButtonEnabled(false);
        this._ads.Listener.sendClickEvent(this._placement.getId());

        const clickThroughURL = this._vastAdUnit.getVideoClickThroughURL();
        if(clickThroughURL) {
            const useWebViewUserAgentForTracking = this._vastCampaign.getUseWebViewUserAgentForTracking();
            return this._request.followRedirectChain(clickThroughURL, useWebViewUserAgentForTracking, true).then((url: string) => {
                return this.openUrlOnCallButton(url);
            }).catch(() => {
                const urlParts = Url.parse(clickThroughURL);
                const error = new DiagnosticError(new Error('VAST overlay clickThroughURL error'), {
                    contentType: 'vast_overlay',
                    clickUrl: clickThroughURL,
                    host: urlParts.host,
                    protocol: urlParts.protocol,
                    creativeId: this._vastCampaign.getCreativeId()
                });
                Diagnostics.trigger('click_request_head_rejected', error);
                return this.openUrlOnCallButton(clickThroughURL);
            });
        } else {
            return Promise.reject(new Error('No clickThroughURL was defined'));
        }
    }

    private openUrlOnCallButton(url: string): Promise<void> {
        return this.openUrl(url).then(() => {
            this.setCallButtonEnabled(true);
            this._vastAdUnit.sendVideoClickTrackingEvent(this._vastCampaign.getSession().getId());
        }).catch(() => {
            this.setCallButtonEnabled(true);
        });
    }

    private openUrl(url: string): Promise<void> {
        if (this._platform === Platform.IOS) {
            return this._core.iOS!.UrlScheme.open(url);
        } else {
            return this._core.Android!.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }

    private setCallButtonEnabled(enabled: boolean): void {
        if (this._vastOverlay) {
            this._vastOverlay.setCallButtonEnabled(enabled);
        }
    }
}
