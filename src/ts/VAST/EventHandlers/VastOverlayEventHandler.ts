import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { MoatViewabilityService } from 'Ads/Utilities/MoatViewabilityService';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { MOAT } from 'Ads/Views/MOAT';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Request } from 'Core/Utilities/Request';
import { VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { ClickDelayTrackingTest, ABGroup } from 'Core/Models/ABGroup';

export class VastOverlayEventHandler extends OverlayEventHandler<VastCampaign> {
    private _vastAdUnit: VastAdUnit;
    private _request: Request;
    private _vastCampaign: VastCampaign;
    private _moat?: MOAT;
    private _vastOverlay?: AbstractVideoOverlay;
    private _isAbGroup: boolean;

    constructor(nativeBridge: NativeBridge, adUnit: VastAdUnit, parameters: IAdUnitParameters<VastCampaign>) {
        super(nativeBridge, adUnit, parameters);

        this._vastAdUnit = adUnit;
        this._request = parameters.request;
        this._vastCampaign = parameters.campaign;
        this._placement = parameters.placement;
        this._moat = MoatViewabilityService.getMoat();
        this._vastOverlay = this._vastAdUnit.getOverlay();
        this._isAbGroup = ClickDelayTrackingTest.isValid(parameters.configuration.getAbGroup());
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
        this._nativeBridge.Listener.sendClickEvent(this._placement.getId());
        this.sendClickTrackingEvent(this._isAbGroup);

        const clickThroughURL = this._vastAdUnit.getVideoClickThroughURL();
        if(clickThroughURL) {
            return this._request.followRedirectChain(clickThroughURL).then(
                (url: string) => {
                    return this.openUrl(url).then(() => {
                        this.setCallButtonEnabled(true);
                        this.sendClickTrackingEvent(!this._isAbGroup);
                    }).catch((e) => {
                        this.setCallButtonEnabled(true);
                    });
                }
            );
        } else {
            return Promise.reject(new Error('No clickThroughURL was defined'));
        }
    }

    private sendClickTrackingEvent(isAbGroup: boolean): void {
        if (isAbGroup) {
            this._vastAdUnit.sendVideoClickTrackingEvent(this._vastCampaign.getSession().getId());
        }
    }

    private openUrl(url: string): Promise<void> {
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.UrlScheme.open(url);
        } else {
            return this._nativeBridge.Intent.launch({
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
