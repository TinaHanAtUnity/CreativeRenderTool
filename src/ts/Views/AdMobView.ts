import { View } from 'Views/View';
import AdMobContainer from 'html/admob/AdMobContainer.html';
import AFMAContainer from 'html/admob/AFMAContainer.html';
import NativeVideoPlayerBridgeContainer from 'html/NativeVideoPlayerBridge.html';
import MRAIDContainer from 'html/admob/MRAIDContainer.html';

import { NativeBridge } from 'Native/NativeBridge';
import { Placement } from 'Models/Placement';
import { AdMobCampaign } from 'Models/Campaigns/AdMobCampaign';
import { Template } from 'Utilities/Template';
import { Overlay, IOverlayHandler } from 'Views/Overlay';
import { NativeVideoPlayerBridge } from 'Utilities/NativeVideoPlayerBridge';
import { AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';

export interface IAdMobEventHandler {
    onSkip(): void;
}

export class AdMobView extends View<IAdMobEventHandler> implements IOverlayHandler {
    public readonly videoBridge: NativeVideoPlayerBridge;

    private _placement: Placement;
    private _campaign: AdMobCampaign;
    private _iframe: HTMLIFrameElement;

    private _messageListener: EventListener;
    private _overlay: Overlay;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, placement: Placement, campaign: AdMobCampaign, language: string, gameId: string, abGroup: number) {
        super(nativeBridge, 'admob');

        this._placement = placement;
        this._campaign = campaign;
        this._overlay = new Overlay(nativeBridge, false, language, gameId, abGroup);
        this._overlay.addEventHandler(this);

        this._template = new Template(AdMobContainer);

        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);

        this._bindings = [];

        this.videoBridge = new NativeVideoPlayerBridge(this._nativeBridge, container);
        this.videoBridge.onProgress.subscribe((progress) => this.onVideoProgress(progress));
        this.videoBridge.onPrepare.subscribe((duration) => this.onVideoPrepared(duration));
    }

    public render() {
        super.render();
        this.setupIFrame();
        this.setupOverlay();
    }

    public show(): void {
        super.show();
        window.addEventListener('message', this._messageListener);
        this.videoBridge.connect(this._iframe);
    }

    public hide() {
        window.removeEventListener('message', this._messageListener);
        super.hide();
        this.videoBridge.stopVideo();
        this.videoBridge.disconnect();
    }

    public onOverlayPauseForTesting(paused: boolean) {
        // EMPTY
    }

    public onOverlayCallButton() {
        // EMPTY
    }

    public onOverlayMute(isMuted: boolean) {
        isMuted ? this.onMute() : this.onUnmute();
    }

    public onOverlaySkip() {
        this._handlers.forEach((handler) => handler.onSkip());
    }

    private setupIFrame() {
        const iframe: any = this._iframe = <HTMLIFrameElement>this._container.querySelector('#admob-iframe');
        const markup = this.getIFrameSrcDoc();
        iframe.srcdoc = markup;

        this._iframe = iframe;
    }

    private setupOverlay() {
        this._overlay.render();
        this._overlay.setFadeEnabled(true);
        this._overlay.setVideoDurationEnabled(true);
        this._overlay.setMuteEnabled(true);

        if (this._placement.allowSkip()) {
            this._overlay.setSkipEnabled(true);
            this._overlay.setSkipDuration(this._placement.allowSkipInSeconds());
        } else {
            this._overlay.setSkipEnabled(false);
        }

        const overlayEl = this._overlay.container();
        overlayEl.style.position = 'absolute';
        this._container.insertBefore(overlayEl, this._container.firstChild);
    }

    private onMessage(e: MessageEvent) {
        switch (e.data.type) {
        }
    }

    private getIFrameSrcDoc(): string {
        const markup = this._campaign.getDynamicMarkup();
        const dom = new DOMParser().parseFromString(markup, "text/html");
        if (!dom) {
            return markup;
        }
        this.removeScriptTags(dom);
        this.injectScripts(dom);
        return dom.documentElement.outerHTML;
    }

    private removeScriptTags(dom: Document) {
        this.removeScriptTag(dom, 'mraid.js');
        this.removeScriptTag(dom, 'unity_afma.js');
        this.removeScriptTag(dom, 'unity_video_player.js');
        return dom.documentElement.outerHTML;
    }

    private removeScriptTag(doc: Document, scriptName: string) {
        const scriptElement = doc.querySelector(`script[src^="${scriptName}"]`);
        if (scriptElement && scriptElement.parentNode) {
            scriptElement.parentNode.removeChild(scriptElement);
        }
    }

    private injectScripts(dom: Document) {
        const e = dom.head || document.body;
        this.injectScript(e, AFMAContainer);
        this.injectScript(e, NativeVideoPlayerBridgeContainer);
        this.injectScript(e, MRAIDContainer);
    }

    private injectScript(e: HTMLElement, script: string) {
        e.innerHTML = script + e.innerHTML;
    }

    private onVideoProgress(progress: number) {
        this.updateTimerProgress(progress);
    }

    private updateTimerProgress(progress: number) {
        this._overlay.setVideoProgress(progress);
    }

    private onVideoPrepared(duration: number) {
        this.updateTimerDuration(duration);
    }

    private updateTimerDuration(duration: number) {
        this._overlay.setVideoDuration(duration);
    }

    private onMute() {
        this.videoBridge.muteVideo();
    }

    private onUnmute() {
        this.videoBridge.unmuteVideo();
    }
}
