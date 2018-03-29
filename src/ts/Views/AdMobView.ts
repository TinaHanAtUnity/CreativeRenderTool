import { View } from 'Views/View';
import AdMobContainer from 'html/admob/AdMobContainer.html';
import AFMAContainer from 'html/admob/AFMAContainer.html';
import MRAIDContainer from 'html/admob/MRAIDContainer.html';

import { NativeBridge } from 'Native/NativeBridge';
import { Placement } from 'Models/Placement';
import { AdMobCampaign } from 'Models/Campaigns/AdMobCampaign';
import { Template } from 'Utilities/Template';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { AFMABridge, IOpenableIntentsResponse, IOpenableIntentsRequest, ITouchInfo, IClickSignalResponse } from 'Views/AFMABridge';
import { AdMobSignalFactory } from 'AdMob/AdMobSignalFactory';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { MRAIDBridge } from 'Views/MRAIDBridge';
import { SdkStats } from 'Utilities/SdkStats';

export interface IAdMobEventHandler {
    onClose(): void;
    onOpenURL(url: string): void;
    onAttribution(url: string, touchInfo: ITouchInfo): Promise<void>;
    onGrantReward(): void;
    onShow(): void;
    onVideoStart(): void;
    onSetOrientationProperties(allowOrientation: boolean, forceOrientation: ForceOrientation): void;
    onOpenableIntentsRequest(request: IOpenableIntentsRequest): void;
    onTrackingEvent(event: string, data?: any): void;
    onClickSignalRequest(touchInfo: ITouchInfo): void;
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
            onAFMAClick: (url, touchInfo) => this.onAttribution(url, touchInfo),
            onAFMAFetchAppStoreOverlay: () => { /**/ },
            onAFMAForceOrientation: () => { /**/ },
            onAFMAGrantReward: () => this.onGrantReward(),
            onAFMAOpenInAppStore: () => { /**/ },
            onAFMAOpenStoreOverlay: () => { /**/ },
            onAFMARewardedVideoStart: () => this.onVideoStart(),
            onAFMAResolveOpenableIntents: (request) => this.onResolveOpenableIntents(request),
            onAFMATrackingEvent: (event, data?) => this.onTrackingEvent(event, data),
            onAFMAClickSignalRequest: (touchInfo) => this.onClickSignalRequest(touchInfo)
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

    public sendOpenableIntentsResponse(response: IOpenableIntentsResponse) {
        this._afmaBridge.sendOpenableIntentsResult(response);
    }

    public sendClickSignalResponse(response: IClickSignalResponse) {
        this._afmaBridge.sendClickSignalResponse(response);
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
        const dom = new DOMParser().parseFromString(markup, 'text/html');
        if (!dom) {
            return Promise.reject(new Error('Not a valid HTML document => ' + markup));
        }
        this.removeScriptTags(dom);
        this.injectVideoURL(dom);
        return this.injectScripts(dom).then(() => {
            return dom.documentElement.outerHTML;
        });
    }

    private injectVideoURL(dom: Document) {
        const video = this._campaign.getVideo();
        if (video) {
            const scriptEl = dom.querySelector('body script');
            const mediaFileURL = this.encodeURLForHTML(video.getMediaFileURL());
            let cachedFileURL = video.getVideo().getCachedUrl();
            if (cachedFileURL) {
                cachedFileURL = this.encodeURLForHTML(cachedFileURL);
                if (scriptEl && scriptEl.textContent) {
                    const replacedSrc = scriptEl.textContent.replace(mediaFileURL, cachedFileURL);
                    scriptEl.textContent = replacedSrc;
                }
            }
        }
    }

    private encodeURLForHTML(str: string): string {
        return str.replace(/[&=]/g, (c) => '\\x' + c.charCodeAt(0).toString(16));
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

    private onAttribution(url: string, touchInfo: ITouchInfo) {
        this._handlers.forEach((h) => h.onAttribution(url, touchInfo));
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

    private onResolveOpenableIntents(request: IOpenableIntentsRequest) {
        this._handlers.forEach((h) => h.onOpenableIntentsRequest(request));
    }

    private onClickSignalRequest(touchInfo: ITouchInfo) {
        this._handlers.forEach((h) => h.onClickSignalRequest(touchInfo));
    }

    private onTrackingEvent(event: string, data?: any) {
        this._handlers.forEach((h) => h.onTrackingEvent(event, data));
    }
}
