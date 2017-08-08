import MOATTemplate from 'html/MOAT.html';
import MOATContainer from 'html/moat/container.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Observable0, Observable1 } from 'Utilities/Observable';
import { Platform } from 'Constants/Platform';
import { ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { IOrientationProperties } from 'Views/MRAID';

export class MOAT extends View {
    public readonly onClick = new Observable0();
    public readonly onClose = new Observable0();
    public readonly onOrientationProperties = new Observable1<IOrientationProperties>();

    private readonly onLoaded = new Observable0();

    private _iframe: HTMLIFrameElement;
    private _messageListener: any;
    private _resizeHandler: any;
    private _resizeDelayer: any;
    private _resizeTimeout: any;
    private _loaded = false;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'moat');
        this._template = new Template(MOATTemplate);
        this._bindings = [];
    }

    public render() {
        super.render();
        const iframe: any = this._iframe = <HTMLIFrameElement>this._container.querySelector('#moat-iframe');
        iframe.srcdoc = MOATContainer;
        this._messageListener = (event: MessageEvent) => this.onMessage(event);
        window.addEventListener('message', this._messageListener, false);
    }

    public resume(volume: number) {
        this.triggerEvent('AdPlaying', volume);
    }

    public init(ids: { [key: string]: string }, duration: number, url: string, moatData: any) {
        this._resizeDelayer = (event: Event) => {
            this._resizeTimeout = setTimeout(() => {
                this._resizeHandler(event);
            }, 200);
        };

        this._resizeHandler = (event: Event) => {
            if(this._iframe.contentWindow) {
                this._iframe.contentWindow.postMessage({
                    type: 'resize',
                    width: window.innerWidth,
                    height: window.innerHeight
                }, '*');
            }
        };

        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            window.addEventListener('resize', this._resizeDelayer, false);
        } else {
            window.addEventListener('resize', this._resizeHandler, false);
        }

        this._nativeBridge.Sdk.logDebug('Calling MOAT init with: ' + JSON.stringify(ids) + ' duration: ' + duration + ' url: ' + url);
        this._iframe.contentWindow.postMessage({
            type: 'init',
            data: {
                ids,
                duration,
                url,
                moatData
            }
        }, '*');
        this._iframe.contentWindow.postMessage({
            type: 'resize',
            width: window.innerWidth,
            height: window.innerHeight
        }, '*');
    }

    public triggerEvent(type: string, volume: number) {
        this._nativeBridge.Sdk.logDebug('Calling MOAT video event "' + type + '" with volume: ' + volume);
        this._iframe.contentWindow.postMessage({
            type: 'event',
            data: {
                type,
                volume
            }
        }, '*');
    }

    private onMessage(event: MessageEvent) {
        switch(event.data.type) {
            case 'loaded':
                this._loaded = true;
                this.onLoaded.trigger();
                break;

            case 'open':
                this.onClick.trigger();
                if(this._nativeBridge.getPlatform() === Platform.IOS) {
                    this._nativeBridge.UrlScheme.open(encodeURI(event.data.url));
                } else if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                    this._nativeBridge.Intent.launch({
                        'action': 'android.intent.action.VIEW',
                        'uri': encodeURI(event.data.url) // todo: these come from 3rd party sources, should be validated before general MRAID support
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

}
