import { IVastEndScreenHandler, VastEndScreen } from 'Views/VastEndScreen';
import { IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { ClientInfo } from 'Models/ClientInfo';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { Request } from 'Utilities/Request';
import { Platform } from 'Constants/Platform';
import { KeyCode } from 'Constants/Android/KeyCode';
import { VastCampaign } from 'Models/Vast/VastCampaign';

export class VastEndScreenEventHandler implements IVastEndScreenHandler {
    private _nativeBridge: NativeBridge;
    private _vastAdUnit: VastAdUnit;
    private _clientInfo: ClientInfo;
    private _request: Request;
    private _campaign: VastCampaign;
    private _vastEndScreen: VastEndScreen | null;

    constructor(nativeBridge: NativeBridge, adUnit: VastAdUnit, parameters: IAdUnitParameters<VastCampaign>) {
        this._nativeBridge = nativeBridge;
        this._vastAdUnit = adUnit;
        this._clientInfo = parameters.clientInfo;
        this._request = parameters.request;
        this._campaign = parameters.campaign;
        this._vastEndScreen = this._vastAdUnit.getEndScreen();
    }

    public onVastEndScreenClick(): Promise<void> {
        this.setCallButtonEnabled(false);

        const clickThroughURL = this._vastAdUnit.getCompanionClickThroughUrl() || this._vastAdUnit.getVideoClickThroughURL();

        if (clickThroughURL) {
            return this._request.followRedirectChain(clickThroughURL).then((url: string) => {
                return this.onOpenUrl(url).then(() => {
                    this.setCallButtonEnabled(true);
                    this._vastAdUnit.sendTrackingEvent('videoEndCardClick', this._campaign.getSession().getId());
                }).catch((e) => {
                    this.setCallButtonEnabled(true);
                });
            });
        }
        return Promise.reject(new Error('There is no clickthrough URL for video or companion'));
    }

    public onVastEndScreenClose(): void {
        this._vastAdUnit.hide();
    }

    public onKeyEvent(keyCode: number): void {
        if (keyCode === KeyCode.BACK && this._vastAdUnit.isShowing() && !this._vastAdUnit.canShowVideo()) {
            this._vastAdUnit.hide();
        }
    }

    public onVastEndScreenShow(): void {
        this._vastAdUnit.sendCompanionTrackingEvent(this._campaign.getSession().getId());
    }

    public onOpenUrl(url: string): Promise<void> {
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
        if (this._vastEndScreen) {
            this._vastEndScreen.setCallButtonEnabled(enabled);
        }
    }
}
