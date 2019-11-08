import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import {
    AFMABridge,
    IClickSignalResponse,
    IOpenableIntentsRequest,
    IOpenableIntentsResponse,
    ITouchInfo
} from 'AdMob/Views/AFMABridge';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IGDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { ProgrammaticTrackingService, AdmobMetric } from 'Ads/Utilities/ProgrammaticTrackingService';
import { AbstractPrivacy, IPrivacyHandlerView } from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';

import { Template } from 'Core/Utilities/Template';
import { View } from 'Core/Views/View';
import AdMobContainer from 'html/admob/AdMobContainer.html';
import AFMAContainer from 'html/admob/AFMAContainer.html';
import MRAIDContainer from 'html/admob/MRAIDContainer.html';
import { MRAIDBridge } from 'MRAID/EventBridge/MRAIDBridge';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import OMIDSessionClient from 'html/omid/admob-session-interface.html';
import { PARTNER_NAME, OM_JS_VERSION } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { AdmobOpenMeasurementController } from 'Ads/Views/OpenMeasurement/AdmobOpenMeasurementController';
import { ObstructionReasons } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';

export interface IAdMobEventHandler extends IGDPREventHandler {
    onClose(): void;
    onOpenURL(url: string): void;
    onAttribution(url: string, touchInfo: ITouchInfo): Promise<void>;
    onGrantReward(): void;
    onShow(): void;
    onVideoStart(): void;
    onSetOrientationProperties(allowOrientation: boolean, forceOrientation: Orientation): void;
    onOpenableIntentsRequest(request: IOpenableIntentsRequest): void;
    onTrackingEvent(event: TrackingEvent, data?: unknown): void;
    onClickSignalRequest(touchInfo: ITouchInfo): void;
}

const AFMAClickStringMacro = '{{AFMA_CLICK_SIGNALS_PLACEHOLDER}}';
const AFMADelayMacro = '{{AFMA_RDVT_PLACEHOLDER}}';
const OMIDImplementorMacro = '{{ OMID_IMPLEMENTOR }}';
const OMIDApiVersionMacro = '{{ OMID_API_VERSION }}';

export class AdMobView extends View<IAdMobEventHandler> implements IPrivacyHandlerView {

    private _campaign: AdMobCampaign;
    private _iframe: HTMLIFrameElement;
    private _adMobSignalFactory: AdMobSignalFactory;

    private _afmaBridge: AFMABridge;
    private _mraidBridge: MRAIDBridge;

    private _gdprBanner: HTMLElement;
    private _privacyButton: HTMLElement;
    private _privacy: AbstractPrivacy;
    private _showGDPRBanner: boolean = false;
    private _gdprPopupClicked: boolean = false;
    private _programmaticTrackingService: ProgrammaticTrackingService;
    private _admobOMController: AdmobOpenMeasurementController | undefined;
    private _deviceInfo: DeviceInfo;

    constructor(platform: Platform, core: ICoreApi, adMobSignalFactory: AdMobSignalFactory, container: AdUnitContainer, campaign: AdMobCampaign, deviceInfo: DeviceInfo, gameId: string, privacy: AbstractPrivacy, showGDPRBanner: boolean, programmaticTrackingService: ProgrammaticTrackingService, om: AdmobOpenMeasurementController | undefined) {
        super(platform, 'admob');

        this._campaign = campaign;
        this._template = new Template(AdMobContainer);
        this._adMobSignalFactory = adMobSignalFactory;
        this._programmaticTrackingService = programmaticTrackingService;

        this._privacy = privacy;
        this._showGDPRBanner = showGDPRBanner;
        this._admobOMController = om;
        this._deviceInfo = deviceInfo;

        this._afmaBridge = new AFMABridge(core, {
            onAFMAClose: () => this.onClose(),
            onAFMAOpenURL: (url: string) => this.onOpenURL(url),
            onAFMADisableBackButton: () => { /**/ },
            onAFMAClick: (url, touchInfo) => this.onAttribution(url, touchInfo),
            onAFMAFetchAppStoreOverlay: () => { /**/ },
            onAFMAForceOrientation: () => { /**/ },
            onAFMAGrantReward: () => this.onGrantReward(),
            onAFMAOpenInAppStore: () => { /**/ },
            onAFMAOpenStoreOverlay: () => { /**/ },
            OnAFMAVideoStart: () => this.onVideoStart(),
            onAFMAResolveOpenableIntents: (request) => this.onResolveOpenableIntents(request),
            onAFMATrackingEvent: (event, data?) => this.onTrackingEvent(event, data),
            onAFMAClickSignalRequest: (touchInfo) => this.onClickSignalRequest(touchInfo),
            onAFMAUserSeeked: () => this.onUserSeeked()
        });
        this._mraidBridge = new MRAIDBridge(core, {
            onSetOrientationProperties: (allowOrientation: boolean, forceOrientation: Orientation) => this.onSetOrientationProperties(allowOrientation, forceOrientation)
        });

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onGDPRPopupEvent(event),
                selector: '.gdpr-link'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: '.icon-gdpr'
            }
        ];

        this._privacy.render();
        this._privacy.hide();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);
    }

    public render() {
        super.render();
        this.setupIFrame();

        this._gdprBanner = <HTMLElement> this._container.querySelector('.gdpr-pop-up');
        this._privacyButton = <HTMLElement> this._container.querySelector('.privacy-button');
    }

    public show(): void {
        super.show();
        this._afmaBridge.connect(this._iframe);
        this._mraidBridge.connect(this._iframe);
        this._handlers.forEach((h) => h.onShow());
        this._deviceInfo.checkIsMuted();

        this.choosePrivacyShown();
    }

    public hide() {
        this._mraidBridge.disconnect();
        this._afmaBridge.disconnect();
        super.hide();

        if (this._privacy) {
            this._privacy.removeEventHandler(this);
            this._privacy.hide();
            this._privacy.container().parentElement!.removeChild(this._privacy.container());
        }

        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._handlers.forEach(h => h.onGDPRPopupSkipped());
        }
    }

    public onPrivacyClose(): void {
        if (this._privacy) {
            this._privacy.hide();
        }
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

    public sendMuteChange(isMuted: boolean) {
        this._afmaBridge.sendMuteChange(isMuted);
    }

    private choosePrivacyShown(): void {
        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._gdprBanner.style.visibility = 'visible';
            this._privacyButton.style.pointerEvents = '1';
            this._privacyButton.style.visibility = 'hidden';
        } else {
            this._privacyButton.style.visibility = 'visible';
            this._gdprBanner.style.pointerEvents = '1';
            this._gdprBanner.style.visibility = 'hidden';
        }
    }

    private setupIFrame() {
        const iframe = this._iframe = <HTMLIFrameElement> this._container.querySelector('#admob-iframe');
        this._iframe = iframe;
        this.getIFrameSrcDoc().then((markup) => {
            iframe.srcdoc = markup;

            if (this._admobOMController) {
                iframe.srcdoc += OMIDSessionClient.replace(OMIDImplementorMacro, PARTNER_NAME).replace(OMIDApiVersionMacro, OM_JS_VERSION);
                this._admobOMController.getAdmobBridge().setAdmobIframe(iframe);
            }
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
            if (scriptEl && scriptEl.textContent) {
                if (cachedFileURL) {
                    cachedFileURL = this.encodeURLForHTML(cachedFileURL);
                    const replacedSrc = scriptEl.textContent.replace(mediaFileURL, cachedFileURL);
                    scriptEl.textContent = replacedSrc;

                    if (scriptEl.textContent.includes(cachedFileURL)) {
                        // report using cached video
                        this._programmaticTrackingService.reportMetricEvent(AdmobMetric.AdmobUsedCachedVideo);
                    } else {
                        // report using streaming video
                        this._programmaticTrackingService.reportMetricEvent(AdmobMetric.AdmobUsedStreamedVideo);
                    }
                } else {
                    // report using streaming video
                    this._programmaticTrackingService.reportMetricEvent(AdmobMetric.AdmobUsedStreamedVideo);
                }
            }
        } else {
            // report using streaming video
            this._programmaticTrackingService.reportMetricEvent(AdmobMetric.AdmobUsedStreamedVideo);
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
        if (this._admobOMController) {
            this._admobOMController.sessionFinish();
            setTimeout(() => {if (this._admobOMController) { this._admobOMController.removeFromViewHieararchy(); }}, 1000);
        }
        // Added a timeout for admob session interface to receive session finish before removing the dom element
        setTimeout(() => this._handlers.forEach((h) => h.onClose()), 1);
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

    private onSetOrientationProperties(allowOrientation: boolean, forceOrientation: Orientation) {
        this._handlers.forEach((h) => h.onSetOrientationProperties(allowOrientation, forceOrientation));
    }

    private onResolveOpenableIntents(request: IOpenableIntentsRequest) {
        this._handlers.forEach((h) => h.onOpenableIntentsRequest(request));
    }

    private onClickSignalRequest(touchInfo: ITouchInfo) {
        this._handlers.forEach((h) => h.onClickSignalRequest(touchInfo));
    }

    private onTrackingEvent(event: TrackingEvent, data?: unknown) {
        this._handlers.forEach((h) => h.onTrackingEvent(event, data));
    }

    private onUserSeeked() {
        this._programmaticTrackingService.reportMetricEvent(AdmobMetric.AdmobUserVideoSeeked).catch();
    }

    private onGDPRPopupEvent(event: Event) {
        event.preventDefault();

        if (!this._gdprPopupClicked) {
            this._gdprPopupClicked = true;
            this.choosePrivacyShown();
        }
        this._privacy.show();

        if (this._admobOMController) {
            this.sendOMGeometryChange(this._admobOMController);
        }
    }

    private onPrivacyEvent(event: Event) {
        event.preventDefault();
        this._privacy.show();

        if (this._admobOMController) {
            this.sendOMGeometryChange(this._admobOMController);
        }
    }

    private sendOMGeometryChange(om: AdmobOpenMeasurementController) {
        const popup = <HTMLElement>document.querySelector('.pop-up');
        const gdprRect = popup.getBoundingClientRect();
        const obstructionRect = OpenMeasurementUtilities.createRectangle(gdprRect.left, gdprRect.top, gdprRect.width, gdprRect.height);

        const adViewBuilder = om.getOMAdViewBuilder();
        return adViewBuilder.buildAdmobAdView([ObstructionReasons.OBSTRUCTED], om, obstructionRect).then((adview) => {
            const viewPort = adViewBuilder.getViewPort();
            om.geometryChange(viewPort, adview);
        });
    }
}
