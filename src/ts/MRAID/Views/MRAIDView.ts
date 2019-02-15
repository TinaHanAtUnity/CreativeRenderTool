import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { Placement } from 'Ads/Models/Placement';
import {AbstractPrivacy, IPrivacyHandlerView} from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { WebViewError } from 'Core/Errors/WebViewError';
import { ICoreApi } from 'Core/ICore';
import { ABGroup } from 'Core/Models/ABGroup';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { DOMUtils } from 'Core/Utilities/DOMUtils';
import { XHRequest } from 'Core/Utilities/XHRequest';
import { View } from 'Core/Views/View';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { MRAIDAdapterContainer } from 'MRAID/EventBridge/MRAIDAdapterContainer';
import { IMRAIDHandler } from 'MRAID/EventBridge/MRAIDEventAdapter';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';

export interface IOrientationProperties {
    allowOrientationChange: boolean;
    forceOrientation: Orientation;
}

export interface IMRAIDStats {
    totalTime: number;
    playTime: number;
    frameCount: number;
}

export interface IMRAIDFullStats extends IMRAIDStats {
    averageFps: number;
    averagePlayFps: number;
}

export interface IMRAIDViewHandler extends GDPREventHandler {
    onMraidClick(url: string): void;
    onMraidReward(): void;
    onMraidSkip(): void;
    onMraidClose(): void;
    onMraidOrientationProperties(orientationProperties: IOrientationProperties): void;
    onPlayableAnalyticsEvent(timeFromShow: number|undefined, timeFromPlayableStart: number|undefined, backgroundTime: number|undefined, event: string, eventData: unknown): void;
    onMraidShowEndScreen(): void;
    onCustomImpressionEvent(): void;
    onWebViewFullScreen(): Promise<void>;
    onWebViewReduceSize(): Promise<void>;
}

export abstract class MRAIDView<T extends IMRAIDViewHandler> extends View<T> implements IPrivacyHandlerView, IMRAIDHandler {

    protected _core: ICoreApi;
    protected _placement: Placement;
    protected _deviceInfo: DeviceInfo;
    protected _campaign: MRAIDCampaign;
    protected _privacy: AbstractPrivacy;
    protected _showGDPRBanner = false;
    protected _gdprPopupClicked = false;

    protected _gameSessionId: number;
    protected _abGroup: ABGroup;

    protected _stats: IMRAIDFullStats;

    protected _callButtonEnabled: boolean = true;

    protected _isLoaded = false;

    protected _gdprBanner: HTMLElement;
    protected _privacyButton: HTMLElement;

    protected _canClose = false;
    protected _canSkip = false;

    protected _closeElement: HTMLElement;
    protected _didReward = false;
    protected _updateInterval?: number;
    protected _closeRemaining: number;
    protected _CLOSE_LENGTH = 30;

    protected _showTimestamp: number;
    protected _playableStartTimestamp: number;
    protected _backgroundTime: number = 0;
    protected _backgroundTimestamp: number;

    protected _mraidAdapterContainer: MRAIDAdapterContainer;

    protected _privacyPanelOpen: boolean;

    constructor(platform: Platform, core: ICoreApi, deviceInfo: DeviceInfo, id: string, placement: Placement, campaign: MRAIDCampaign, privacy: AbstractPrivacy, showGDPRBanner: boolean, abGroup: ABGroup, gameSessionId?: number) {
        super(platform, id);

        this._core = core;
        this._placement = placement;
        this._deviceInfo = deviceInfo;
        this._campaign = campaign;
        this._privacy = privacy;
        this._showGDPRBanner = showGDPRBanner;

        this._abGroup = abGroup;

        this._privacyPanelOpen = false;
        this._privacy.render();
        this._privacy.hide();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.close-region'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: '.privacy-button'
            },
            {
                event: 'click',
                listener: (event: Event) => {
                    this.onGDPRPopupEvent(event);
                    this._gdprPopupClicked = true;
                    this.choosePrivacyShown();
                },
                selector: '.gdpr-link'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: '.icon-gdpr'
            }
        ];

        this._gameSessionId = gameSessionId || 0;
        this._mraidAdapterContainer = new MRAIDAdapterContainer(this);
    }

    public abstract setViewableState(viewable: boolean): void;

    public render() {
        super.render();
        this._closeElement = <HTMLElement>this._container.querySelector('.close-region');
        this._gdprBanner = <HTMLElement>this._container.querySelector('.gdpr-pop-up');
        this._privacyButton = <HTMLElement>this._container.querySelector('.privacy-button');
        this.choosePrivacyShown();
    }

    public hide() {
        this.setViewableState(false);

        if(this._updateInterval) {
            clearInterval(this._updateInterval);
            this._updateInterval = undefined;
        }

        super.hide();

        if (this._privacy) {
            this._privacy.removeEventHandler(this);
            this._privacy.hide();
            const container = this._privacy.container();
            if (container && container.parentElement) {
                container.parentElement.removeChild(container);
            }
        }

        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._handlers.forEach(handler => handler.onGDPRPopupSkipped());
        }

        if (this._stats !== undefined) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(this._stats.averageFps, this._stats.averagePlayFps, 0, 'playable_performance_stats', this._stats));
        }
    }

    public createMRAID(container: string): Promise<string> {
        const fetchingTimestamp = Date.now();
        let fetchingStopTimestamp = Date.now();
        let mraidParseTimestamp = Date.now();
        return this.fetchMRAID().then(mraid => {
            fetchingStopTimestamp = mraidParseTimestamp = Date.now();
            if(mraid) {
                const markup = this._campaign.getDynamicMarkup();
                if(markup) {
                    mraid = mraid.replace('{UNITY_DYNAMIC_MARKUP}', markup);
                }

                mraid = mraid.replace(/\$/g, '$$$');
                mraid = this.replaceMraidSources(mraid);
                return container.replace('<body></body>', '<body>' + mraid + '</body>');
            }
            throw new WebViewError('Unable to fetch MRAID');
        }).then((data) => {
            const fetchingDuration = (fetchingStopTimestamp - fetchingTimestamp) / 1000;
            const mraidParseDuration = (Date.now() - mraidParseTimestamp) / 1000;

            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(fetchingDuration, mraidParseDuration, 0, 'playable_fetching_time', {}));

            return data;
        });
    }

    protected isKPIDataValid(values: { [key: string]: number }, kpi: string): boolean {

        let valid = true;

        Object.keys(values).forEach((key) => {
            const time = values[key];
            if (typeof time !== 'number' || isNaN(time) || time < 0 || time > 3600) {
                valid = false;
            }
        });

        if (!valid && this._gameSessionId % 1000 === 999) {
            Diagnostics.trigger('playable_kpi_time_value_error', {
                message: 'Time value for KPI looks unreasonable',
                kpi,
                ...values
            });
        }

        return valid;
    }

    public setCallButtonEnabled(value: boolean) {
        if (this._callButtonEnabled !== value) {
            this._callButtonEnabled = value;
        }
    }

    public isLoaded(): boolean {
        return this._isLoaded;
    }

    protected choosePrivacyShown(): void {
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

    protected updateStats(stats: IMRAIDStats): void {
        this._stats = {
            ...stats,
            averageFps: stats.frameCount / stats.totalTime,
            averagePlayFps: stats.frameCount / stats.playTime
        };
    }

    protected prepareProgressCircle() {
        if(this._placement.allowSkip()) {
            const skipLength = this._placement.allowSkipInSeconds();
            this._closeRemaining = this._CLOSE_LENGTH;
            let skipRemaining = skipLength;
            this._updateInterval = window.setInterval(() => {
                if(this._closeRemaining > 0) {
                    this._closeRemaining--;
                }
                if(skipRemaining > 0) {
                    skipRemaining--;
                    this.updateProgressCircle(this._closeElement, (skipLength - skipRemaining) / skipLength);
                }
                if(skipRemaining <= 0) {
                    this._canSkip = true;
                    this._closeElement.style.opacity = '1';
                    this.updateProgressCircle(this._closeElement, 1);
                }
                if (this._closeRemaining <= 0) {
                    clearInterval(this._updateInterval);
                    this._canClose = true;
                }
            }, 1000);
        } else {
            this._closeRemaining = this._CLOSE_LENGTH;
            this._updateInterval = window.setInterval(() => {
                const progress = (this._CLOSE_LENGTH - this._closeRemaining) / this._CLOSE_LENGTH;
                if(progress >= 0.75 && !this._didReward) {
                    this._handlers.forEach(handler => handler.onMraidReward());
                    this._didReward = true;
                }
                if(this._closeRemaining > 0) {
                    this._closeRemaining--;
                    this.updateProgressCircle(this._closeElement, progress);
                }
                if (this._closeRemaining <= 0) {
                    clearInterval(this._updateInterval);
                    this._canClose = true;
                    this._closeElement.style.opacity = '1';
                    this.updateProgressCircle(this._closeElement, 1);
                }
            }, 1000);
        }
    }

    protected updateProgressCircle(container: HTMLElement, value: number) {
        const wrapperElement = <HTMLElement>container.querySelector('.progress-wrapper');

        if(this._platform === Platform.ANDROID && (<AndroidDeviceInfo>this._deviceInfo).getApiLevel() < 15) {
            wrapperElement.style.display = 'none';
            this._container.style.display = 'none';
            /* tslint:disable:no-unused-expression */
            this._container.offsetHeight;
            /* tslint:enable:no-unused-expression */
            this._container.style.display = 'block';
            return;
        }

        const leftCircleElement = <HTMLElement>container.querySelector('.circle-left');
        const rightCircleElement = <HTMLElement>container.querySelector('.circle-right');

        const degrees = value * 360;
        leftCircleElement.style.webkitTransform = 'rotate(' + degrees + 'deg)';

        if(value >= 0.5) {
            wrapperElement.style.webkitAnimationName = 'close-progress-wrapper';
            rightCircleElement.style.webkitAnimationName = 'right-spin';
        }
    }

    protected setAnalyticsBackgroundTime(viewable: boolean) {
        if(!viewable) {
            this._backgroundTimestamp = Date.now();
        } else {
            if (this._backgroundTimestamp) {
                this._backgroundTime += Date.now() - this._backgroundTimestamp;
            }
        }
    }

    private replaceMraidSources(mraid: string): string {
        // Workaround for https://jira.hq.unity3d.com/browse/ABT-333
        // On certain versions of the webview on iOS (2.0.2 - 2.0.8) there seems
        // to be some sort of race where the parsed document returns a null
        // documentElement which throws an exception.

        let dom: Document;
        if (this._platform === Platform.IOS) {
            dom = DOMUtils.parseFromString(mraid, 'text/html');
        } else {
            dom = new DOMParser().parseFromString(mraid, 'text/html');
        }
        if(!dom) {
            this._core.Sdk.logWarning(`Could not parse markup for campaign ${this._campaign.getId()}`);
            return mraid;
        }

        const src = dom.documentElement.querySelector('script[src^="mraid.js"]');
        if(src && src.parentNode) {
            src.parentNode.removeChild(src);
        }

        return dom.documentElement.outerHTML;
    }

    private fetchMRAID(): Promise<string | undefined> {
        const resourceUrl = this._campaign.getResourceUrl();
        if(resourceUrl) {
            if (this._platform === Platform.ANDROID) {
                return XHRequest.get(resourceUrl.getUrl());
            } else {
                const fileId = resourceUrl.getFileId();
                if(fileId) {
                    return this._core.Cache.getFileContent(fileId, 'UTF-8');
                } else {
                    return XHRequest.get(resourceUrl.getOriginalUrl());
                }
            }
        }
        return Promise.resolve(this._campaign.getResource());
    }

    protected abstract onCloseEvent(event: Event): void;

    public onPrivacyClose(): void {
        if(this._privacy) {
            this._privacy.hide();
            this._privacyPanelOpen = false;
        }
    }

    public onPrivacyEvent(event: Event): void {
        event.preventDefault();
        this._privacy.show();
        this._privacyPanelOpen = true;
    }

    public onGDPRPopupEvent(event: Event) {
        event.preventDefault();
        this._gdprPopupClicked = true;
        this._privacy.show();
        this._privacyPanelOpen = true;
    }

    public loadWebPlayer(webPlayerContainer: WebPlayerContainer): Promise<void> {
        return Promise.resolve();
    }

    protected onSetOrientationProperties(allowOrientationChange: boolean, orientation: Orientation) {
        this._handlers.forEach(handler => handler.onMraidOrientationProperties({
            allowOrientationChange: allowOrientationChange,
            forceOrientation: orientation
        }));
    }

    protected onOpen(url: string) {
        this._handlers.forEach(handler => handler.onMraidClick(url));
    }

    protected onLoadedEvent(): void {
        // do nothing by default except for MRAID
    }

    protected onAREvent(msg: MessageEvent): Promise<void> {
        return Promise.resolve();
    }

    protected abstract sendMraidAnalyticsEvent(eventName: string, eventData?: unknown): void;

    public onBridgeSetOrientationProperties(allowOrientationChange: boolean, forceOrientation: Orientation) {
        this.onSetOrientationProperties(allowOrientationChange, forceOrientation);
    }

    public onBridgeOpen(url: string) {
        this.onOpen(encodeURI(url));
    }

    public onBridgeLoad() {
        this.onLoadedEvent();
    }

    public onBridgeAnalyticsEvent(event: string, eventData: string) {
        this.sendMraidAnalyticsEvent(event, eventData);
    }

    public onBridgeClose() {
        this._handlers.forEach(handler => handler.onMraidClose());
    }

    public onBridgeStateChange(customState: string) {
        if(customState === 'completed') {
            if(!this._placement.allowSkip() && this._closeRemaining > 5) {
                this._closeRemaining = 5;
            }
        }
    }

    public onBridgeResizeWebview() {
        // This will be used to handle rotation changes for webplayer-based mraid
    }

    public onBridgeSendStats(totalTime: number, playTime: number, frameCount: number) {
        this.updateStats({
            totalTime: totalTime,
            playTime: playTime,
            frameCount: frameCount
        });
    }

    public onBridgeAREvent(msg: MessageEvent) {
        this.onAREvent(msg).catch((reason) => this._core.Sdk.logError('AR message error: ' + reason.toString()));
    }
}
