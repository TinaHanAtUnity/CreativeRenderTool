import { IMoatData, IMoatIds } from 'Ads/Utilities/MoatViewabilityService';
import { View } from 'Ads/Views/View';
import { Platform } from 'Common/Constants/Platform';

import { NativeBridge } from 'Common/Native/NativeBridge';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Template } from 'Core/Utilities/Template';
import MOATTemplate from 'html/MOAT.html';
import MOATContainer from 'html/moat/container.html';
import { VastCampaign } from 'VAST/Models/VastCampaign';

export enum MoatState {
    PLAYING,
    PAUSED,
    COMPLETED,
    STOPPED
}

export class MOAT extends View<VastCampaign> {
    private _iframe: HTMLIFrameElement;
    private _resizeHandler: any;
    private _resizeDelayer: any;
    private _resizeTimeout: any;
    private _didInitMoat = false;
    private _messageListener: (e: MessageEvent) => void;
    private _state: MoatState = MoatState.STOPPED;

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

    public play(volume: number): void {
        if(this.getState() === MoatState.STOPPED || this.getState() === MoatState.PAUSED) {
            this.setState(MoatState.PLAYING);
            this.triggerVideoEvent('AdPlaying', volume);
            this.triggerViewabilityEvent('exposure', true);
        }
    }

    public pause(volume: number): void {
        if(this.getState() === MoatState.PLAYING && this._iframe.contentWindow) {
            this.setState(MoatState.PAUSED);
            this.triggerVideoEvent('AdPaused', volume);
            this.triggerViewabilityEvent('exposure', false);
        }
    }

    public stop(volume: number): void {
        if(this.getState() === MoatState.PLAYING || this.getState() === MoatState.PAUSED) {
            this.setState(MoatState.STOPPED);
            this.triggerVideoEvent('AdStopped', volume);
        }
    }

    public completed(volume: number): void {
        if(this.getState() !== MoatState.COMPLETED) {
            this.setState(MoatState.COMPLETED);
            this.triggerVideoEvent('AdVideoComplete', volume);
        }
    }

    public volumeChange(volume: number): void {
        if(this.getState() !== MoatState.COMPLETED) {
            this.triggerVideoEvent('AdVolumeChange', volume);
            this.triggerViewabilityEvent('volume', volume * 100);
        }
    }

    public init(ids: IMoatIds, duration: number, url: string, moatData: IMoatData, volume: number) {
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
            this._iframe.contentWindow!.postMessage({
                type: 'init',
                data: {
                    ids,
                    duration,
                    url,
                    moatData
                }
            }, '*');
            this._iframe.contentWindow!.postMessage({
                type: 'resize',
                width: window.innerWidth,
                height: window.innerHeight
            }, '*');
        } else {
            if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                this.play(volume);
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

    public getState(): MoatState {
        return this._state;
    }

    private setState(state: MoatState): void {
        this._state = state;
    }

    private onMessage(e: MessageEvent) {
        if (e && e.data && e.data.type) {
            switch(e.data.type) {
                case 'MOATVideoError':
                    Diagnostics.trigger('moat_video_error', e.data.error);
                    break;
                case 'loaded':
                    // do nothing
                    break;
                default:
                    this._nativeBridge.Sdk.logWarning(`MOAT Unknown message type ${e.data.type}`);
            }
        }
    }
}
