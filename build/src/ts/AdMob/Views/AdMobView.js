import { AFMABridge } from 'AdMob/Views/AFMABridge';
import { SDKMetrics, AdmobMetric } from 'Ads/Utilities/SDKMetrics';
import { Template } from 'Core/Utilities/Template';
import { View } from 'Core/Views/View';
import AdMobContainer from 'html/admob/AdMobContainer.html';
import AFMAContainer from 'html/admob/AFMAContainer.html';
import MRAIDContainer from 'html/admob/MRAIDContainer.html';
import { MRAIDBridge } from 'MRAID/EventBridge/MRAIDBridge';
import OMIDSessionClient from 'html/omid/admob-session-interface.html';
import { PARTNER_NAME, OM_JS_VERSION } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { ObstructionReasons } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { Localization } from 'Core/Utilities/Localization';
import { MacroUtil } from 'Ads/Utilities/MacroUtil';
const AFMAClickStringMacro = '{{AFMA_CLICK_SIGNALS_PLACEHOLDER}}';
const AFMADelayMacro = '{{AFMA_RDVT_PLACEHOLDER}}';
const omidMacroMap = {
    '{{ OMID_IMPLEMENTOR }}': PARTNER_NAME,
    '{{ OMID_API_VERSION }}': OM_JS_VERSION
};
export class AdMobView extends View {
    constructor(platform, core, adMobSignalFactory, container, campaign, deviceInfo, gameId, privacy, showGDPRBanner, om) {
        super(platform, 'admob');
        this._showGDPRBanner = false;
        this._gdprPopupClicked = false;
        this._volume = 1;
        this._campaign = campaign;
        this._template = new Template(AdMobContainer, new Localization(deviceInfo.getLanguage(), 'privacy'));
        this._adMobSignalFactory = adMobSignalFactory;
        this._privacy = privacy;
        this._showGDPRBanner = showGDPRBanner;
        this._admobOMController = om;
        this._deviceInfo = deviceInfo;
        this._afmaBridge = new AFMABridge(core, {
            onAFMAClose: () => this.onClose(),
            onAFMAOpenURL: (url) => this.onOpenURL(url),
            onAFMADisableBackButton: () => { },
            onAFMAClick: (url, touchInfo) => this.onAttribution(url, touchInfo),
            onAFMAFetchAppStoreOverlay: () => { },
            onAFMAForceOrientation: () => { },
            onAFMAGrantReward: () => this.onGrantReward(),
            onAFMAOpenInAppStore: () => { },
            onAFMAOpenStoreOverlay: () => { },
            OnAFMAVideoStart: () => this.onVideoStart(),
            onAFMAResolveOpenableIntents: (request) => this.onResolveOpenableIntents(request),
            onAFMATrackingEvent: (event, data) => this.onTrackingEvent(event, data),
            onAFMAClickSignalRequest: (touchInfo) => this.onClickSignalRequest(touchInfo),
            onAFMAUserSeeked: () => this.onUserSeeked(),
            onVolumeChange: (volume) => { this._volume = volume; }
        });
        this._mraidBridge = new MRAIDBridge(core, {
            onSetOrientationProperties: (allowOrientation, forceOrientation) => this.onSetOrientationProperties(allowOrientation, forceOrientation)
        });
        this._bindings = [
            {
                event: 'click',
                listener: (event) => this.onGDPRPopupEvent(event),
                selector: '.gdpr-link'
            },
            {
                event: 'click',
                listener: (event) => this.onPrivacyEvent(event),
                selector: '.privacy-button'
            }
        ];
        this._privacy.render();
        this._privacy.hide();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);
    }
    render() {
        super.render();
        this.setupIFrame();
        this._gdprBanner = this._container.querySelector('.gdpr-pop-up');
        this._privacyButton = this._container.querySelector('.privacy-button');
    }
    show() {
        super.show();
        this._afmaBridge.connect(this._iframe);
        this._mraidBridge.connect(this._iframe);
        this._handlers.forEach((h) => h.onShow());
        this._deviceInfo.checkIsMuted();
        this.choosePrivacyShown();
    }
    getVideoPlayerVolume() {
        return this._volume;
    }
    hide() {
        this._mraidBridge.disconnect();
        this._afmaBridge.disconnect();
        super.hide();
        if (this._privacy) {
            this._privacy.removeEventHandler(this);
            this._privacy.hide();
            const privacyContainer = this._privacy.container();
            if (privacyContainer && privacyContainer.parentElement) {
                privacyContainer.parentElement.removeChild(privacyContainer);
            }
        }
        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._handlers.forEach(h => h.onGDPRPopupSkipped());
        }
    }
    onPrivacyClose() {
        if (this._privacy) {
            this._privacy.hide();
        }
        if (this._admobOMController) {
            this.sendUnObstructedOMGeometryChange(this._admobOMController);
        }
    }
    onBackPressed() {
        this._afmaBridge.onBackPressed();
    }
    sendOpenableIntentsResponse(response) {
        this._afmaBridge.sendOpenableIntentsResult(response);
    }
    sendClickSignalResponse(response) {
        this._afmaBridge.sendClickSignalResponse(response);
    }
    sendMuteChange(isMuted) {
        this._afmaBridge.sendMuteChange(isMuted);
    }
    getOpenMeasurementController() {
        return this._admobOMController;
    }
    choosePrivacyShown() {
        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._gdprBanner.style.visibility = 'visible';
            this._privacyButton.style.pointerEvents = '1';
            this._privacyButton.style.visibility = 'hidden';
        }
        else {
            this._privacyButton.style.visibility = 'visible';
            this._gdprBanner.style.pointerEvents = '1';
            this._gdprBanner.style.visibility = 'hidden';
        }
    }
    setupIFrame() {
        const iframe = this._iframe = this._container.querySelector('#admob-iframe');
        this._iframe = iframe;
        this.getIFrameSrcDoc().then((markup) => {
            iframe.srcdoc = markup;
            if (this._admobOMController) {
                iframe.srcdoc += MacroUtil.replaceMacro(OMIDSessionClient, omidMacroMap);
                this._admobOMController.getAdmobBridge().setAdmobIframe(iframe);
            }
        });
    }
    getIFrameSrcDoc() {
        const markup = this._campaign.getDynamicMarkup();
        const dom = new DOMParser().parseFromString(markup, 'text/html');
        if (!dom) {
            return Promise.reject(new Error('Not a valid HTML document => ' + markup));
        }
        this.removeScriptTags(dom);
        return this.injectScripts(dom).then(() => {
            return dom.documentElement.outerHTML;
        });
    }
    removeScriptTags(dom) {
        this.removeScriptTag(dom, 'mraid.js');
        this.removeScriptTag(dom, 'afma_unity_stub.js');
        return dom.documentElement.outerHTML;
    }
    removeScriptTag(doc, scriptName) {
        const scriptElement = doc.querySelector(`script[src^="${scriptName}"]`);
        if (scriptElement && scriptElement.parentNode) {
            scriptElement.parentNode.removeChild(scriptElement);
        }
    }
    injectScripts(dom) {
        const e = dom.head || document.body;
        this.injectScript(e, MRAIDContainer);
        this.injectScript(e, AFMAContainer);
        return Promise.resolve();
    }
    injectScript(e, script) {
        e.innerHTML = script + e.innerHTML;
    }
    onClose() {
        if (this._admobOMController) {
            this._admobOMController.sessionFinish();
            setTimeout(() => { if (this._admobOMController) {
                this._admobOMController.removeFromViewHieararchy();
            } }, 1000);
        }
        // Added a timeout for admob session interface to receive session finish before removing the dom element
        setTimeout(() => this._handlers.forEach((h) => h.onClose()), 1);
    }
    onAttribution(url, touchInfo) {
        this._handlers.forEach((h) => h.onAttribution(url, touchInfo));
    }
    onOpenURL(url) {
        this._handlers.forEach((h) => h.onOpenURL(url));
    }
    onGrantReward() {
        this._handlers.forEach((h) => h.onGrantReward());
    }
    onVideoStart() {
        this._handlers.forEach((h) => h.onVideoStart());
    }
    onSetOrientationProperties(allowOrientation, forceOrientation) {
        this._handlers.forEach((h) => h.onSetOrientationProperties(allowOrientation, forceOrientation));
    }
    onResolveOpenableIntents(request) {
        this._handlers.forEach((h) => h.onOpenableIntentsRequest(request));
    }
    onClickSignalRequest(touchInfo) {
        this._handlers.forEach((h) => h.onClickSignalRequest(touchInfo));
    }
    onTrackingEvent(event, data) {
        this._handlers.forEach((h) => h.onTrackingEvent(event, data));
    }
    onUserSeeked() {
        SDKMetrics.reportMetricEvent(AdmobMetric.AdmobUserVideoSeeked);
    }
    onGDPRPopupEvent(event) {
        event.preventDefault();
        if (!this._gdprPopupClicked) {
            this._gdprPopupClicked = true;
            this.choosePrivacyShown();
        }
        this._privacy.show();
        if (this._admobOMController) {
            this.sendObstructedOMGeometryChange(this._admobOMController);
        }
    }
    onPrivacyEvent(event) {
        event.preventDefault();
        this._privacy.show();
        if (this._admobOMController) {
            this.sendObstructedOMGeometryChange(this._admobOMController);
        }
    }
    sendObstructedOMGeometryChange(om) {
        const popup = document.querySelector('.view-container');
        const gdprRect = popup.getBoundingClientRect();
        const obstructionRect = OpenMeasurementUtilities.createRectangle(gdprRect.left, gdprRect.top, gdprRect.width, gdprRect.height);
        const adViewBuilder = om.getOMAdViewBuilder();
        const adView = adViewBuilder.buildAdmobAdView([ObstructionReasons.OBSTRUCTED], om, obstructionRect);
        const viewPort = adViewBuilder.getViewPort();
        om.geometryChange(viewPort, adView);
    }
    sendUnObstructedOMGeometryChange(om) {
        const adViewBuilder = om.getOMAdViewBuilder();
        const obstructionRect = { x: 0, y: 0, width: 0, height: 0 };
        const adView = adViewBuilder.buildAdmobAdView([], om, obstructionRect);
        const viewPort = adViewBuilder.getViewPort();
        om.geometryChange(viewPort, adView);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRNb2JWaWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0FkTW9iL1ZpZXdzL0FkTW9iVmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQ0gsVUFBVSxFQUtiLE1BQU0sd0JBQXdCLENBQUM7QUFHaEMsT0FBTyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUtuRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sY0FBYyxNQUFNLGdDQUFnQyxDQUFDO0FBQzVELE9BQU8sYUFBYSxNQUFNLCtCQUErQixDQUFDO0FBQzFELE9BQU8sY0FBYyxNQUFNLGdDQUFnQyxDQUFDO0FBQzVELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUU1RCxPQUFPLGlCQUFpQixNQUFNLHdDQUF3QyxDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFHeEYsT0FBTyxFQUFFLGtCQUFrQixFQUFjLE1BQU0sb0RBQW9ELENBQUM7QUFDcEcsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDOUYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzNELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQWVwRCxNQUFNLG9CQUFvQixHQUFHLG9DQUFvQyxDQUFDO0FBQ2xFLE1BQU0sY0FBYyxHQUFHLDJCQUEyQixDQUFDO0FBRW5ELE1BQU0sWUFBWSxHQUFHO0lBQ2pCLHdCQUF3QixFQUFFLFlBQVk7SUFDdEMsd0JBQXdCLEVBQUUsYUFBYTtDQUMxQyxDQUFDO0FBRUYsTUFBTSxPQUFPLFNBQVUsU0FBUSxJQUF3QjtJ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