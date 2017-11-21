import { View } from 'Views/View';
import AdMobContainer from 'html/admob/AdMobContainer.html';
import AFMAContainer from 'html/admob/AFMAContainer.html';
import MRAIDContainer from 'html/admob/MRAIDContainer.html';

import { NativeBridge } from 'Native/NativeBridge';
import { Placement } from 'Models/Placement';
import { AdMobCampaign } from 'Models/Campaigns/AdMobCampaign';
import { Template } from 'Utilities/Template';
import { AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';
import { AFMABridge } from 'Views/AFMABridge';

export interface IAdMobEventHandler {
    onClose(): void;
    onOpenURL(url: string): void;
}

export class AdMobView extends View<IAdMobEventHandler> {
    private _placement: Placement;
    private _campaign: AdMobCampaign;
    private _iframe: HTMLIFrameElement;

    private _messageListener: EventListener;
    private _afmaBridge: AFMABridge;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, placement: Placement, campaign: AdMobCampaign, language: string, gameId: string, abGroup: number) {
        super(nativeBridge, 'admob');

        this._placement = placement;
        this._campaign = campaign;
        this._template = new Template(AdMobContainer);

        this._afmaBridge = new AFMABridge({
            onAFMAClose: () => this.onClose(),
            onAFMAOpenURL: (url: string) => this.onOpenURL(url),
            onAFMADisableBackButton: () => { /**/ },
            onAFMAClick: (url) => this.onOpenURL(url),
            onAFMAFetchAppStoreOverlay: () => { /**/ },
            onAFMAForceOrientation: () => { /**/ },
            onAFMAGrantReward: () => { /**/ },
            onAFMAOpenInAppStore: () => { /**/ },
            onAFMAOpenStoreOverlay: () => { /**/ },
            onAFMARewardedVideoStart: () => { /**/ }
        });

        this._bindings = [];
    }

    public render() {
        super.render();
        this.setupIFrame();
    }

    public show(): void {
        super.show();
        this._afmaBridge.connect(this._iframe);
        window.addEventListener('message', this._messageListener);
    }

    public hide() {
        window.removeEventListener('message', this._messageListener);
        this._afmaBridge.disconnect();
        super.hide();
    }

    private setupIFrame() {
        const iframe: any = this._iframe = <HTMLIFrameElement>this._container.querySelector('#admob-iframe');
        const markup = this.getIFrameSrcDoc();
        iframe.srcdoc = markup;

        this._iframe = iframe;
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
        this.removeScriptTag(dom, 'afma_unity_stub.js');
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
        this.injectScript(e, MRAIDContainer);
    }

    private injectScript(e: HTMLElement, script: string) {
        e.innerHTML = script + e.innerHTML;
    }

    private onClose() {
        this._handlers.forEach((h) => h.onClose());
    }

    private onOpenURL(url: string) {
        this._handlers.forEach((h) => h.onOpenURL(url));
    }
}
