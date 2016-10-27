import ThirdPartyTemplate from 'html/ThirdParty.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Observable0 } from 'Utilities/Observable';
import { HtmlCampaign } from 'Models/HtmlCampaign';

export class ThirdParty extends View {

    public onClose: Observable0 = new Observable0();

    private _campaign: HtmlCampaign;

    constructor(nativeBridge: NativeBridge, campaign: HtmlCampaign) {
        super(nativeBridge, 'empty');

        this._campaign = campaign;

        this._template = new Template(ThirdPartyTemplate);
        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.btn-close-region'
            }
        ];
    }

    public show(): void {
        super.show();

        /*let playableUrl: string | undefined;
        if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
            playableUrl = 'https://static.applifier.com/playables/SMA_android/index_android.html';
            // playableUrl = 'https://static.applifier.com/playables/SG_android/index_android.html';
        } else if(this._nativeBridge.getPlatform() === Platform.IOS) {
            playableUrl = 'https://static.applifier.com/playables/SMA_ios/index_ios.html';
            // playableUrl = 'https://static.applifier.com/playables/SG_ios/index_ios.html';
        }*/

        let iframe = <HTMLIFrameElement>this._container.querySelector('#thirdParty');
        iframe.src = this._campaign.getResource();

        window.addEventListener('message', (event: MessageEvent) => {
            if(event.data) {
                this._nativeBridge.Intent.launch({
                    'action': 'android.intent.action.VIEW',
                    'uri': event.data
                });
            }
        }, false);

        window.addEventListener('resize', (event: Event) => {
            iframe.contentWindow.postMessage({
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight
            }, '*');
        }, false);
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this.onClose.trigger();
    }

}
