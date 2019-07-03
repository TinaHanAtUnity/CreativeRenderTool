import { Placement } from 'Ads/Models/Placement';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { ABGroup } from 'Core/Models/ABGroup';
import { Localization } from 'Core/Utilities/Localization';
import { Template } from 'Core/Utilities/Template';
import MRAIDPerfContainer from 'html/mraid/container-perf.html';
import MRAIDContainer from 'html/mraid/container.html';
import ExtendedMRAIDTemplate from 'html/ExtendedMRAID.html';
import { IMRAIDViewHandler, MRAIDView } from 'MRAID/Views/MRAIDView';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { MRAIDIFrameEventAdapter } from 'MRAID/EventBridge/MRAIDIFrameEventAdapter';

export class ExtendedMRAID extends MRAIDView<IMRAIDViewHandler> {

    private _loadingScreen: HTMLElement;
    private _loadingScreenTimeout?: number;
    private _prepareTimeout?: number;

    private _iframe: HTMLIFrameElement;

    private _localization: Localization;
    private _configuration: unknown;

    protected _campaign: PerformanceMRAIDCampaign;

    constructor(platform: Platform, core: ICoreApi, deviceInfo: DeviceInfo, placement: Placement, campaign: PerformanceMRAIDCampaign, language: string, privacy: AbstractPrivacy, showGDPRBanner: boolean, abGroup: ABGroup, gameSessionId: number) {
        super(platform, core, deviceInfo, 'extended-mraid', placement, campaign, privacy, showGDPRBanner, abGroup, gameSessionId);

        this._deviceInfo = deviceInfo;
        this._placement = placement;
        this._campaign = campaign;
        this._localization = new Localization(language, 'loadingscreen');

        this._template = new Template(ExtendedMRAIDTemplate, this._localization);

        if(campaign) {
            this._templateData = {
                'gameName': campaign.getGameName()
            };
            const gameIcon = campaign.getGameIcon();
            if(gameIcon) {
                this._templateData.gameIcon = gameIcon.getUrl();
            }
            const rating = campaign.getRating();
            if(rating) {
                const adjustedRating: number = rating * 20;
                this._templateData.rating = adjustedRating.toString();
            }
            const ratingCount = campaign.getRatingCount();
            if(ratingCount) {
                this._templateData.ratingCount = this._localization.abbreviate(ratingCount);
            }
        }
    }

    public render(): void {
        super.render();

        this._loadingScreen = <HTMLElement>this._container.querySelector('.loading-screen');
        this.loadIframe();
    }

    public show(): void {
        super.show();
        this._showTimestamp = Date.now();
        this.sendMraidAnalyticsEvent('playable_show');
        this.showLoadingScreen();
    }

    public hide() {
        if(this._loadingScreenTimeout) {
            clearTimeout(this._loadingScreenTimeout);
            this._loadingScreenTimeout = undefined;
        }

        if(this._prepareTimeout) {
            clearTimeout(this._prepareTimeout);
            this._prepareTimeout = undefined;
        }

        super.hide();
        this._mraidAdapterContainer.disconnect();
    }

    public setViewableState(viewable: boolean) {
        if(this._isLoaded && !this._loadingScreenTimeout) {
            this._mraidAdapterContainer.sendViewableEvent(viewable);
        }
        this.setAnalyticsBackgroundTime(viewable);
    }

    private loadIframe(): void {
        const iframe = this._iframe = <HTMLIFrameElement>this._container.querySelector('#mraid-iframe');
        this._mraidAdapterContainer.connect(new MRAIDIFrameEventAdapter(this._core, this._mraidAdapterContainer, iframe));

        const container = this.setUpMraidContainer();
        this.createMRAID(container).then(mraid => {
            iframe.onload = () => this.onIframeLoaded();
            SdkStats.setFrameSetStartTimestamp(this._placement.getId());
            this._core.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' set iframe.src started ' + SdkStats.getFrameSetStartTimestamp(this._placement.getId()));
            iframe.srcdoc = mraid;
        });
    }

    private setUpMraidContainer(): string {
        let container = this._gameSessionId % 1000 === 0 ? MRAIDPerfContainer : MRAIDContainer;
        const playableConfiguration = this._campaign.getPlayableConfiguration();
        if(playableConfiguration) {
            // check configuration based on the ab group
            const groupKey = 'group' + this._abGroup;
            if(playableConfiguration[groupKey]) {
                this._configuration = playableConfiguration[groupKey];
            } else if (playableConfiguration.default) {
                this._configuration = playableConfiguration.default;
            } else {
                this._configuration = {};
            }
            container = container.replace('var playableConfiguration = {};', 'var playableConfiguration = ' + JSON.stringify(this._configuration) + ';');
        }
        return container;
    }

    private onIframeLoaded() {
        this._isLoaded = true;

        if(!this._loadingScreenTimeout) {
            clearTimeout(this._prepareTimeout);
            this._prepareTimeout = undefined;
            this.showMRAIDAd();
        }

        const frameLoadDuration = (Date.now() - SdkStats.getFrameSetStartTimestamp(this._placement.getId())) / 1000;
        this._core.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' iframe load duration ' + frameLoadDuration + ' s');

        if (this.isKPIDataValid({frameLoadDuration}, 'playable_mraid_playable_loading_time')) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(frameLoadDuration, 0, 0, 'playable_loading_time', {}));
        }
    }

    private showLoadingScreen() {
        this._loadingScreen.style.display = 'block';
        this._loadingScreenTimeout = window.setTimeout(() => {
            if(this._isLoaded) {
                this.showMRAIDAd();
            } else {
                // start the prepare timeout and wait for the onload event
                this._prepareTimeout = window.setTimeout(() => {
                    this._canClose = true;
                    this._closeElement.style.opacity = '1';
                    this._closeElement.style.display = 'block';
                    this.updateProgressCircle(this._closeElement, 1);

                    const resourceUrl = this._campaign.getResourceUrl();
                    SessionDiagnostics.trigger('playable_prepare_timeout', {
                        'url': resourceUrl ? resourceUrl.getOriginalUrl() : ''
                    }, this._campaign.getSession());

                    this._prepareTimeout = undefined;
                }, 4500);
            }
            this._loadingScreenTimeout = undefined;
        }, 2500);
    }

    private showMRAIDAd() {
        this.prepareProgressCircle();

        ['webkitTransitionEnd', 'transitionend'].forEach((e) => {
            if(this._loadingScreen.style.display === 'none') {
                return;
            }

            this._loadingScreen.addEventListener(e, () => {
                this._closeElement.style.display = 'block';

                this._playableStartTimestamp = Date.now();
                this.sendMraidAnalyticsEvent('playable_start');

                this._mraidAdapterContainer.sendViewableEvent(true);

                this._loadingScreen.style.display = 'none';
            }, false);
        });

        this._loadingScreen.classList.add('hidden');
    }

    protected onCloseEvent(event: Event): void {
        event.preventDefault();
        event.stopPropagation();

        if (this._canSkip && !this._canClose) {
            this._handlers.forEach(handler => handler.onMraidSkip());
            this.sendMraidAnalyticsEvent('playable_skip');
        } else if (this._canClose) {
            this._handlers.forEach(handler => handler.onMraidClose());
            this.sendMraidAnalyticsEvent('playable_close');
        }
    }

    protected sendMraidAnalyticsEvent(eventName: string, eventData?: unknown) {
        const timeFromShow = (Date.now() - this._showTimestamp - this._backgroundTime) / 1000;
        const backgroundTime = this._backgroundTime / 1000;
        const timeFromPlayableStart = this._playableStartTimestamp ? (Date.now() - this._playableStartTimestamp - this._backgroundTime) / 1000 : 0;
        if (this.isKPIDataValid({
            timeFromShow,
            backgroundTime,
            timeFromPlayableStart
        }, 'playable_mraid_' + eventName)) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, eventName, eventData));
        }
    }
    protected handleDeviceOrientation(event: DeviceOrientationEvent) {
        if (this._isLoaded) {
            this._iframe.contentWindow!.postMessage({
                type: 'deviceorientation',
                event: {
                    alpha: event.alpha,
                    beta: event.beta,
                    gamma: event.gamma,
                    absolute: event.absolute
                }
            }, '*');
        }
    }
}
