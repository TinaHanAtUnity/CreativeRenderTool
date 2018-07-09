import VPAIDContainerTemplate from 'html/vpaid/container.html';
import VPAIDCss from 'css/vpaid-container.css';
import VPAIDTemplate from 'html/vpaid/VPAID.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { Timer } from 'Utilities/Timer';
import { Placement } from 'Models/Placement';
import { IObserver1 } from 'Utilities/IObserver';
import { Platform } from 'Constants/Platform';

interface InitAdOptions {
    width: number;
    height: number;
    viewMode: string;
    bitrate: number;
    creativeData?: object;
    envVars?: object;
}

export interface IVPAIDHandler {
    onVPAIDCompanionClick(): void;
    onVPAIDCompanionView(): void;
    onVPAIDEvent(eventType: string, args: any[]): void;
    onVPAIDStuck(): void;
    onVPAIDSkip(): void;
    onVPAIDProgress(duration: number, remainingTime: number): void;
}

interface IVPAIDAdParameters {
    skipEnabled: boolean;
    skipDuration: number;
}

interface IVPAIDTemplateData {
    adParameters: string;
}

export class VPAID extends View<IVPAIDHandler> {
    private static stuckDelay = 5 * 1000;

    private vpaidSrcTag = '{{VPAID_SRC_URL}}';
    private _campaign: VPAIDCampaign;
    private _placement: Placement;

    private _stuckTimer: Timer;
    private _isPaused = false;
    private _isLoaded = false;
    private _webplayerEventObserver: IObserver1<string>;
    private _isCoppaCompliant: boolean;

    constructor(nativeBridge: NativeBridge, campaign: VPAIDCampaign, placement: Placement) {
        super(nativeBridge, 'vpaid');

        this._template = new Template(VPAIDTemplate);
        this._campaign = campaign;
        this._placement = placement;
        this._stuckTimer = new Timer(() => this._handlers.forEach(handler => handler.onVPAIDStuck()), VPAID.stuckDelay);
        this._bindings = [];
    }

    public loadWebPlayer(): Promise<void> {

        const adParameters = <IVPAIDAdParameters>{
            skipEnabled: this._placement.allowSkip(),
            skipDuration: this._placement.allowSkipInSeconds()
        };

        const templateData = <IVPAIDTemplateData>{
            adParameters: JSON.stringify(adParameters),
            vpaidSrcUrl: this._campaign.getVPAID().getScriptUrl(),
            isCoppaCompliant: this._isCoppaCompliant
        };

        let iframeSrcDoc = VPAIDContainerTemplate.replace('{COMPILED_CSS}', VPAIDCss);
        iframeSrcDoc = new Template(iframeSrcDoc).render(templateData);

        this._webplayerEventObserver = this._nativeBridge.WebPlayer.onWebPlayerEvent.subscribe((args: string) => this.onWebPlayerEvent(JSON.parse(args)));
        iframeSrcDoc = this._nativeBridge.getPlatform() === Platform.ANDROID ? encodeURIComponent(iframeSrcDoc) : iframeSrcDoc;
        this._isLoaded = true;
        return this._nativeBridge.WebPlayer.setData(iframeSrcDoc, 'text/html', 'UTF-8');
    }

    public isLoaded(): boolean {
        return this._isLoaded;
    }

    public hide() {
        this.sendEvent('destroy');
        this._stuckTimer.stop();
        this._nativeBridge.WebPlayer.onWebPlayerEvent.unsubscribe(this._webplayerEventObserver);
    }

    public showAd() {
        this.sendEvent('show');
        // this._stuckTimer.start();
    }

    public pauseAd() {
        this._isPaused = true;
        this.sendEvent('pause');
        // this._stuckTimer.stop();
    }

    public resumeAd() {
        this._isPaused = false;
        this.sendEvent('resume');
        // this._stuckTimer.start();
    }

    public mute() {
        this.sendEvent('mute');
    }

    public unmute() {
        this.sendEvent('unmute');
    }

    private onVPAIDContainerReady() {
        this.getInitAdOptions().then(initOptions => {
            this.sendEvent('init', [initOptions]);
        });
    }

    private getInitAdOptions(): Promise<InitAdOptions> {
        return Promise.all([this._nativeBridge.DeviceInfo.getScreenWidth(),
            this._nativeBridge.DeviceInfo.getScreenHeight()]).then(([width, height]) => {
                return <InitAdOptions>{
                    width: width,
                    height: height,
                    bitrate: 500,
                    viewMode: 'normal',
                    creativeData: {
                        AdParameters: this._campaign.getVPAID().getCreativeParameters()
                    }
                };
            });
    }

    private sendEvent(event: string, parameters?: any[]): Promise<void> {
        const webPlayerParams: any[] = [event];
        if (parameters) {
            webPlayerParams.push(parameters);
        }
        return this._nativeBridge.WebPlayer.sendEvent(webPlayerParams);
    }

    private onWebPlayerEvent(args: any[]) {
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
                this._nativeBridge.Sdk.logWarning(`VPAID Unknown message type ${eventType}`);
                break;
        }
    }
}
