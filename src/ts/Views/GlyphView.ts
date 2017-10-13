import { View } from 'Views/View';
import GlyphContainer from 'html/glyph/GlyphContainer.html';
import AFMAContainer from 'html/glyph/AFMAContainer.html';
import NativeVideoPlayerBridgeContainer from 'html/NativeVideoPlayerBridge.html';
import MRAIDContainer from 'html/glyph/MRAIDContainer.html';

import { NativeBridge } from 'Native/NativeBridge';
import { Observable0, Observable1 } from 'Utilities/Observable';
import { Placement } from 'Models/Placement';
import { GlyphCampaign } from 'Models/Campaigns/GlyphCampaign';
import { Template } from 'Utilities/Template';
import { Overlay } from 'Views/Overlay';
import { NativeVideoPlayerBridge } from 'Utilities/NativeVideoPlayerBridge';

export class GlyphView extends View {

    public readonly onOpenURL = new Observable1<string>();
    public readonly onReward = new Observable0();
    public readonly onSkip = new Observable0();
    public readonly onClose = new Observable0();
    public readonly onPrepareVideo = new Observable1<string>();
    public readonly onPlayVideo = new Observable0();

    private _placement: Placement;
    private _campaign: GlyphCampaign;

    private _closeElement: HTMLElement;
    private _iframe: HTMLIFrameElement;

    private _markup: string;

    private _messageListener: EventListener;
    private _overlay: Overlay;
    private _videoBridge: NativeVideoPlayerBridge;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: GlyphCampaign, language: string, gameId: string, abGroup: number) {
        super(nativeBridge, 'glyph');

        this._placement = placement;
        this._campaign = campaign;
        this._overlay = new Overlay(nativeBridge, false, language, gameId, abGroup);
        this._template = new Template(GlyphContainer);

        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);

        this._bindings = [];

        this._videoBridge = new NativeVideoPlayerBridge();
        this._videoBridge.onPlay.subscribe(() => this.onPlayVideo.trigger());
        this._videoBridge.onPrepare.subscribe((url: string) => this.onPrepareVideo.trigger(url));
    }

    public render() {
        super.render();

        this._markup = this._campaign.getDynamicMarkup();
        this._closeElement = <HTMLElement>this._container.querySelector('.close-region');

        const iframe: any = this._iframe = <HTMLIFrameElement>this._container.querySelector('#glyph-iframe');
        const markup = this.getIFrameSrcDoc();
        iframe.srcdoc = markup;

        this._iframe = iframe;
    }

    public show(): void {
        super.show();
        window.addEventListener('message', this._messageListener);
        this._videoBridge.connect(this._iframe);
    }

    public hide() {
        window.removeEventListener('message', this._messageListener);
        super.hide();
        this._videoBridge.disconnect();
    }

    public onVideoPrepared(url: string, duration: number, width: number, height: number) {
        this._videoBridge.notifyPrepared(duration);
        this._videoBridge.notifyCanPlay();
    }

    public onVideoProgress(progress: number) {
        this._videoBridge.notifyProgress(progress);
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
}
