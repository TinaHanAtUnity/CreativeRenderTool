import { NativeBridge } from 'Native/NativeBridge';
import { IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { ClientInfo } from 'Models/ClientInfo';
import { Platform } from 'Constants/Platform';
import { Request } from 'Utilities/Request';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { OverlayEventHandler } from 'EventHandlers/OverlayEventHandler';
import { ViewController } from 'AdUnits/Containers/ViewController';

export class VastOverlayEventHandler extends OverlayEventHandler<VastCampaign> {
    private _vastAdUnit: VastAdUnit;
    private _request: Request;
    private _vastCampaign: VastCampaign;
    private _paused: boolean = false;

    constructor(nativeBridge: NativeBridge, adUnit: VastAdUnit, parameters: IAdUnitParameters<VastCampaign>) {
        super(nativeBridge, adUnit, parameters);

        this._vastAdUnit = adUnit;
        this._request = parameters.request;
        this._vastCampaign = parameters.campaign;
        this._placement = parameters.placement;
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
            const moat = this._vastAdUnit.getMoat();
            if(moat) {
                moat.triggerVideoEvent('AdVolumeChange', 0);
                moat.triggerViewabilityEvent('volume', 0.0);
            }
            this._vastAdUnit.sendTrackingEvent('mute', this._vastCampaign.getSession().getId(), this._clientInfo.getSdkVersion());
        } else {
            const moat = this._vastAdUnit.getMoat();
            if(moat) {
                moat.triggerVideoEvent('AdVolumeChange', this._vastAdUnit.getVolume());
                moat.triggerViewabilityEvent('volume', this._vastAdUnit.getVolume() * 100);
            }
            this._vastAdUnit.sendTrackingEvent('unmute', this._vastCampaign.getSession().getId(), this._clientInfo.getSdkVersion());
        }

    }

    public onOverlayCallButton(): Promise<void> {
        super.onOverlayCallButton();

        this._nativeBridge.Listener.sendClickEvent(this._placement.getId());
        this._vastAdUnit.sendVideoClickTrackingEvent(this._vastCampaign.getSession().getId(), this._clientInfo.getSdkVersion());

        const clickThroughURL = this._vastAdUnit.getVideoClickThroughURL();
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

    public onOverlayPauseForTesting(paused: boolean): void {
        if(!this._paused) {
            if(this._nativeBridge.getPlatform() === Platform.IOS) {
                (this._vastAdUnit.getContainer() as ViewController).pause();
            }
            this._nativeBridge.VideoPlayer.pause();
            this._paused = true;
        } else {
            if(this._nativeBridge.getPlatform() === Platform.IOS) {
                (this._vastAdUnit.getContainer() as ViewController).unPause();
            }
            this._nativeBridge.VideoPlayer.play();
            const moat = this._vastAdUnit.getMoat();
            if(moat) {
                moat.triggerViewabilityEvent('exposure', true);
                moat.triggerVideoEvent('AdPlaying', this._vastAdUnit.getVolume());
            }
            this._paused = false;
        }
    }
}
