import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { Placement } from 'Ads/Models/Placement';
import { AbstractPrivacy, IPrivacyHandler } from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { WebViewError } from 'Core/Errors/WebViewError';
import { ABGroup } from 'Core/Models/ABGroup';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { DOMUtils } from 'Core/Utilities/DOMUtils';
import { XHRequest } from 'Core/Utilities/XHRequest';
import { View } from 'Core/Views/View';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { Diagnostics } from 'Core/Utilities/Diagnostics';

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
    onPlayableAnalyticsEvent(timeFromShow: number|undefined, timeFromPlayableStart: number|undefined, backgroundTime: number|undefined, event: string, eventData: any): void;
    onMraidShowEndScreen(): void;
}

export abstract class MRAIDView<T extends IMRAIDViewHandler> extends View<T> implements IPrivacyHandler {

    protected _placement: Placement;
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
    protected _updateInterval: any;
    protected _closeRemaining: number;
    protected _CLOSE_LENGTH = 30;

    protected _showTimestamp: number;
    protected _playableStartTimestamp: number;
    protected _backgroundTime: number = 0;
    protected _backgroundTimestamp: number;

    constructor(nativeBridge: NativeBridge, id: string, placement: Placement, campaign: MRAIDCampaign, privacy: AbstractPrivacy, showGDPRBanner: boolean, abGroup: ABGroup, gameSessionId?: number) {
        super(nativeBridge, id);

        this._placement = placement;
        this._campaign = campaign;
        this._privacy = privacy;
        this._showGDPRBanner = showGDPRBanner;

        this._abGroup = abGroup;

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
    }

    public abstract setViewableState(viewable: boolean): void;

    public render() {
        super.render();
        this._closeElement = <HTMLElement>this._container.querySelector('.close-region');
        this._gdprBanner = <HTMLElement>this._container.querySelector('.gdpr-pop-up');
        this._privacyButton = <HTMLElement>this._container.querySelector('.privacy-button');
    }

    public hide() {
        this.setViewableState(false);

        if(this._updateInterval) {
            clearInterval(this._updateInterval);
            this._updateInterval = undefined;
        }

        super.hide();

        if(this._privacy) {
            this._privacy.removeEventHandler(this);
            this._privacy.hide();
        }

        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._handlers.forEach(handler => handler.onGDPRPopupSkipped());
        }

        if (this._stats !== undefined) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(this._stats.averageFps, this._stats.averagePlayFps, 0, 'playable_performance_stats', this._stats));
        }
    }

    public createMRAID(container: any): Promise<string> {
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

    public onPrivacy(url: string): void {
        // do nothing
    }

    public onGDPROptOut(optOutEnabled: boolean) {
        // do nothing
    }

    public setCallButtonEnabled(value: boolean) {
        if (this._callButtonEnabled !== value) {
            this._callButtonEnabled = value;
        }
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

    protected getMraidAsUrl(mraid: string): Promise<string> {
        mraid = this._nativeBridge.getPlatform() === Platform.ANDROID ? decodeURIComponent(mraid) : mraid;
        return this._nativeBridge.Cache.setFileContent('webPlayerMraid', 'UTF-8', mraid)
        .then(() => {
            return this._nativeBridge.Cache.getFilePath('webPlayerMraid');
        });
    }

    protected prepareProgressCircle() {
        if(this._placement.allowSkip()) {
            const skipLength = this._placement.allowSkipInSeconds();
            this._closeRemaining = this._CLOSE_LENGTH;
            let skipRemaining = skipLength;
            this._updateInterval = setInterval(() => {
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
            this._updateInterval = setInterval(() => {
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

        if(this._nativeBridge.getPlatform() === Platform.ANDROID && this._nativeBridge.getApiLevel() < 15) {
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

    protected checkIsValid(timeInSeconds: number): number | undefined {
        if (timeInSeconds < 0 || timeInSeconds > 600) {
            return undefined;
        }
        return timeInSeconds;
    }

    private replaceMraidSources(mraid: string): string {
        // Workaround for https://jira.hq.unity3d.com/browse/ABT-333
        // On certain versions of the webview on iOS (2.0.2 - 2.0.8) there seems
        // to be some sort of race where the parsed document returns a null
        // documentElement which throws an exception.

        let dom: Document;
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            dom = DOMUtils.parseFromString(mraid, 'text/html');
        } else {
            dom = new DOMParser().parseFromString(mraid, 'text/html');
        }
        if(!dom) {
            this._nativeBridge.Sdk.logWarning(`Could not parse markup for campaign ${this._campaign.getId()}`);
            return mraid;
        }

        const src = dom.documentElement!.querySelector('script[src^="mraid.js"]');
        if(src && src.parentNode) {
            src.parentNode.removeChild(src);
        }

        return dom.documentElement!.outerHTML;
    }

    private fetchMRAID(): Promise<string | undefined> {
        const resourceUrl = this._campaign.getResourceUrl();
        if(resourceUrl) {
            if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
                return XHRequest.get(resourceUrl.getUrl());
            } else {
                const fileId = resourceUrl.getFileId();
                if(fileId) {
                    return this._nativeBridge.Cache.getFileContent(fileId, 'UTF-8');
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
        }
    }

    public onPrivacyEvent(event: Event): void {
        event.preventDefault();
        this._privacy.show();
    }

    public onGDPRPopupEvent(event: Event) {
        event.preventDefault();
        this._gdprPopupClicked = true;
        this._privacy.show();
    }

    protected onSetOrientationProperties(allowOrientationChange: boolean, forceOrientation: Orientation) {
        this._handlers.forEach(handler => handler.onMraidOrientationProperties({
            allowOrientationChange: allowOrientationChange,
            forceOrientation: forceOrientation
        }));
    }

    protected onOpen(url: string) {
        this._handlers.forEach(handler => handler.onMraidClick(url));
    }

    protected onClose() {
        this._handlers.forEach(handler => handler.onMraidClose());
    }

    protected onCustomState(customState: string) {
        if(customState === 'completed') {
            if(!this._placement.allowSkip() && this._closeRemaining > 5) {
                this._closeRemaining = 5;
            }
        }
    }

    protected onResizeWebview() {
        // this._handlers.forEach(handler => handler.onWebViewResize(false));
    }
}
