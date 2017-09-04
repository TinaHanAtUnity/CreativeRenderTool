import MRAIDContainer from 'html/mraid/container.html';

import { View } from 'Views/View';
import { Observable0, Observable1, Observable4 } from 'Utilities/Observable';
import { Placement } from 'Models/Placement';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { WebViewError } from 'Errors/WebViewError';
import { Platform } from 'Constants/Platform';

export interface IOrientationProperties {
    allowOrientationChange: boolean;
    forceOrientation: ForceOrientation;
}

export abstract class MRAIDView extends View {

    public readonly onClick = new Observable1<string>();
    public readonly onReward = new Observable0();
    public readonly onSkip = new Observable0();
    public readonly onClose = new Observable0();
    public readonly onOrientationProperties = new Observable1<IOrientationProperties>();
    public readonly onAnalyticsEvent = new Observable4<number, number, string, any>();

    protected _placement: Placement;
    protected _campaign: MRAIDCampaign;

    public abstract setViewableState(viewable: boolean): void;

    public createMRAID(): Promise<string> {
        return this.fetchMRAID().then(mraid => {
            if(mraid) {
                const markup = this._campaign.getDynamicMarkup();
                if(markup) {
                    mraid = mraid.replace('{UNITY_DYNAMIC_MARKUP}', markup);
                }
                mraid = this.replaceMraidSources(mraid);

                return MRAIDContainer.replace('<body></body>', '<body>' + mraid + '</body>');
            }
            throw new WebViewError('Unable to fetch MRAID');
        });
    }

    private replaceMraidSources(mraid: string): string {
        const dom = new DOMParser().parseFromString(mraid, "text/html");
        if (!dom) {
            this._nativeBridge.Sdk.logWarning(`Could not parse markup for campaign ${this._campaign.getId()}`);
            return mraid;
        }
        const src = dom.documentElement.querySelector('script[src^="mraid.js"]');
        if (src && src.parentNode) {
            src.parentNode.removeChild(src);
        }
        return dom.documentElement.outerHTML;
    }

    private fetchMRAID(): Promise<string | undefined> {
        const resourceUrl = this._campaign.getResourceUrl();
        if (resourceUrl) {
            if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
                return this.requestMRaid(resourceUrl.getUrl());
            } else {
                const fileId = resourceUrl.getFileId();
                if (fileId) {
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
                if ((this._nativeBridge.getPlatform() === Platform.ANDROID && xhr.status === 0) || (xhr.status >= 200 && xhr.status <= 299)) {
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
