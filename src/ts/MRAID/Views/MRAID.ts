import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { Placement } from 'Ads/Models/Placement';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';

import { ABGroup, FPSCollectionTest } from 'Core/Models/ABGroup';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable0 } from 'Core/Utilities/Observable';
import { Template } from 'Core/Utilities/Template';
import MRAIDTemplate from 'html/MRAID.html';
import MRAIDPerfContainer from 'html/mraid/container-perf.html';
import MRAIDContainer from 'html/mraid/container.html';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { IMRAIDViewHandler, MRAIDView } from 'MRAID/Views/MRAIDView';

export class MRAID extends MRAIDView<IMRAIDViewHandler> {

    private readonly onLoaded = new Observable0();
    private _domContentLoaded = false;
    private _creativeId: string | undefined;

    private _iframe: HTMLIFrameElement;
    private _messageListener: any;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: MRAIDCampaign, privacy: AbstractPrivacy, showGDPRBanner: boolean, abGroup: ABGroup, gameSessionId?: number) {
        super(nativeBridge, 'mraid', placement, campaign, privacy, showGDPRBanner, abGroup, gameSessionId);

        this._placement = placement;
        this._campaign = campaign;
        this._creativeId = campaign.getCreativeId();

        this._template = new Template(MRAIDTemplate);
    }

    public render(): void {
        super.render();

        this._messageListener = (event: MessageEvent) => this.onMessage(event);
        window.addEventListener('message', this._messageListener, false);

        this.loadIframe();
    }

    public show(): void {
        super.show();
        this.choosePrivacyShown();
        this._showTimestamp = Date.now();
        this.sendMraidAnalyticsEvent('playable_show');

        this.prepareProgressCircle();

        if(this._domContentLoaded) {
            this.setViewableState(true);
        } else {
            const observer = this.onLoaded.subscribe(() => {
                this.setViewableState(true);
                this.onLoaded.unsubscribe(observer);
            });
        }
    }

    public hide() {
        super.hide();
        if(this._messageListener) {
            window.removeEventListener('message', this._messageListener, false);
            this._messageListener = undefined;
        }
    }

    public setViewableState(viewable: boolean) {
        if(this._domContentLoaded) {
            this._iframe.contentWindow!.postMessage({
                type: 'viewable',
                value: viewable
            }, '*');
        }
        this.setAnalyticsBackgroundTime(viewable);
    }

    private sendMraidAnalyticsEvent(eventName: string, eventData?: any) {
        const timeFromShow = (Date.now() - this._showTimestamp - this._backgroundTime) / 1000;
        const backgroundTime = this._backgroundTime / 1000;
        const timeFromPlayableStart = this._playableStartTimestamp ? (Date.now() - this._playableStartTimestamp - this._backgroundTime) / 1000 : 0;

        if (this.isKPIDataValid({timeFromShow, backgroundTime, timeFromPlayableStart}, 'mraid_' + eventName)) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, eventName, eventData));
        }
    }

    private loadIframe(): void {
        const iframe: any = this._iframe = <HTMLIFrameElement>this._container.querySelector('#mraid-iframe');

        this.createMRAID(
            FPSCollectionTest.isValid(this._abGroup) ? MRAIDPerfContainer : MRAIDContainer
        ).then(mraid => {
            this._nativeBridge.Sdk.logDebug('setting iframe srcdoc (' + mraid.length + ')');
            SdkStats.setFrameSetStartTimestamp(this._placement.getId());
            this._nativeBridge.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' set iframe.src started ' + SdkStats.getFrameSetStartTimestamp(this._placement.getId()));
            iframe.srcdoc = mraid;

            if (CustomFeatures.isSonicPlayable(this._creativeId)) {
                iframe.sandbox = 'allow-scripts allow-same-origin';
            }
        }).catch(e => {
            this._nativeBridge.Sdk.logError('failed to create mraid: ' + e);

            SessionDiagnostics.trigger('create_mraid_error', {
                message: e.message
            }, this._campaign.getSession());
        });
    }

    protected onCloseEvent(event: Event): void {
        event.preventDefault();
        event.stopPropagation();

        if(this._canSkip && !this._canClose) {
            this._handlers.forEach(handler => handler.onMraidSkip());
            this.sendMraidAnalyticsEvent('playable_skip');
        } else if(this._canClose) {
            this._handlers.forEach(handler => handler.onMraidClose());
            this.sendMraidAnalyticsEvent('playable_close');
        }
    }

    private onLoadedEvent(): void {
        this._domContentLoaded = true;
        this.onLoaded.trigger();

        const frameLoadDuration = (Date.now() - SdkStats.getFrameSetStartTimestamp(this._placement.getId())) / 1000;
        this._nativeBridge.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' iframe load duration ' + frameLoadDuration + ' s');

        if (this.isKPIDataValid({frameLoadDuration}, 'mraid_playable_loading_time')) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(frameLoadDuration, 0, 0, 'playable_loading_time', {}));
        }

        this._playableStartTimestamp = Date.now();
        this.sendMraidAnalyticsEvent('playable_start');
    }

    private onMessageOpen(url: string) {
        if (!this._callButtonEnabled) {
            return;
        }
        this._handlers.forEach(handler => handler.onMraidClick(url));
    }

    private onMessage(event: MessageEvent) {
        switch(event.data.type) {
            case 'loaded':
                this.onLoadedEvent();
                break;
             case 'open':
                this.onMessageOpen(event.data.url);
                break;
             case 'sendStats':
                this.updateStats({
                    totalTime: event.data.totalTime,
                    playTime: event.data.playTime,
                    frameCount: event.data.frameCount
                });
                break;
             case 'close':
                this._handlers.forEach(handler => handler.onMraidClose());
                break;
             case 'orientation':
                let forceOrientation = Orientation.NONE;
                switch(event.data.properties.forceOrientation) {
                    case 'portrait':
                        forceOrientation = Orientation.PORTRAIT;
                        break;
                     case 'landscape':
                        forceOrientation = Orientation.LANDSCAPE;
                        break;
                     default:
                }
                this._handlers.forEach(handler => handler.onMraidOrientationProperties({
                    allowOrientationChange: event.data.properties.allowOrientationChange,
                    forceOrientation: forceOrientation
                }));
                break;
            case 'analyticsEvent':
                this.sendMraidAnalyticsEvent(event.data.event, event.data.eventData);
                break;
             case 'customMraidState':
                if(event.data.state === 'completed') {
                    if(!this._placement.allowSkip() && this._closeRemaining > 5) {
                        this._closeRemaining = 5;
                    }
                }
                break;
             default:
        }
    }
}
