import VPAIDContainerTemplate from 'html/vpaid/container.html';
import VPAIDTemplate from 'html/vpaid/VPAID.html';
import LoadingTemplate from 'html/loading.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { Timer } from 'Utilities/Timer';
import { Placement } from 'Models/Placement';

interface InitAdOptions {
    width: number;
    height: number;
    viewMode: string;
    bitrate: number;
    creativeData?: object;
    envVars?: object;
}

export interface IVPAIDHandler {
    onVPAIDCompanionClick(): void;
    onVPAIDCompanionView(): void;
    onVPAIDEvent(eventType: string, args: any[]): void;
    onVPAIDStuck(): void;
    onVPAIDSkip(): void;
    onVPAIDProgress(duration: number, remainingTime: number): void;
}

export class VPAID extends View<IVPAIDHandler> {
    private static stuckDelay = 5 * 1000;

    private vpaidSrcTag = '{{VPAID_SRC_URL}}';
    private _campaign: VPAIDCampaign;
    private _placement: Placement;

    private _iframe: HTMLIFrameElement;
    private _messageListener: (e: MessageEvent) => void;

    private _loadingScreen: HTMLElement;
    private _stuckTimer: Timer;
    private _isPaused = false;

    constructor(nativeBridge: NativeBridge, campaign: VPAIDCampaign, placement: Placement, language: string, gameId: string) {
        super(nativeBridge, 'vpaid');

        this._template = new Template(VPAIDTemplate);
        this._campaign = campaign;
        this._messageListener = (e: MessageEvent) => this.onMessage(e);

        this._loadingScreen = document.createElement('div');
        this._loadingScreen.classList.add('loading-container');
        this._loadingScreen.innerHTML = new Template(LoadingTemplate).render({});

        this._placement = placement;
        this._stuckTimer = new Timer(() => this._handlers.forEach(handler => handler.onVPAIDStuck()), VPAID.stuckDelay);

        this._bindings = [{
            selector: '.companion',
            event: 'click',
            listener: (e: Event) => this._handlers.forEach(handler => handler.onVPAIDCompanionClick())
        }];
    }

    public render(): void {
        super.render();

        const iframeSrcDoc = VPAIDContainerTemplate.replace(this.vpaidSrcTag, this._campaign.getVPAID().getScriptUrl());
        this._iframe = <HTMLIFrameElement>this._container.querySelector('iframe');
        this._iframe.setAttribute('srcdoc', iframeSrcDoc);
        this._container.insertBefore(this._loadingScreen, this._container.firstChild);

        if (this._campaign.hasCompanionAd()) {
            const companionContainer = <HTMLDivElement>this._container.querySelector('.companion-container');
            companionContainer.style.display = 'block';

            const companionElement = <HTMLImageElement>this._container.querySelector('.companion');
            const companionAd = this._campaign.getCompanionAd();
            if (companionAd) {
                const companionUrl = companionAd.getStaticResourceURL();
                companionElement.style.width = companionAd.getWidth() + 'px';
                companionElement.style.height = companionAd.getHeight() + 'px';

                if (companionUrl) {
                    companionElement.src = companionUrl;
                }
            }
        }
    }

    public show() {
        super.show();

        window.addEventListener('message', this._messageListener);
        if (this._campaign.hasCompanionAd()) {
            this._handlers.forEach(handler => handler.onVPAIDCompanionView());
        }
    }

    public hide() {
        this._iframe.contentWindow.postMessage({ type: 'destroy' }, '*');
        window.removeEventListener('message', this._messageListener);
        super.hide();
        this._stuckTimer.stop();
    }

    public showAd() {
        this._container.removeChild(this._loadingScreen);
        this._iframe.contentWindow.postMessage({
            type: 'show'
        }, '*');
        this._stuckTimer.start();
    }

    public pauseAd() {
        this._isPaused = true;
        this._iframe.contentWindow.postMessage({
            type: 'pause'
        }, '*');
        this._stuckTimer.stop();
    }

    public resumeAd() {
        this._isPaused = false;
        this._iframe.contentWindow.postMessage({
            type: 'resume'
        }, '*');
        this._stuckTimer.start();
    }

    private onMessage(e: MessageEvent) {
        switch (e.data.type) {
            case 'progress':
                this._handlers.forEach(handler => handler.onVPAIDProgress(e.data.adDuration, e.data.adRemainingTime));
                if (!this._isPaused) {
                    this._stuckTimer.reset();
                }
                break;
            case 'VPAID':
                this._handlers.forEach(handler => handler.onVPAIDEvent(e.data.eventType, e.data.args));
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
