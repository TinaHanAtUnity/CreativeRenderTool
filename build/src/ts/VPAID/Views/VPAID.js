import { Platform } from 'Core/Constants/Platform';
import { Template } from 'Core/Utilities/Template';
import { Timer } from 'Core/Utilities/Timer';
import { View } from 'Core/Views/View';
import VPAIDContainerTemplate from 'html/vpaid/container.html';
import VPAIDTemplate from 'html/vpaid/VPAID.html';
export class VPAID extends View {
    constructor(platform, core, webPlayerContainer, campaign, placement) {
        super(platform, 'vpaid');
        this.vpaidSrcTag = '{{VPAID_SRC_URL}}';
        this._isPaused = false;
        this._isLoaded = false;
        this._template = new Template(VPAIDTemplate);
        this._core = core;
        this._webPlayerContainer = webPlayerContainer;
        this._campaign = campaign;
        this._placement = placement;
        this._stuckTimer = new Timer(() => this._handlers.forEach(handler => handler.onVPAIDStuck()), VPAID.stuckDelay);
        this._bindings = [];
    }
    loadWebPlayer() {
        const adParameters = {
            skipEnabled: this._placement.allowSkip(),
            skipDuration: this._placement.allowSkipInSeconds()
        };
        const templateData = {
            adParameters: JSON.stringify(adParameters),
            vpaidSrcUrl: this._campaign.getVPAID().getScriptUrl(),
            isCoppaCompliant: this._isCoppaCompliant
        };
        let iframeSrcDoc = new Template(VPAIDContainerTemplate).render(templateData);
        this._webplayerEventObserver = this._webPlayerContainer.onWebPlayerEvent.subscribe((args) => this.onWebPlayerEvent(JSON.parse(args)));
        iframeSrcDoc = this._platform === Platform.ANDROID ? encodeURIComponent(iframeSrcDoc) : iframeSrcDoc;
        this._isLoaded = true;
        return this._webPlayerContainer.setData(iframeSrcDoc, 'text/html', 'UTF-8');
    }
    isLoaded() {
        return this._isLoaded;
    }
    hide() {
        this.sendEvent('destroy');
        this._stuckTimer.stop();
        this._webPlayerContainer.onWebPlayerEvent.unsubscribe(this._webplayerEventObserver);
    }
    showAd() {
        this.sendEvent('show');
        // this._stuckTimer.start();
    }
    pauseAd() {
        this._isPaused = true;
        this.sendEvent('pause');
        // this._stuckTimer.stop();
    }
    resumeAd() {
        this._isPaused = false;
        this.sendEvent('resume');
        // this._stuckTimer.start();
    }
    mute() {
        this.sendEvent('mute');
    }
    unmute() {
        this.sendEvent('unmute');
    }
    onVPAIDContainerReady() {
        this.getInitAdOptions().then(initOptions => {
            this.sendEvent('init', [initOptions]);
        });
    }
    getInitAdOptions() {
        return Promise.all([
            this._core.DeviceInfo.getScreenWidth(),
            this._core.DeviceInfo.getScreenHeight()
        ]).then(([width, height]) => {
            return {
                width: width,
                height: height,
                bitrate: 500,
                viewMode: 'normal',
                creativeData: {
                    AdParameters: this.decodeHTMLEntityChars(this._campaign.getVPAID().getCreativeParameters())
                }
            };
        });
    }
    decodeHTMLEntityChars(data) {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = data;
        return textArea.value;
    }
    sendEvent(event, parameters) {
        const webPlayerParams = [event];
        if (parameters) {
            webPlayerParams.push(parameters);
        }
        return this._webPlayerContainer.sendEvent(webPlayerParams);
    }
    onWebPlayerEvent(args) {
        const eventType = args.shift();
        const params = args.shift();
        switch (eventType) {
            case 'progress':
                this._handlers.forEach(handler => handler.onVPAIDProgress(params[0], params[1]));
                if (!this._isPaused) {
                    // this._stuckTimer.reset();
                }
                break;
            case 'VPAID':
                this._handlers.forEach(handler => handler.onVPAIDEvent(params.shift(), params.shift()));
                break;
            case 'ready':
                this.onVPAIDContainerReady();
                break;
            default:
                this._core.Sdk.logWarning(`VPAID Unknown message type ${eventType}`);
        }
    }
}
VPAID.stuckDelay = 5 * 1000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBBSUQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVlBBSUQvVmlld3MvVlBBSUQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBR25ELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDN0MsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sc0JBQXNCLE1BQU0sMkJBQTJCLENBQUM7QUFDL0QsT0FBTyxhQUFhLE1BQU0sdUJBQXVCLENBQUM7QUE4QmxELE1BQU0sT0FBTyxLQUFNLFNBQVEsSUFBbUI7SUFnQjFDLFlBQVksUUFBa0IsRUFBRSxJQUFjLEVBQUUsa0JBQXNDLEVBQUUsUUFBdUIsRUFBRSxTQUFvQjtRQUNqSSxLQUFLLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBWnJCLGdCQUFXLEdBQUcsbUJBQW1CLENBQUM7UUFLbEMsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUNsQixjQUFTLEdBQUcsS0FBSyxDQUFDO1FBUXRCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLGtCQUFrQixDQUFDO1FBQzlDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQzVCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENB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