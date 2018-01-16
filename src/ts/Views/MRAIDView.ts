import MRAIDContainer from 'html/mraid/container.html';

import { View } from 'Views/View';
import { Placement } from 'Models/Placement';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { WebViewError } from 'Errors/WebViewError';
import { Platform } from 'Constants/Platform';
import { NativeBridge } from 'Native/NativeBridge';
import { IPrivacyHandler, Privacy } from 'Views/Privacy';
import { platform } from 'os';
import { DOMUtils } from 'Utilities/DOMUtils';

export interface IOrientationProperties {
    allowOrientationChange: boolean;
    forceOrientation: ForceOrientation;
}

export interface IMRAIDViewHandler {
    onMraidClick(url: string): void;
    onMraidReward(): void;
    onMraidSkip(): void;
    onMraidClose(): void;
    onMraidOrientationProperties(orientationProperties: IOrientationProperties): void;
    onMraidAnalyticsEvent(timeFromShow: number|undefined, timeFromPlayableStart: number|undefined, backgroundTime: number|undefined, event: string, eventData: any): void;
    onMraidShowEndScreen(): void;
    onMraidPrivacy(url: string): void;
}

export abstract class MRAIDView<T extends IMRAIDViewHandler> extends View<T> implements IPrivacyHandler {

    protected _placement: Placement;
    protected _campaign: MRAIDCampaign;

    private _coppaCompliant: boolean;

    private _privacy: Privacy;

    constructor(nativeBridge: NativeBridge, id: string, placement: Placement, campaign: MRAIDCampaign, coppaCompliant: boolean) {
        super(nativeBridge, id);

        this._placement = placement;
        this._campaign = campaign;
        this._coppaCompliant = coppaCompliant;

    }

    public abstract setViewableState(viewable: boolean): void;

    public hide() {
        super.hide();

        if(this._privacy) {
            this._privacy.hide();
            this._privacy.container().parentElement!.removeChild(this._privacy.container());
            delete this._privacy;
        }
    }

    public createMRAID(): Promise<string> {
        return this.fetchMRAID().then(mraid => {
            if(mraid) {
                const markup = this._campaign.getDynamicMarkup();
                if(markup) {
                    mraid = mraid.replace('{UNITY_DYNAMIC_MARKUP}', markup);
                }

                mraid = mraid.replace(/\$/g, '$$$');
                mraid = this.replaceMraidSources(mraid);
                return MRAIDContainer.replace('<body></body>', '<body>' + mraid + '</body>');
            }
            throw new WebViewError('Unable to fetch MRAID');
        });
    }

    public onPrivacyClose(): void {
        if(this._privacy) {
            this._privacy.removeEventHandler(this);
            this._privacy.hide();
            this._privacy.container().parentElement!.removeChild(this._privacy.container());
            delete this._privacy;
        }
    }

    public onPrivacy(url: string): void {
        this._handlers.forEach(handler => handler.onMraidPrivacy(url));
    }

    protected onPrivacyEvent(event: Event): void {
        event.preventDefault();
        this._privacy = new Privacy(this._nativeBridge, this._coppaCompliant);
        this._privacy.render();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);
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
                return this.requestMRaid(resourceUrl.getUrl());
            } else {
                const fileId = resourceUrl.getFileId();
                if(fileId) {
                    return this._nativeBridge.Cache.getFileContent(fileId, 'UTF-8');
                } else {
                    return this.requestMRaid(resourceUrl.getOriginalUrl());
                }
            }
        }
        return Promise.resolve(this._campaign.getResource());
    }

    private requestMRaid(url: string): Promise<string | undefined> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.addEventListener('load', () => {
                if((xhr.status === 0 && url.indexOf('file://') === 0) || (xhr.status >= 200 && xhr.status <= 299)) {
                    resolve(xhr.responseText);
                } else {
                    reject(new Error(`XHR returned with unknown status code ${xhr.status}`));
                }
            }, false);
            xhr.open('GET', decodeURIComponent(url));
            xhr.send();
        });
    }
}
