import MRAIDContainer from 'html/mraid/container.html';

import { View } from 'Views/View';
import { Observable0, Observable1, Observable2 } from 'Utilities/Observable';
import { Placement } from 'Models/Placement';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { Platform } from 'Constants/Platform';
import { ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { WebViewError } from 'Errors/WebViewError';

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
    public readonly onAnalyticsEvent = new Observable2<string, number>();

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
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.addEventListener('load', () => {
                        resolve(xhr.responseText);
                    }, false);
                    xhr.open('GET', decodeURIComponent(resourceUrl.getUrl()));
                    xhr.send();
                });
            } else {
                const fileId = resourceUrl.getFileId();
                if (fileId) {
                    return this._nativeBridge.Cache.getFileContent(fileId, 'UTF-8');
                }
            }
        }
        return Promise.resolve(this._campaign.getResource());
    }
}
