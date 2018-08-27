import { NativeBridge } from 'Native/NativeBridge';
import { IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { ClientInfo } from 'Models/ClientInfo';
import { Platform } from 'Constants/Platform';
import { Request } from 'Utilities/Request';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { OverlayEventHandler } from 'EventHandlers/OverlayEventHandler';
import { MoatViewabilityService } from 'Utilities/MoatViewabilityService';
import { MOAT } from 'Views/MOAT';
import { AbstractVideoOverlay } from 'Views/AbstractVideoOverlay';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { ABGroup } from 'Models/ABGroup';

export class VastOverlayEventHandler extends OverlayEventHandler<VastCampaign> {
    private _vastAdUnit: VastAdUnit;
    private _clientInfo: ClientInfo;
    private _request: Request;
    private _vastCampaign: VastCampaign;
    private _moat?: MOAT;
    private _vastOverlay?: AbstractVideoOverlay;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _abGroup: ABGroup;

    constructor(nativeBridge: NativeBridge, adUnit: VastAdUnit, parameters: IAdUnitParameters<VastCampaign>) {
        super(nativeBridge, adUnit, parameters);

        this._vastAdUnit = adUnit;
        this._request = parameters.request;
        this._clientInfo = parameters.clientInfo;
        this._vastCampaign = parameters.campaign;
        this._placement = parameters.placement;
        this._moat = MoatViewabilityService.getMoat();
        this._vastOverlay = this._vastAdUnit.getOverlay();
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._abGroup = parameters.configuration.getAbGroup();
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

        const clickThroughURL = this._vastAdUnit.getVideoClickThroughURL();
        if(clickThroughURL) {
            return this._request.followRedirectChain(clickThroughURL).then(
                (url: string) => {
                    return this.openUrl(url).then(() => {
                        this.setCallButtonEnabled(true);
                        this._vastAdUnit.sendVideoClickTrackingEvent(this._vastCampaign.getSession().getId());
                    }).catch((e) => {
                        this.setCallButtonEnabled(true);
                    });
                }
            );
        } else {
            return Promise.reject(new Error('No clickThroughURL was defined'));
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
