import { AbstractPrivacy, IPrivacyHandlerView } from 'Ads/Views/AbstractPrivacy';
import { Template } from 'Core/Utilities/Template';
import VastEndcardOverlayTemplate from 'html/VastHTMLEndScreen.html';
import VastEndcardHTMLTemplate from 'html/VastEndcardHTMLContent.html';
import { VastEndScreen } from 'VAST/Views/VastEndScreen';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { ITemplateData, TemplateDataType } from 'Core/Views/View';
import { AdUnitContainer, ViewConfiguration } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IWebPlayerWebSettingsAndroid, IWebPlayerWebSettingsIos } from 'Ads/Native/WebPlayer';
import { Platform } from 'Core/Constants/Platform';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IObserver1, IObserver2 } from 'Core/Utilities/IObserver';
import { ICoreApi } from 'Core/ICore';

export class VastHTMLEndScreen extends VastEndScreen implements IPrivacyHandlerView {

    private _privacy: AbstractPrivacy;
    private _webPlayerContainer: WebPlayerContainer;
    private _htmlContentTemplate: Template;
    private readonly _htmlContentTemplateData: ITemplateData  = {};
    private _adUnitContainer: AdUnitContainer;
    private _deviceInfo: DeviceInfo;
    private _shouldOverrideUrlLoadingObserver: IObserver2<string, string>;
    private _onCreateWebview: IObserver1<string>;
    private _core: ICoreApi;
    private _controlBarHeight: number;
    private _screenWidth: number;
    private _screenHeight: number;

    constructor(parameters: IAdUnitParameters<VastCampaign>, webPlayerContainer: WebPlayerContainer) {
        super(parameters);

        this._privacy = parameters.privacy;
        this._hidePrivacy = parameters.adsConfig.getHidePrivacy() || false;
        this._webPlayerContainer = webPlayerContainer;
        this._adUnitContainer = parameters.container;
        this._deviceInfo = parameters.deviceInfo;
        this._core = parameters.core;

        this._htmlContentTemplateData = {
            'endScreenHtmlContent': (this._campaign.getVast().getHtmlCompanionResourceContent() ? this._campaign.getVast().getHtmlCompanionResourceContent() : undefined)
        };
        this._template = new Template(VastEndcardOverlayTemplate);
        this._htmlContentTemplate = new Template(VastEndcardHTMLTemplate);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.btn-close-region-bottom'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: '.privacy-button'
            }
        ];
        this._privacy.addEventHandler(this);
        this._controlBarHeight = 100;
    }

    public show(): void {
        if (this._htmlContentTemplateData) {
            super.show();
            this.setUpWebPlayers().then(() => {
                this._webPlayerContainer.setData(this._htmlContentTemplate.render(this._htmlContentTemplateData), 'text/html', 'UTF-8');
            });
        } else {
            this.onCloseEvent(new Event('click'));
        }
    }

    public remove(): void {
        super.remove();
        if (this._privacy) {
            this._privacy.hide();
            const privacyContainer = this._privacy.container();
            if (privacyContainer && privacyContainer.parentElement) {
                privacyContainer.parentElement.removeChild(privacyContainer);
            }
            delete this._privacy;
        }
    }

    public onPrivacyClose(): void {
        this._adUnitContainer.setViewFrame('webview', 0, this._screenHeight - this._controlBarHeight, this._screenWidth, this._controlBarHeight).then(() => {
            if (this._privacy) {
                this._privacy.hide();
            }
        });
    }

    private setUpWebPlayers(): Promise<void> {
        if (this._platform === Platform.IOS) {
            this._onCreateWebview =  this._webPlayerContainer.onCreateWebView.subscribe((url) => {
                this.shouldOverrideUrlLoading(url, undefined);
            });
        } else {
            this._shouldOverrideUrlLoadingObserver = this._webPlayerContainer.shouldOverrideUrlLoading.subscribe((url, method) => {
                this.shouldOverrideUrlLoading(url, method);
            });
        }
        let webPlayerSettings: IWebPlayerWebSettingsAndroid | IWebPlayerWebSettingsIos;
        if (this._platform === Platform.ANDROID) {
            webPlayerSettings = {
                setJavaScriptCanOpenWindowsAutomatically: [true]
            };
        } else {
            webPlayerSettings = {
                javaScriptCanOpenWindowsAutomatically: true,
                scalesPagesToFit: true,
                scrollEnabled: true
            };
        }
        return this._adUnitContainer.reconfigure(ViewConfiguration.WEB_PLAYER)
            .then(() => {
                this._adUnitContainer.reorient(false, this._adUnitContainer.getLockedOrientation());
            })
            .then(() => {
                this._webPlayerContainer.setSettings(webPlayerSettings, {}).then(() => {
                    const promises = [
                        this._deviceInfo.getScreenWidth(),
                        this._deviceInfo.getScreenHeight()
                    ];
                    Promise.all(promises).then(([screenWidth, screenHeight]) => {
                        this._screenHeight = screenHeight;
                        this._screenWidth = screenWidth;
                        this._adUnitContainer.setViewFrame('webplayer', 0, 0, screenWidth, screenHeight).then(() => {
                            this._adUnitContainer.setViewFrame('webview', 0, screenHeight - this._controlBarHeight, screenWidth, this._controlBarHeight).then(() => {
                                return this.setWebplayerEventSettings();
                            });
                        });
                    });
                });
            });
    }

    private shouldOverrideUrlLoading(url: string, method: string | undefined): void {
        if (this._platform === Platform.IOS) {
            this._core.iOS!.UrlScheme.open(url);
        } else {
            this._core.Android!.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }

    private setWebplayerEventSettings(): Promise<void> {
        const eventSettings = {
            onCreateWindow: {
                sendEvent: true
            },
            shouldOverrideUrlLoading: {
                sendEvent: true,
                returnValue: true,
                callSuper: false
            }
        };
        return this._webPlayerContainer.setEventSettings(eventSettings);
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onVastEndScreenClose());
    }

    private onPrivacyEvent(event: Event): void {
        event.preventDefault();
        this._adUnitContainer.setViewFrame('webview', 0, 0, this._screenWidth, this._screenHeight).then(() => {
            this._privacy.show();
        });
    }
}
