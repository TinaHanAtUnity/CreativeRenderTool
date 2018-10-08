import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { KeyCode } from 'Core/Constants/Android/KeyCode';
import { Platform } from 'Core/Constants/Platform';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Request } from 'Core/Managers/Request';
import { VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { IVastEndScreenHandler, VastEndScreen } from 'VAST/Views/VastEndScreen';
import { ICoreApi } from '../../Core/Core';

export class VastEndScreenEventHandler implements IVastEndScreenHandler {
    private _vastAdUnit: VastAdUnit;
    private _clientInfo: ClientInfo;
    private _request: Request;
    private _campaign: VastCampaign;
    private _vastEndScreen: VastEndScreen | null;
    private _platform: Platform;
    private _core: ICoreApi;

    constructor(adUnit: VastAdUnit, parameters: IAdUnitParameters<VastCampaign>) {
        this._platform = parameters.platform;
        this._core = parameters.core;
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
        if (this._vastEndScreen) {
            this._vastEndScreen.setCallButtonEnabled(enabled);
        }
    }
}
