import { IWebPlayerEventSettings } from 'Ads/Native/WebPlayer';
import { BannerViewType } from 'Banners/Native/Banner';
import { Platform } from 'Core/Constants/Platform';
import { IObserver1, IObserver2 } from 'Core/Utilities/IObserver';
import { Template } from 'Core/Utilities/Template';
import { HTMLBannerAdUnit, IBannerAdUnitParameters } from 'Banners/AdUnits/HTMLBannerAdUnit';
import BannerContainer from 'html/banner/BannerContainer.html';

export class DisplayHTMLBannerAdUnit extends HTMLBannerAdUnit {
    private _urlLoadingObserver: IObserver2<string, string>;
    private _onCreateWebViewObserver: IObserver1<string>;
    protected _template: Template;

    constructor(parameters: IBannerAdUnitParameters) {
        super(parameters);
        this._template = new Template(BannerContainer);
    }

    public getViews() {
        return [BannerViewType.BannerPlayer];
    }

    public onDestroy() {
        this._webPlayerContainer.shouldOverrideUrlLoading.unsubscribe(this._urlLoadingObserver);
        this._webPlayerContainer.onCreateWebView.unsubscribe(this._onCreateWebViewObserver);
        return super.onDestroy();
    }

    protected onDomContentLoaded() {
        if (this._platform === Platform.ANDROID) {
            this._urlLoadingObserver = this._webPlayerContainer.shouldOverrideUrlLoading.subscribe((url) => {
                this.onOpenURL(url);
            });
        } else {
            this._onCreateWebViewObserver = this._webPlayerContainer.onCreateWebView.subscribe((url) => {
                this.onOpenURL(url);
            });
        }
        const eventSettings = this.getEventSettings();
        return super.setEventSettings(eventSettings);
    }

    protected getMarkup() {
        return Promise.resolve(decodeURIComponent(this._campaign.getMarkup()));
    }

    private getEventSettings(): IWebPlayerEventSettings {
        if (this._platform === Platform.ANDROID) {
            return {
                shouldOverrideUrlLoading: {
                    sendEvent: true,
                    returnValue: true
                }
            };
        } else {
            return {
                onCreateWindow: {
                    sendEvent: true
                }
            };
        }
    }
}
