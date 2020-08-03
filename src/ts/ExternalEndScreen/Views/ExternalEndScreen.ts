import { ICoreApi } from 'Core/ICore';
import { Template } from 'Core/Utilities/Template';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import ExternalEndScreenTemplate from 'html/ExternalEndScreen.html';
import { IExperimentActionChoice } from 'MabExperimentation/Models/AutomatedExperiment';
import { IEndScreenHandler, IEndScreenParameters } from 'Ads/Views/EndScreen';
import { View } from 'Core/Views/View';
import { AbstractPrivacy, IPrivacyHandlerView } from 'Ads/Views/AbstractPrivacy';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { Image } from 'Ads/Models/Assets/Image';
import { ExternalEndScreenMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { Platform } from 'Core/Constants/Platform';
import { XHRequest } from 'Core/Utilities/XHRequest';

interface IExternalEndScreenUrlParameters {
    gameIcon: string | undefined;
    squareImage: string | undefined;
    landscapeImage: string | undefined;
    portraitImage: string | undefined;
    combination: IExperimentActionChoice | undefined;
    hidePrivacy: boolean;
    language: string;
    country: string;
    showGdpr: boolean;
    gameName: string;
    rating: number;
    ratingCount: number;
}

export class ExternalEndScreen extends View<IEndScreenHandler> implements IPrivacyHandlerView {
    private _combination: {} | undefined;
    private _language: string;
    private _campaign: PerformanceCampaign;
    private _core: ICoreApi;
    private _privacy: AbstractPrivacy;
    private _adUnitStyle: AdUnitStyle | undefined;
    private _showGDPRBanner: boolean;
    private _campaignId: string | undefined;
    private _hidePrivacy: boolean;
    private _iframe: HTMLIFrameElement;
    private _endScreenUrl: string;
    private _gdprPopupClicked: boolean;
    private _messageListener: (event: MessageEvent) => void;
    private _isIframeReady = false;
    private _country: string;
    private _endScreenParameters: Promise<IExternalEndScreenUrlParameters>;

    constructor(combination: IExperimentActionChoice | undefined, parameters: IEndScreenParameters, campaign: PerformanceCampaign, country: string) {
        super(parameters.platform, 'container-iframe-end-screen');

        this._language = parameters.language;
        this._privacy = parameters.privacy;
        this._adUnitStyle = parameters.adUnitStyle;
        this._showGDPRBanner = parameters.showGDPRBanner;
        this._campaignId = parameters.campaignId;
        this._hidePrivacy = parameters.hidePrivacy || false;
        this._campaign = campaign;
        this._combination = combination;
        this._template = new Template(ExternalEndScreenTemplate);
        this._core = parameters.core;
        this._country = country;
        // Cannot be null undefined. It is a condition to instantiate this class.
        this._endScreenUrl = campaign.getEndScreen()!.getUrl();
        this._endScreenParameters = this.getParameters();

        //
        // Communication channel
        //
        this._messageListener = event => {
            if (event.data.type === 'open') {
                this.route(event.data.url);
            } else if (event.data.type === 'getParameters') {
                // The iframe asked for the parameters, witch means it is loaded.
                this._isIframeReady = true;

                this.sendParameters();
            } else if (event.data.type === 'close') {
                this.onCloseEvent();
            } else if (event.data.type === 'metric') {
                SDKMetrics.reportMetricEvent(event.data.metric);
            }
        };
        window.addEventListener('message', this._messageListener);

        //
        // Privacy module
        //
        this._privacy.render();
        this._privacy.hide();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);
    }

    //
    // View
    //
    public render(): void {
        super.render();

        this.initIframe();
    }

    public show(): void {
        super.show();

        const displayContainer = () => {
            if (this._container) {
                this._container.style.display = 'block';
            }
        };

        if (this._isIframeReady) {
            SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.ShowIframe);
            displayContainer();
        } else {
            SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.NotReadyInTime);
            this.onCloseEvent();
        }

        if (AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.AutoCloseInvoked);
                this.onCloseEvent();
            }, AbstractAdUnit.getAutoCloseDelay());
        }
    }

    public hide(): void {
        super.hide();

        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._handlers.forEach(handler => handler.onGDPRPopupSkipped());
        }

        if (this._privacy) {
            this._privacy.hide();
        }

        if (this._container) {
            this._container.style.display = 'none';
        }
    }

    //
    // External End Screen
    //
    private initIframe(): void {
        SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.StartInitIframe);

        const iframe = this._iframe = <HTMLIFrameElement> this._container.querySelector('#iframe-end-screen');

        iframe.src = this._endScreenUrl;
    }

    private onDownloadEvent(): void {
        this._handlers.forEach(handler => handler.onEndScreenDownload({
            clickAttributionUrl: this._campaign.getClickAttributionUrl(),
            clickAttributionUrlFollowsRedirects: this._campaign.getClickAttributionUrlFollowsRedirects(),
            bypassAppSheet: this._campaign.getBypassAppSheet(),
            appStoreId: this._campaign.getAppStoreId(),
            store: this._campaign.getStore(),
            appDownloadUrl: this._campaign.getAppDownloadUrl(),
            adUnitStyle: this._adUnitStyle
        }));
    }

    private route(url: string): void {
        const protocol = 'sdk://';

        if (url.startsWith(protocol)) {
            if (url === protocol + 'privacy') {
                this.onPrivacyEvent();
            } else if (url === protocol + 'download') {
                this.onDownloadEvent();
            }
        } else {
            SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.DefaultRouteUsed);
            this.onDownloadEvent();
        }
    }

    public onCloseEvent(): void {
        window.removeEventListener('message', this._messageListener);

        this._handlers.forEach(handler => handler.onEndScreenClose());
    }

    // The iframe cannot load images from cache url.
    // Cache API is only available with 2.1.0 and works only on ios for this purpose.
    private getImage(image: Image): Promise<string | undefined> {
        const originalUrl = image.getOriginalUrl();

        if (!image.isCached()) {
            SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.UseOriginalUrl);
            return Promise.resolve(originalUrl);
        }

        // After 2.1.0
        const imageExt = originalUrl.split('.').pop();

        const dataUrl = (rawData: string) => `data:image/${imageExt};base64,${rawData}`;

        if (this._platform === Platform.ANDROID) {
            return XHRequest.getDataUrl(image.getUrl()).catch(() => {
                SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.UnableToGetDataUrl);
                return originalUrl;
            });
        } else {
            const fileId = image.getFileId();
            if (fileId) {
                return this._core.Cache.getFileContent(fileId, 'Base64').then(dataUrl);
            } else {
                return XHRequest.getDataUrl(image.getOriginalUrl()).catch(() => {
                    SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.UnableToGetDataUrl);
                    return originalUrl;
                });
            }
        }
    }

    private getParameters(): Promise<IExternalEndScreenUrlParameters> {
        const getImage = (image: Image | undefined) => image
            ? this.getImage(image)
            : Promise.resolve(undefined);

        return Promise.all([
            getImage(this._campaign.getGameIcon()),
            getImage(this._campaign.getLandscape()),
            getImage(this._campaign.getPortrait()),
            getImage(this._campaign.getSquare())
        ]).then(([gameIcon, landscape, portrait, square]) => {
            if (!gameIcon) {
                SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.GameIconImageMissing);
            }

            // If square is not provided, landscape and portrait should be both provided
            if (!square && (!landscape || !portrait)) {
                SDKMetrics.reportMetricEvent(ExternalEndScreenMetric.ImageMissing);
            }

            return {
                'gameIcon': gameIcon,
                'squareImage': square,
                'landscapeImage': landscape,
                'portraitImage': portrait,
                'combination': this._combination,
                'hidePrivacy': this._hidePrivacy,
                'language': this._language,
                'country': this._country,
                'showGdpr': this._showGDPRBanner,
                'gameName': this._campaign.getGameName(),
                'rating': this._campaign.getRating(),
                'ratingCount': this._campaign.getRatingCount()
            };
        });
    }

    private sendParameters(): void {
        this._endScreenParameters.then(parameters => {
            if (this._iframe.contentWindow) {
                this._iframe.contentWindow.postMessage({
                    type: 'parameters',
                    parameters: JSON.stringify(parameters)
                }, '*');
            }
        });
    }

    //
    // Privacy
    //
    public onPrivacyClose(): void {
        if (this._privacy) {
            this._privacy.hide();
        }
    }

    private onPrivacyEvent(): void {
        if (this._showGDPRBanner) {
            this._gdprPopupClicked = true;
        }

        this._privacy.show();
    }
}
