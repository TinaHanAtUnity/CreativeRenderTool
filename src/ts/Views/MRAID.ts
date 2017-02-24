import MRAIDContainer from 'html/mraid/container.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Observable0, Observable1 } from 'Utilities/Observable';
import { Placement } from 'Models/Placement';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { Platform } from 'Constants/Platform';
import { ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';

export interface IOrientationProperties {
    allowOrientationChange: boolean;
    forceOrientation: ForceOrientation;
}

export class MRAID extends View {

    public onClick: Observable0 = new Observable0();
    public onClose: Observable0 = new Observable0();
    public onOrientationProperties: Observable1<IOrientationProperties> = new Observable1();

    private onLoaded: Observable0 = new Observable0();

    private _placement: Placement;
    private _campaign: MRAIDCampaign;

    private _iframe: HTMLIFrameElement;
    private _loaded = false;

    private _resizeHandler: any;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: MRAIDCampaign) {
        super(nativeBridge, 'mraid');

        this._placement = placement;
        this._campaign = campaign;

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.btn-close-region'
            }
        ];
    }

    public render() {
        const iframe: any = this._iframe = <HTMLIFrameElement>document.createElement('iframe');
        iframe.id = this._id;
        this.createMRAID().then(mraid => {
            iframe.srcdoc = mraid;
        });
        window.addEventListener('message', (event: MessageEvent) => this.onMessage(event), false);
        this._container = iframe;
    }

    public show(): void {
        super.show();
        if(this._loaded) {
            this._iframe.contentWindow.postMessage('viewable', '*');
        } else {
            const observer = this.onLoaded.subscribe(() => {
                this._iframe.contentWindow.postMessage({
                    type: 'viewable',
                    value: true
                }, '*');
                this.onLoaded.unsubscribe(observer);
            });
        }
        this._resizeHandler = (event: Event) => {
            if(this._iframe.contentWindow) {
                this._iframe.contentWindow.postMessage({
                    type: 'resize',
                    width: window.innerWidth,
                    height: window.innerHeight
                }, '*');
            }
        };
        window.addEventListener('resize', this._resizeHandler, false);
    }

    public hide() {
        this._iframe.contentWindow.postMessage({
            type: 'viewable',
            value: false
        }, '*');
        if(this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler, false);
            this._resizeHandler = undefined;
        }
        super.hide();
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this.onClose.trigger();
    }

    private onMessage(event: MessageEvent) {
        switch(event.data.type) {
            case 'loaded':
                this._loaded = true;
                this.onLoaded.trigger();
                break;

            case 'open':
                if(this._nativeBridge.getPlatform() === Platform.IOS) {
                    this._nativeBridge.UrlScheme.open(encodeURI(event.data.url));
                } else if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                    this._nativeBridge.Intent.launch({
                        'action': 'android.intent.action.VIEW',
                        'uri': encodeURI(event.data.url)
                    });
                }
                break;

            case 'close':
                this.onClose.trigger();
                break;

            case 'orientation':
                let forceOrientation = ForceOrientation.NONE;
                switch(event.data.properties.forceOrientation) {
                    case 'portrait':
                        forceOrientation = ForceOrientation.PORTRAIT;
                        break;

                    case 'landscape':
                        forceOrientation = ForceOrientation.LANDSCAPE;
                        break;

                    default:
                        break;
                }
                this.onOrientationProperties.trigger({
                    allowOrientationChange: event.data.properties.allowOrientationChange,
                    forceOrientation: forceOrientation
                });
                break;

            default:
                break;
        }
    }

    private createMRAID(): Promise<string> {
        return this.fetchMRAID().then(mraid => {
            return MRAIDContainer.replace('<body></body>', '<body>' + mraid.replace('<script src="mraid.js"></script>', '') + '</body>');
        });
    }

    private fetchMRAID(): Promise<string> {
        const resourceUrl = this._campaign.getResourceUrl();
        if(resourceUrl) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.addEventListener('load', () => {
                    resolve(xhr.responseText);
                }, false);
                xhr.open('GET', decodeURIComponent(resourceUrl.getUrl()));
                xhr.send();
            });
        } else {
            return Promise.resolve(this._campaign.getResource());
        }
    }

}
