import VPAIDContainerTemplate from 'html/vpaid/container.html';
import VPAIDTemplate from 'html/vpaid/VPAID.html';
import LoadingTemplate from 'html/loading.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { VPAIDCampaign } from "Models/VPAID/VPAIDCampaign";
import { Observable2, Observable0 } from 'Utilities/Observable';
import { Overlay } from 'Views/Overlay';

import VastEndScreenTemplate from 'html/VastEndScreen.html';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
interface InitAdOptions {
    width: number;
    height: number;
    viewMode: string;
    bitrate: number;
    creativeData?: object;
    envVars?: object;
}

export class VPAID extends View {
    public readonly onCompanionClick: Observable0 = new Observable0();
    public readonly onCompanionView: Observable0 = new Observable0();
    public readonly onVPAIDEvent: Observable2<string, any[]> = new Observable2<string, any[]>();
    public readonly endScreen: VPAIDEndScreen;

    private vpaidSrcTag = '{{VPAID_SRC_URL}}';
    private _campaign: VPAIDCampaign;
    private _iframe: HTMLIFrameElement;
    private _messageListener: (e: MessageEvent) => void;

    private _loadingScreen: HTMLElement;

    private _overlay: Overlay;
    private _adDuration: number = -2;
    private _adRemainingTime: number = -2;

    constructor(nativeBridge: NativeBridge, campaign: VPAIDCampaign, language: string, gameId: string) {
        super(nativeBridge, 'vpaid');

        this._template = new Template(VPAIDTemplate);
        this._campaign = campaign;
        this._messageListener = (e: MessageEvent) => this.onMessage(e);

        this._loadingScreen = document.createElement('div');
        this._loadingScreen.classList.add('loading-container');
        this._loadingScreen.innerHTML = new Template(LoadingTemplate).render({});

        this._overlay = new Overlay(nativeBridge, false, language, gameId);
        this._overlay.setFadeEnabled(false);

        if (campaign.hasEndScreen()) {
            this.endScreen = new VPAIDEndScreen(nativeBridge, campaign, gameId);
        }

        this._bindings = [{
            selector: '.companion',
            event: 'click',
            listener: (e: Event) => this.onCompanionClick.trigger()
        }];
    }

    public render() {
        super.render();
        this._overlay.render();
        this._overlay.setSkipEnabled(false);
        this._overlay.setMuteEnabled(false);

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

        if (this.endScreen) {
            this.endScreen.render();
        } else if (this._campaign.hasCompanionAd()) {
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

    public showEndScreen() {
        this._container.appendChild(this.endScreen.container());
    }

    public show() {
        super.show();

        window.addEventListener('message', this._messageListener);
        if (this._campaign.hasCompanionAd()) {
            this.onCompanionView.trigger();
        }
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

    public updateTimeoutWidget() {
        const adDuration = this._adDuration;
        const adRemainingTime = this._adRemainingTime;
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
                this._adDuration = e.data.adDuration;
                this._adRemainingTime = e.data.adRemainingTime;
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

export class VPAIDEndScreen extends View {

    public readonly onClick = new Observable0();
    public readonly onClose = new Observable0();
    public readonly onShow = new Observable0();

    private _isSwipeToCloseEnabled: boolean = false;

    constructor(nativeBridge: NativeBridge, campaign: VPAIDCampaign, gameId: string) {
        super(nativeBridge, 'end-screen');

        this._template = new Template(VastEndScreenTemplate);

        if(campaign) {
            const landscape = campaign.getCompanionLandscapeUrl();
            const portrait = campaign.getCompanionPortraitUrl();

            this._templateData = {
                'endScreenLandscape': (landscape ? landscape : (portrait ? portrait : undefined)),
                'endScreenPortrait': (portrait ? portrait : (landscape ? landscape : undefined))
            };
        }

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onClickEvent(event),
                selector: '.game-background'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.btn-close-region'
            }
        ];

        if(gameId === '1300023' || gameId === '1300024') {
            this._isSwipeToCloseEnabled = true;

            this._bindings.push({
                event: 'swipe',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.campaign-container, .game-background'
            });
        }
    }

    public render(): void {
        super.render();

        if(this._isSwipeToCloseEnabled) {
            (<HTMLElement>this._container.querySelector('.btn-close-region')).style.display = 'none';
        }
    }

    public show(): void {
        super.show();

        this.onShow.trigger();

        if(AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                this.onClose.trigger();
            }, AbstractAdUnit.getAutoCloseDelay());
        }
    }

    public remove(): void {
        this.container().parentElement!.removeChild(this.container());
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this.onClose.trigger();
    }

    private onClickEvent(event: Event): void {
        event.preventDefault();
        this.onClick.trigger();
    }

}
