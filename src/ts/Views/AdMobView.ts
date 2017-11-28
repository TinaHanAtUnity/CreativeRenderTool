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
import { AdMobSignalFactory } from 'AdMob/AdMobSignalFactory';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';

export interface IAdMobEventHandler {
    onClose(): void;
    onOpenURL(url: string): void;
    onGrantReward(): void;
}

const AFMAClickStringMacro = '{{AFMA_CLICK_SIGNALS_PLACEHOLDER}}';

export class AdMobView extends View<IAdMobEventHandler> {
    private _placement: Placement;
    private _campaign: AdMobCampaign;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _iframe: HTMLIFrameElement;
    private _adMobSignalFactory: AdMobSignalFactory;

    private _messageListener: EventListener;
    private _afmaBridge: AFMABridge;

    constructor(nativeBridge: NativeBridge, adMobSignalFactory: AdMobSignalFactory, container: AdUnitContainer, placement: Placement, campaign: AdMobCampaign, language: string, gameId: string, abGroup: number) {
        super(nativeBridge, 'admob');

        this._placement = placement;
        this._campaign = campaign;
        this._template = new Template(AdMobContainer);
        this._adMobSignalFactory = adMobSignalFactory;

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
        this._iframe = iframe;
        this.getIFrameSrcDoc().then((markup) => {
            iframe.srcdoc = markup;
        });
    }

    private getIFrameSrcDoc(): Promise<string> {
        const markup = this._campaign.getDynamicMarkup();
        const dom = new DOMParser().parseFromString(markup, "text/html");
        if (!dom) {
            return Promise.reject(new Error('Not a valid HTML document => ' + markup));
        }
        this.removeScriptTags(dom);
        return this.injectScripts(dom).then(() => {
            return dom.documentElement.outerHTML;
        });
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

    private injectScripts(dom: Document): Promise<void> {
        const e = dom.head || document.body;
        return this._adMobSignalFactory.getClickSignal().then((signal) => {
            this.injectScript(e, MRAIDContainer);

            const signalProto = signal.getBase64ProtoBuf();
            this.injectScript(e, AFMAContainer.replace(AFMAClickStringMacro, signalProto));
        });
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
