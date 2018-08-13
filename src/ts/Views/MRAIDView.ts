import { View } from 'Views/View';
import { Placement } from 'Models/Placement';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { WebViewError } from 'Errors/WebViewError';
import { Platform } from 'Constants/Platform';
import { NativeBridge } from 'Native/NativeBridge';
import { IPrivacyHandler, AbstractPrivacy } from 'Views/AbstractPrivacy';
import { platform } from 'os';
import { DOMUtils } from 'Utilities/DOMUtils';
import { XHRequest } from 'Utilities/XHRequest';
import { GDPREventHandler } from 'EventHandlers/GDPREventHandler';
import { Diagnostics } from 'Utilities/Diagnostics';

export interface IOrientationProperties {
    allowOrientationChange: boolean;
    forceOrientation: Orientation;
}

export interface IMRAIDViewHandler extends GDPREventHandler {
    onMraidClick(url: string): void;
    onMraidReward(): void;
    onMraidSkip(): void;
    onMraidClose(): void;
    onMraidOrientationProperties(orientationProperties: IOrientationProperties): void;
    onMraidAnalyticsEvent(timeFromShow: number|undefined, timeFromPlayableStart: number|undefined, backgroundTime: number|undefined, event: string, eventData: any): void;
    onMraidShowEndScreen(): void;
}

export abstract class MRAIDView<T extends IMRAIDViewHandler> extends View<T> implements IPrivacyHandler {

    protected _placement: Placement;
    protected _campaign: MRAIDCampaign;
    protected _privacy: AbstractPrivacy;
    protected _showGDPRBanner = false;
    protected _gdprPopupClicked = false;

    constructor(nativeBridge: NativeBridge, id: string, placement: Placement, campaign: MRAIDCampaign, privacy: AbstractPrivacy, showGDPRBanner: boolean) {
        super(nativeBridge, id);

        this._placement = placement;
        this._campaign = campaign;
        this._privacy = privacy;
        this._showGDPRBanner = showGDPRBanner;

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
    }

    public createMRAID(container: any): Promise<string> {
        const fetchingTimestamp = Date.now();
        return this.fetchMRAID().then(mraid => {
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
