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

    protected _abGroup: ABGroup;

    protected _stats: IMRAIDFullStats;

    protected _callButtonEnabled: boolean = true;

    constructor(nativeBridge: NativeBridge, id: string, placement: Placement, campaign: MRAIDCampaign, privacy: AbstractPrivacy, showGDPRBanner: boolean, abGroup: ABGroup) {
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
    }

    public abstract setViewableState(viewable: boolean): void;

    public hide() {
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

    public onPrivacyClose(): void {
        if(this._privacy) {
            this._privacy.hide();
        }
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

    protected onPrivacyEvent(event: Event): void {
        event.preventDefault();

        this._privacy.show();
    }

    protected onGDPRPopupEvent(event: Event) {
        event.preventDefault();
        this._gdprPopupClicked = true;
        this._privacy.show();
    }

    protected abstract choosePrivacyShown(): void;

    protected updateStats(stats: IMRAIDStats): void {
        this._stats = {
            ...stats,
            averageFps: stats.frameCount / stats.totalTime,
            averagePlayFps: stats.frameCount / stats.playTime
        };
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

        const src = dom.documentElement.querySelector('script[src^="mraid.js"]');
        if(src && src.parentNode) {
            src.parentNode.removeChild(src);
        }

        return dom.documentElement.outerHTML;
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
}
