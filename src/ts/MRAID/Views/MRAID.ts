import { Placement } from 'Ads/Models/Placement';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';

import { ABGroup, FPSCollectionTest } from 'Core/Models/ABGroup';

import { Observable0 } from 'Core/Utilities/Observable';
import { Template } from 'Core/Utilities/Template';
import MRAIDTemplate from 'html/MRAID.html';
import MRAIDPerfContainer from 'html/mraid/container-perf.html';
import MRAIDContainer from 'html/mraid/container.html';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { IMRAIDViewHandler, MRAIDView } from 'MRAID/Views/MRAIDView';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { MRAIDIFrameEventAdapter } from 'MRAID/EventBridge/MRAIDIFrameEventAdapter';

export class MRAID extends MRAIDView<IMRAIDViewHandler> {

    private readonly onLoaded = new Observable0();
    private _domContentLoaded = false;
    private _creativeId: string | undefined;

    private _iframe: HTMLIFrameElement;

    constructor(platform: Platform, core: ICoreApi, deviceInfo: DeviceInfo, placement: Placement, campaign: MRAIDCampaign, privacy: AbstractPrivacy, showGDPRBanner: boolean, abGroup: ABGroup, gameSessionId?: number) {
        super(platform, core, deviceInfo, 'mraid', placement, campaign, privacy, showGDPRBanner, abGroup, gameSessionId);

        this._deviceInfo = deviceInfo;
        this._placement = placement;
        this._campaign = campaign;
        this._creativeId = campaign.getCreativeId();

        this._template = new Template(MRAIDTemplate);
    }

    public render(): void {
        super.render();
        this.loadIframe();
    }

    public show(): void {
        super.show();
        this._showTimestamp = Date.now();
        this.sendMraidAnalyticsEvent('playable_show');

        this.prepareProgressCircle();

        if(this._domContentLoaded) {
            this.setViewableState(true);
            this.sendCustomImpression();
        } else {
            const observer = this.onLoaded.subscribe(() => {
                this.setViewableState(true);
                this.sendCustomImpression();

                this.onLoaded.unsubscribe(observer);
            });
        }
    }

    public hide() {
        super.hide();
        this._mraidAdapterContainer.disconnect();
    }

    public setViewableState(viewable: boolean) {
        if(this._domContentLoaded) {
            this._mraidAdapterContainer.sendViewableEvent(viewable);
        }
        this.setAnalyticsBackgroundTime(viewable);
    }

    protected sendMraidAnalyticsEvent(eventName: string, eventData?: any) {
        const timeFromShow = (Date.now() - this._showTimestamp - this._backgroundTime) / 1000;
        const backgroundTime = this._backgroundTime / 1000;
        const timeFromPlayableStart = this._playableStartTimestamp ? (Date.now() - this._playableStartTimestamp - this._backgroundTime) / 1000 : 0;

        if (this.isKPIDataValid({timeFromShow, backgroundTime, timeFromPlayableStart}, 'mraid_' + eventName)) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, eventName, eventData));
        }
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

    private loadIframe(): void {
        const iframe: any = this._iframe = <HTMLIFrameElement>this._container.querySelector('#mraid-iframe');
        this._mraidAdapterContainer.connect(new MRAIDIFrameEventAdapter(this._core, this._mraidAdapterContainer, iframe));

        this.createMRAID(
            FPSCollectionTest.isValid(this._abGroup) ? MRAIDPerfContainer : MRAIDContainer
        ).then(mraid => {
            this._core.Sdk.logDebug('setting iframe srcdoc (' + mraid.length + ')');
            SdkStats.setFrameSetStartTimestamp(this._placement.getId());
            this._core.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' set iframe.src started ' + SdkStats.getFrameSetStartTimestamp(this._placement.getId()));
            iframe.srcdoc = mraid;

            if (CustomFeatures.isSonicPlayable(this._creativeId)) {
                iframe.sandbox = 'allow-scripts allow-same-origin';
            }
        }).catch(e => {
            this._core.Sdk.logError('failed to create mraid: ' + e.message);

            SessionDiagnostics.trigger('create_mraid_error', {
                message: e.message
            }, this._campaign.getSession());
        });
    }

    protected onLoadedEvent(): void {
        this._domContentLoaded = true;
        this.onLoaded.trigger();

        const frameLoadDuration = (Date.now() - SdkStats.getFrameSetStartTimestamp(this._placement.getId())) / 1000;
        this._core.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' iframe load duration ' + frameLoadDuration + ' s');

        if (this.isKPIDataValid({frameLoadDuration}, 'mraid_playable_loading_time')) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(frameLoadDuration, 0, 0, 'playable_loading_time', {}));
        }

        this._playableStartTimestamp = Date.now();
        this.sendMraidAnalyticsEvent('playable_start');
    }

    protected onOpen(url: string) {
        if (!this._callButtonEnabled) {
            return;
        }
        this._handlers.forEach(handler => handler.onMraidClick(url));
    }

    private sendCustomImpression() {
        if (CustomFeatures.isLoopMeSeat(this._campaign.getSeatId())) {
            this._handlers.forEach(handler => handler.onCustomImressionEvent());
        }
    }
}
