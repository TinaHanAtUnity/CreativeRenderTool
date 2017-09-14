import VPAIDContainerTemplate from 'html/vpaid/container.html';
import VPAIDTemplate from 'html/vpaid/VPAID.html';
import LoadingTemplate from 'html/loading.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { VPAIDCampaign } from "Models/VPAID/VPAIDCampaign";
import { Observable2 } from 'Utilities/Observable';

interface InitAdOptions {
    width: number;
    height: number;
    viewMode: string;
    bitrate: number;
    creativeData?: object;
    envVars?: object;
}

export class VPAID extends View {
    public readonly onVPAIDEvent: Observable2<string, any[]> = new Observable2<string, any[]>();
    private vpaidSrcTag = '{{VPAID_SRC_URL}}';
    private _campaign: VPAIDCampaign;
    private _iframe: HTMLIFrameElement;
    private _messageListener: (e: MessageEvent) => void;
    private _loadingScreen: HTMLElement;

    constructor(nativeBridge: NativeBridge, campaign: VPAIDCampaign) {
        super(nativeBridge, 'vpaid');

        this._template = new Template(VPAIDTemplate);
        this._campaign = campaign;
        this._messageListener = (e: MessageEvent) => this.onMessage(e);
        this._bindings = [];

        this._loadingScreen = document.createElement('div');
        this._loadingScreen.classList.add('loading-container');
        this._loadingScreen.innerHTML = new Template(LoadingTemplate).render({});
    }

    public render() {
        super.render();

        const iframeSrcDoc = VPAIDContainerTemplate.replace(this.vpaidSrcTag, this._campaign.getVPAID().getScriptUrl());
        this._iframe = <HTMLIFrameElement>this._container.querySelector('iframe');
        this._iframe.setAttribute('srcdoc', iframeSrcDoc);
        this._container.insertBefore(this._loadingScreen, this._container.firstChild);
    }

    public show() {
        super.show();
        window.addEventListener('message', this._messageListener);
    }

    public hide() {
        this._iframe.contentWindow.postMessage({ type: 'destroy' }, '*');
        window.removeEventListener('message', this._messageListener);
        super.hide();
    }

    public showAd() {
        this._container.removeChild(this._loadingScreen);
        this._iframe.contentWindow.postMessage({
            type: 'show'
        }, '*');
    }

    private onMessage(e: MessageEvent) {
        switch (e.data.type) {
            case 'VPAID':
                this.onVPAIDEvent.trigger(e.data.eventType, e.data.args);
                break;
            case 'ready':
                this.onVPAIDContainerReady();
                break;
            default:
                this._nativeBridge.Sdk.logWarning(`VPAID Unknown message type ${e.data.type}`);
                break;
        }
    }

    private onVPAIDContainerReady() {
        const initOptions = this.getInitAdOptions();
        this._iframe.contentWindow.postMessage({
            ... initOptions,
            type: 'init'
        }, '*');
    }

    private getInitAdOptions(): InitAdOptions {
        return <InitAdOptions>{
            width: this._container.clientWidth,
            height: this._container.clientHeight,
            bitrate: 500,
            viewMode: 'normal',
            creativeData: {
                AdParameters: this._campaign.getVPAID().getCreativeParameters()
            }
        };
    }
}
