import { IOverlayHandler } from 'Views/Overlay';
import { NativeBridge } from 'Native/NativeBridge';
import { IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { ClientInfo } from 'Models/ClientInfo';
import { Platform } from 'Constants/Platform';
import { Request } from 'Utilities/Request';
import { VastCampaign } from 'Models/Vast/VastCampaign';

export class VastOverlayEventHandler implements IOverlayHandler {
    private _nativeBridge: NativeBridge;
    private _adUnit: VastAdUnit;
    private _clientInfo: ClientInfo;
    private _request: Request;

    constructor(nativeBridge: NativeBridge, adUnit: VastAdUnit, parameters: IAdUnitParameters<VastCampaign>) {
        this._nativeBridge = nativeBridge;
        this._adUnit = adUnit;
        this._request = parameters.request;
    }

    public onOverlaySkip(position: number): void {
        const endScreen = this._adUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
            this._adUnit.onFinish.trigger();
        } else {
            this._adUnit.hide();
        }
    }

    public onOverlayMute(isMuted: boolean): void {
        if (isMuted) {
            this._adUnit.sendTrackingEvent('mute', this._adUnit.getCampaign().getSession().getId(), this._clientInfo.getSdkVersion());
        } else {
            this._adUnit.sendTrackingEvent('unmute', this._adUnit.getCampaign().getSession().getId(), this._clientInfo.getSdkVersion());
        }

    }

    public onOverlayCallButton(): Promise<void> {
        this._nativeBridge.Listener.sendClickEvent(this._adUnit.getPlacement().getId());

        this._adUnit.sendVideoClickTrackingEvent(this._adUnit.getCampaign().getSession().getId(), this._clientInfo.getSdkVersion());

        const clickThroughURL = this._adUnit.getVideoClickThroughURL();
        if(clickThroughURL) {
            return this._request.followRedirectChain(clickThroughURL).then((url: string) => {
                if(this._nativeBridge.getPlatform() === Platform.IOS) {
                    this._nativeBridge.UrlScheme.open(url);
                } else {
                    this._nativeBridge.Intent.launch({
                        'action': 'android.intent.action.VIEW',
                        'uri': url
                    });
                }
            });
        }
        return Promise.reject(new Error('No clickThroughURL was defined'));
    }
}
