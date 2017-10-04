import VPAIDContainerTemplate from 'html/vpaid/container.html';
import VPAIDTemplate from 'html/vpaid/VPAID.html';
import LoadingTemplate from 'html/loading.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { VPAIDCampaign } from "Models/VPAID/VPAIDCampaign";
import { Observable2 } from 'Utilities/Observable';
import { Overlay } from 'Views/Overlay';

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
    private _overlay: Overlay;

    private _overlayUpdateHandle: number;

    constructor(nativeBridge: NativeBridge, campaign: VPAIDCampaign, language: string, gameId: string) {
        super(nativeBridge, 'vpaid');

        this._template = new Template(VPAIDTemplate);
        this._campaign = campaign;
        this._messageListener = (e: MessageEvent) => this.onMessage(e);
        this._bindings = [];

        this._loadingScreen = document.createElement('div');
        this._loadingScreen.classList.add('loading-container');
        this._loadingScreen.innerHTML = new Template(LoadingTemplate).render({});

        this._overlay = new Overlay(nativeBridge, false, language, gameId);
        this._overlay.setFadeEnabled(false);
    }

    public render() {
        super.render();
        this._overlay.render();
        this._overlay.setSkipEnabled(false);
        this._overlay.setMuteEnabled(false);
        this._overlay.setVideoDurationEnabled(true);

        const iframeSrcDoc = VPAIDContainerTemplate.replace(this.vpaidSrcTag, this._campaign.getVPAID().getScriptUrl());
        this._iframe = <HTMLIFrameElement>this._container.querySelector('iframe');
        this._iframe.setAttribute('srcdoc', iframeSrcDoc);
        this._container.insertBefore(this._loadingScreen, this._container.firstChild);

        const overlayContainer = this._overlay.container();
        overlayContainer.style.pointerEvents = 'none';
        overlayContainer.style.position = 'absolute';
        overlayContainer.style.top = '0px';
        overlayContainer.style.left = '0px';
        this._container.insertBefore(overlayContainer, this._container.lastChild);
    }

    public show() {
        super.show();
        window.addEventListener('message', this._messageListener);
        this._overlayUpdateHandle = window.setInterval(() => {
            this.updateTimeoutWidget();
        }, 1000);
    }

    public hide() {
        window.clearInterval(this._overlayUpdateHandle);
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

    public updateTimeoutWidget() {
        const container: IVPAIDContainer = (<IVPAIDWindowExt>this._iframe.contentWindow).container;
        const adDuration = container.getAdDuration();
        const adRemainingTime = container.getAdRemainingTime();
        if ((adDuration && adDuration !== -2) && (adRemainingTime && adRemainingTime !== -2)) {
            this._overlay.setVideoDurationEnabled(true);
            this._overlay.setVideoDuration(adDuration * 1000);
            this._overlay.setVideoProgress((adDuration - adRemainingTime) * 1000);
        } else {
            this._overlay.setVideoDurationEnabled(false);
        }
    }

    private onMessage(e: MessageEvent) {
        switch (e.data.type) {
            case 'progress':
                this.updateTimeoutWidget();
                break;
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

interface IVPAIDWindowExt extends Window {
    container: IVPAIDContainer;
}

interface IVPAIDContainer {
    getHandshakeVersion(): string;
    getAdDuration(): number;
    getAdRemainingTime(): number;
}
