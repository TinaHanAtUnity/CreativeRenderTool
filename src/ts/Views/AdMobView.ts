import { View } from 'Views/View';
import AdMobContainer from 'html/admob/AdMobContainer.html';
import AFMAContainer from 'html/admob/AFMAContainer.html';
import MRAIDContainer from 'html/admob/MRAIDContainer.html';

import { NativeBridge } from 'Native/NativeBridge';
import { Placement } from 'Models/Placement';
import { AdMobCampaign } from 'Models/Campaigns/AdMobCampaign';
import { Template } from 'Utilities/Template';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { AFMABridge } from 'Views/AFMABridge';
import { AdMobSignalFactory } from 'AdMob/AdMobSignalFactory';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { MRAIDBridge } from 'Views/MRAIDBridge';
import { SdkStats } from 'Utilities/SdkStats';

export interface IAdMobEventHandler {
    onClose(): void;
    onOpenURL(url: string): void;
    onAttribution(url: string): Promise<void>;
    onGrantReward(): void;
    onShow(): void;
    onVideoStart(): void;
    onSetOrientationProperties(allowOrientation: boolean, forceOrientation: ForceOrientation): void;
}

const AFMAClickStringMacro = '{{AFMA_CLICK_SIGNALS_PLACEHOLDER}}';
const AFMADelayMacro = '{{AFMA_RDVT_PLACEHOLDER}}';

export class AdMobView extends View<IAdMobEventHandler> {
    private _placement: Placement;
    private _campaign: AdMobCampaign;
    private _iframe: HTMLIFrameElement;
    private _adMobSignalFactory: AdMobSignalFactory;

    private _afmaBridge: AFMABridge;
    private _mraidBridge: MRAIDBridge;

    constructor(nativeBridge: NativeBridge, adMobSignalFactory: AdMobSignalFactory, container: AdUnitContainer, placement: Placement, campaign: AdMobCampaign, language: string, gameId: string, abGroup: number) {
        super(nativeBridge, 'admob');

        this._placement = placement;
        this._campaign = campaign;
        this._template = new Template(AdMobContainer);
        this._adMobSignalFactory = adMobSignalFactory;

        this._afmaBridge = new AFMABridge(nativeBridge, {
            onAFMAClose: () => this.onClose(),
            onAFMAOpenURL: (url: string) => this.onOpenURL(url),
            onAFMADisableBackButton: () => { /**/ },
            onAFMAClick: (url) => this.onAttribution(url),
            onAFMAFetchAppStoreOverlay: () => { /**/ },
            onAFMAForceOrientation: () => { /**/ },
            onAFMAGrantReward: () => this.onGrantReward(),
            onAFMAOpenInAppStore: () => { /**/ },
            onAFMAOpenStoreOverlay: () => { /**/ },
            onAFMARewardedVideoStart: () => this.onVideoStart()
        });
        this._mraidBridge = new MRAIDBridge(nativeBridge, {
            onSetOrientationProperties: (allowOrientation: boolean, forceOrientation: ForceOrientation) => this.onSetOrientationProperties(allowOrientation, forceOrientation)
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
        this._mraidBridge.connect(this._iframe);
        this._handlers.forEach((h) => h.onShow());
    }

    public hide() {
        this._mraidBridge.disconnect();
        this._afmaBridge.disconnect();
        super.hide();
    }

    public onBackPressed() {
        this._afmaBridge.onBackPressed();
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
        this.injectScript(e, MRAIDContainer);
        this.injectScript(e, AFMAContainer);
        return Promise.resolve();
    }

    private injectScript(e: HTMLElement, script: string) {
        e.innerHTML = script + e.innerHTML;
    }

    private onClose() {
        this._handlers.forEach((h) => h.onClose());
    }

    private onAttribution(url: string) {
        this._handlers.forEach((h) => h.onAttribution(url));
    }

    private onOpenURL(url: string) {
        this._handlers.forEach((h) => h.onOpenURL(url));
    }

    private onGrantReward() {
        this._handlers.forEach((h) => h.onGrantReward());
    }

    private onVideoStart() {
        this._handlers.forEach((h) => h.onVideoStart());
    }

    private onSetOrientationProperties(allowOrientation: boolean, forceOrientation: ForceOrientation) {
        this._handlers.forEach((h) => h.onSetOrientationProperties(allowOrientation, forceOrientation));
    }
}
