import { IVastEndScreenHandler } from 'Views/VastEndScreen';
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
    private _adUnit: VastAdUnit;
    private _clientInfo: ClientInfo;
    private _request: Request;
    private _campaign: VastCampaign;

    constructor(nativeBridge: NativeBridge, adUnit: VastAdUnit, parameters: IAdUnitParameters<VastCampaign>) {
        this._nativeBridge = nativeBridge;
        this._adUnit = adUnit;
        this._clientInfo = parameters.clientInfo;
        this._request = parameters.request;
        this._campaign = parameters.campaign;
    }

    public onVastEndScreenClick(): Promise<void> {
        const platform = this._nativeBridge.getPlatform();
        const clickThroughURL = this._adUnit.getCompanionClickThroughUrl() || this._adUnit.getVideoClickThroughURL();
        this._adUnit.sendTrackingEvent('videoEndCardClick', this._campaign.getSession().getId(), this._clientInfo.getSdkVersion());

        if (clickThroughURL) {
            return this._request.followRedirectChain(clickThroughURL).then((url: string) => {
                if (platform === Platform.IOS) {
                    this._nativeBridge.UrlScheme.open(url);
                } else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
                    this._nativeBridge.Intent.launch({
                        'action': 'android.intent.action.VIEW',
                        'uri': url
                    });
                }
            });
        }
        return Promise.reject(new Error('There is no clickthrough URL for video or companion'));
    }

    public onVastEndScreenClose(): void {
        this._adUnit.hide();
    }

    public onKeyEvent(keyCode: number): void {
        if (keyCode === KeyCode.BACK && this._adUnit.isShowing() && !this._adUnit.canShowVideo()) {
            this._adUnit.hide();
        }
    }

    public onVastEndScreenShow(): void {
        this._adUnit.sendCompanionTrackingEvent(this._campaign.getSession().getId(), this._clientInfo.getSdkVersion());
    }

    public onEndScreenPrivacy(url: string): void {
            if (this._nativeBridge.getPlatform() === Platform.IOS) {
            this._nativeBridge.UrlScheme.open(url);
        } else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._nativeBridge.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }
}
