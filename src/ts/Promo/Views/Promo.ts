import { Placement } from 'Ads/Models/Placement';
import { AbstractPrivacy, IPrivacyHandlerView } from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { Localization } from 'Core/Utilities/Localization';
import { Observable0, Observable1 } from 'Core/Utilities/Observable';
import { Template } from 'Core/Utilities/Template';
import { XHRequest } from 'Core/Utilities/XHRequest';
import { View } from 'Core/Views/View';
import PromoTpl from 'html/Promo.html';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import PromoIndexTpl from 'html/promo/container.html';

export class Promo extends View<{}> implements IPrivacyHandlerView {

    public readonly onPromo = new Observable1<string>();
    public readonly onClose = new Observable0();
    public readonly onGDPRPopupSkipped = new Observable0();

    private _core: ICoreApi;
    private _promoCampaign: PromoCampaign;
    private _localization: Localization;
    private _iframe: HTMLIFrameElement | null;
    private _messageHandler: (e: Event) => void;

    private _GDPRPopupElement: HTMLElement;
    private _privacyButtonElement: HTMLElement;
    private _privacy: AbstractPrivacy;
    private _showGDPRBanner: boolean = false;
    private _gdprPopupClicked: boolean = false;
    private _promoIndexTemplate: string;

    constructor(platform: Platform, core: ICoreApi, campaign: PromoCampaign, language: string, privacy: AbstractPrivacy, showGDPRBanner: boolean, placement: Placement) {
        super(platform, 'promo');
        this._localization = new Localization(language, 'promo');
        this._core = core;
        this._privacy = privacy;
        this._showGDPRBanner = showGDPRBanner;

        this._template = new Template(PromoTpl);
        this._promoCampaign = campaign;

        this._messageHandler = (e: Event) => this.onMessage(<MessageEvent>e);
        this._promoIndexTemplate = PromoIndexTpl;

        this.setupTemplateData(campaign, placement);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.close'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: '.gdpr-link'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: '.icon-gdpr'
            }
        ];

        this._privacy.render();
        this._privacy.hide();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);
    }

    public render() {
        super.render();

        this._iframe = this._container.querySelector('iframe');
        if (this._promoCampaign.isUsingServerTemplate()) {
            this.getPromoMarkup().then((markup) => {
                if (markup) {
                    const tpl = new Template(markup, this._localization);
                    this._iframe!.setAttribute('srcdoc', tpl.render(this._templateData ? this._templateData : {}));
                }
            });
        } else {
            const tpl = new Template(this._promoIndexTemplate, this._localization);
            this._iframe!.setAttribute('srcdoc', tpl.render(this._templateData ? this._templateData : {}));
        }
        this._GDPRPopupElement = <HTMLElement>this._container.querySelector('.gdpr-pop-up');
        this._privacyButtonElement = <HTMLElement>this._container.querySelector('.privacy-button');
    }

    public show(): void {
        super.show();
        window.addEventListener('message', this._messageHandler);
        this.choosePrivacyShown();
    }

    public hide(): void {
        super.hide();
        window.removeEventListener('message', this._messageHandler);

        if (this._privacy) {
            this._privacy.removeEventHandler(this);
        }

        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this.onGDPRPopupSkipped.trigger();
        }
    }

    public onPrivacyClose(): void {
        if (this._privacy) {
            this._privacy.hide();
        }
    }

    private choosePrivacyShown() {
        if (!this._gdprPopupClicked && this._showGDPRBanner) {
            this._GDPRPopupElement.style.visibility = 'visible';
            this._privacyButtonElement.style.pointerEvents = '1';
            this._privacyButtonElement.style.visibility = 'hidden';
        } else {
            this._privacyButtonElement.style.visibility = 'visible';
            this._GDPRPopupElement.style.pointerEvents = '1';
            this._GDPRPopupElement.style.visibility = 'hidden';
        }
    }

    private onMessage(e: MessageEvent): void {
        const data: { type: string } = e.data;
        switch (data.type) {
            case 'close':
                this.onCloseEvent(e);
                break;
            case 'promo':
                this.onPromoEvent(e);
                break;
            default:
        }
    }

    private onPromoEvent(event: Event): void {
        event.preventDefault();
        this.onPromo.trigger(this._promoCampaign.getIapProductId());
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        this.onClose.trigger();
    }

    private onPrivacyEvent(event: Event) {
        event.preventDefault();

        if (this._showGDPRBanner) {
            this._gdprPopupClicked = true;
            this.choosePrivacyShown();
        }

        this._privacy.show();
    }

    private getPromoMarkup(): Promise<string> {
        return this.getStaticMarkup().then((markup) => {
            return this.replaceDynamicMarkupPlaceholder(markup);
        }).catch((e) => {
            this._core.Sdk.logError('failed to get promo markup: ' + e);
            return '';
        });
    }

    private getStaticMarkup(): Promise<string> {
        const resourceUrl = this._promoCampaign.getCreativeResource();
        if(resourceUrl) {
            if (this._platform === Platform.ANDROID) {
                return XHRequest.get(resourceUrl.getUrl());
            } else {
                const fileId = resourceUrl.getFileId();
                if (fileId) {
                    return this._core.Cache.getFileContent(fileId, 'UTF-8');
                } else {
                    return XHRequest.get(resourceUrl.getOriginalUrl());
                }
            }
        }
        return Promise.reject(new Error('No creative resource found for campaign'));
    }

    private replaceDynamicMarkupPlaceholder(markup: string): string {
        const dynamicMarkup = this._promoCampaign.getDynamicMarkup();
        return dynamicMarkup ? markup.replace('{UNITY_DYNAMIC_MARKUP}', dynamicMarkup) : markup;
    }

    private setupTemplateData(campaign: PromoCampaign, placement: Placement) {
        if(campaign) {
            this._templateData = {
                'localizedPrice': PurchasingUtilities.getProductPrice(campaign.getIapProductId()),
                'isRewardedPromo': !placement.allowSkip(), // Support older promo version
                'rewardedPromoTimerDuration': !placement.allowSkip() ? 5 : 0
            };
            let portraitFontURL = '';
            let landscapeFontURL = '';
            const portraitAssets = campaign.getPortraitAssets();
            if (portraitAssets) {
                const buttonCoordinates = portraitAssets.getButtonAsset().getCoordinates();
                if (buttonCoordinates) {
                    this._templateData.portraitButtonCoordinatesTop = buttonCoordinates.getTop();
                    this._templateData.portraitButtonCoordinatesLeft = buttonCoordinates.getLeft();
                }
                const buttonSize = portraitAssets.getButtonAsset().getSize();
                this._templateData.portraitButtonSizeWidth = buttonSize.getWidth();
                this._templateData.portraitButtonSizeHeight = buttonSize.getHeight();
                const font = portraitAssets.getButtonAsset().getFont();
                if (font) {
                    this._templateData.portraitPriceTextFontFamily = font.getFamily();
                    this._templateData.portraitPriceTextFontColor = font.getColor();
                    this._templateData.portraitPriceTextFontSize = font.getSize();
                    portraitFontURL = font.getUrl();
                }
                const backgroundSize = portraitAssets.getBackgroundAsset().getSize();
                this._templateData.portraitBackgroundImageWidth = backgroundSize.getWidth();
                this._templateData.portraitBackgroundImageHeight = backgroundSize.getHeight();
                this._templateData.portraitBackgroundImage = portraitAssets.getBackgroundAsset().getImage().getUrl();
                this._templateData.portraitButtonImage = portraitAssets.getButtonAsset().getImage().getUrl();
            }
            const landscapeAssets = campaign.getLandscapeAssets();
            if (landscapeAssets) {
                const buttonCoordinates = landscapeAssets.getButtonAsset().getCoordinates();
                if (buttonCoordinates) {
                    this._templateData.landscapeButtonCoordinatesTop = buttonCoordinates.getTop();
                    this._templateData.landscapeButtonCoordinatesLeft = buttonCoordinates.getLeft();
                }
                const buttonSize = landscapeAssets.getButtonAsset().getSize();
                if (buttonSize) {
                    this._templateData.landscapeButtonSizeWidth = buttonSize.getWidth();
                    this._templateData.landscapeButtonSizeHeight = buttonSize.getHeight();
                }
                const font = landscapeAssets.getButtonAsset().getFont();
                if (font) {
                    this._templateData.landscapePriceTextFontFamily = font.getFamily();
                    this._templateData.landscapePriceTextFontColor = font.getColor();
                    this._templateData.landscapePriceTextFontSize = font.getSize();
                    landscapeFontURL = font.getUrl();
                }
                const backgroundSize = landscapeAssets.getBackgroundAsset().getSize();
                this._templateData.landscapeBackgroundImageWidth = backgroundSize.getWidth();
                this._templateData.landscapeBackgroundImageHeight = backgroundSize.getHeight();
                this._templateData.landscapeBackgroundImage = landscapeAssets.getBackgroundAsset().getImage().getUrl();
                this._templateData.landscapeButtonImage = landscapeAssets.getButtonAsset().getImage().getUrl();
            }
            this._promoIndexTemplate = this._promoIndexTemplate.replace('{DATA_FONT_PORTRAIT}', portraitFontURL);
            this._promoIndexTemplate = this._promoIndexTemplate.replace('{DATA_FONT_LANDSCAPE}', landscapeFontURL);
        }
    }
}
