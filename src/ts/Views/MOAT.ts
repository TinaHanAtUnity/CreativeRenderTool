import MOATTemplate from 'html/MOAT.html';
import MOATContainer from 'html/moat/container.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Platform } from 'Constants/Platform';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Diagnostics } from 'Utilities/Diagnostics';

export class MOAT extends View<VastCampaign> {
    private _iframe: HTMLIFrameElement;
    private _resizeHandler: any;
    private _resizeDelayer: any;
    private _resizeTimeout: any;
    private _didInitMoat = false;
    private _messageListener: (e: MessageEvent) => void;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'moat');
        this._template = new Template(MOATTemplate);
        this._bindings = [];
        this._messageListener = (e: MessageEvent) => this.onMessage(e);
    }

    public render(): void {
        super.render();
        const iframe: any = this._iframe = <HTMLIFrameElement>this._container.querySelector('#moat-iframe');
        iframe.srcdoc = MOATContainer;
    }

    public resume(volume: number) {
        this.triggerVideoEvent('AdPlaying', volume);
        this.triggerViewabilityEvent('exposure', true);

    }

    public pause(volume: number) {
        if (this._iframe.contentWindow) {
            this.triggerVideoEvent('AdPaused', volume);
            this.triggerViewabilityEvent('exposure', false);
        }
    }

    public init(ids: { [key: string]: string }, duration: number, url: string, moatData: any, volume: number) {
        if (!this._didInitMoat) {
            this._didInitMoat = true;
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
        } else {
            if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                this.resume(volume);
            }
        }
    }

    public addMessageListener() {
        window.addEventListener('message', this._messageListener);
    }

    public removeMessageListener() {
        window.removeEventListener('message', this._messageListener);
    }

    public triggerVideoEvent(type: string, volume: number) {
        this._nativeBridge.Sdk.logDebug('Calling MOAT video event "' + type + '" with volume: ' + volume);
        if (this._iframe.contentWindow) {
            this._iframe.contentWindow.postMessage({
                type: 'videoEvent',
                data: {
                    type,
                    volume
                }
            }, '*');
        }
    }

    public triggerViewabilityEvent(type: string, payload: any) {
        this._nativeBridge.Sdk.logDebug('Calling MOAT viewability event "' + type + '" with payload: ' + payload);
        if (this._iframe.contentWindow) {
            this._iframe.contentWindow.postMessage({
                type: type,
                payload: payload
            }, '*');
        }
    }

    private onMessage(e: MessageEvent) {
        switch(e.data.type) {
            case 'MOATVideoError':
                Diagnostics.trigger('moat_video_error', e.data.error);
                break;
            default:
                this._nativeBridge.Sdk.logWarning(`MOAT Unknown message type ${e.data.type}`);
                break;
        }
    }
}
