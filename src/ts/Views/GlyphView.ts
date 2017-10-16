import { View } from 'Views/View';
import GlyphContainer from 'html/glyph/GlyphContainer.html';
import AFMAContainer from 'html/glyph/AFMAContainer.html';
import NativeVideoPlayerBridgeContainer from 'html/NativeVideoPlayerBridge.html';
import MRAIDContainer from 'html/glyph/MRAIDContainer.html';

import { NativeBridge } from 'Native/NativeBridge';
import { Placement } from 'Models/Placement';
import { GlyphCampaign } from 'Models/Campaigns/GlyphCampaign';
import { Template } from 'Utilities/Template';
import { Overlay } from 'Views/Overlay';
import { NativeVideoPlayerBridge } from 'Utilities/NativeVideoPlayerBridge';

export class GlyphView extends View {
    public readonly videoBridge: NativeVideoPlayerBridge;
    private _placement: Placement;
    private _campaign: GlyphCampaign;
    private _iframe: HTMLIFrameElement;

    private _messageListener: EventListener;
    private _overlay: Overlay;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: GlyphCampaign, language: string, gameId: string, abGroup: number) {
        super(nativeBridge, 'glyph');

        this._placement = placement;
        this._campaign = campaign;
        this._overlay = new Overlay(nativeBridge, false, language, gameId, abGroup);
        this._template = new Template(GlyphContainer);

        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);

        this._bindings = [];

        this.videoBridge = new NativeVideoPlayerBridge(this._nativeBridge);
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
        this.videoBridge.disconnect();
    }

    private setupIFrame() {
        const iframe: any = this._iframe = <HTMLIFrameElement>this._container.querySelector('#glyph-iframe');
        const markup = this.getIFrameSrcDoc();
        iframe.srcdoc = markup;

        this._iframe = iframe;
    }

    private setupOverlay() {
        this._overlay.render();
        this._overlay.setFadeEnabled(true);
        this._overlay.setVideoDurationEnabled(true);
        this._container.insertBefore(this._overlay.container(), this._container.firstChild);
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
}
