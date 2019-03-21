import { Placement } from 'Ads/Models/Placement';
import { AbstractPrivacy, IPrivacyHandlerView } from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { Localization } from 'Core/Utilities/Localization';
import { Observable0, Observable1 } from 'Core/Utilities/Observable';
import { Template } from 'Core/Utilities/Template';
import { View, TemplateDataType, ITemplateData } from 'Core/Views/View';
import PromoTpl from 'html/Promo.html';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import PromoIndexTpl from 'html/promo/container.html';
import { PromoOrientationAsset } from 'Promo/Models/PromoOrientationAsset';

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
        if (this._iframe) {
            const tpl = new Template(this._promoIndexTemplate, this._localization);
            this._iframe.setAttribute('srcdoc', tpl.render(this._templateData ? this._templateData : {}));
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

    private setupTemplateData(campaign: PromoCampaign, placement: Placement) {
        const portraitPrefix = 'portrait';
        const landscapePrefix = 'landscape';
        const portraitCSSKey = '{DATA_FONT_PORTRAIT}';
        const landscapeCSSKey = '{DATA_FONT_LANDSCAPE}';
        if(campaign) {
            this._templateData = {
                'localizedPrice': PurchasingUtilities.getProductPrice(campaign.getIapProductId()),
                'rewardedPromoTimerDuration': !placement.allowSkip() ? 5 : 0
            };
            const portraitAssets = campaign.getPortraitAssets();
            const landscapeAssets = campaign.getLandscapeAssets();
            if (portraitAssets) {
                this.setupOrientationData(portraitPrefix, portraitCSSKey, portraitAssets);
            } else if (landscapeAssets) {
                this.setupOrientationData(portraitPrefix, portraitCSSKey, landscapeAssets);
            }
            if (landscapeAssets) {
                this.setupOrientationData(landscapePrefix, landscapeCSSKey, landscapeAssets);
            } else if (portraitAssets) {
                this.setupOrientationData(landscapePrefix, landscapeCSSKey, portraitAssets);
            }
        }
    }

    private setupOrientationData(prefix: string, fontCSSKey: string, orientationAsset: PromoOrientationAsset) {
        const map: { [key: string]: TemplateDataType | ITemplateData } = {};
        let fontURL = '';
        const buttonCoordinates = orientationAsset.getButtonAsset().getCoordinates();
        if (buttonCoordinates) {
            map.ButtonCoordinatesTop = buttonCoordinates.getTop();
            map.ButtonCoordinatesLeft = buttonCoordinates.getLeft();
        }
        const buttonSize = orientationAsset.getButtonAsset().getSize();
        map.ButtonSizeWidth = buttonSize.getWidth();
        map.ButtonSizeHeight = buttonSize.getHeight();
        const font = orientationAsset.getButtonAsset().getFont();
        if (font) {
            map.PriceTextFontFamily = font.getFamily();
            map.PriceTextFontColor = font.getColor();
            map.PriceTextFontSize = font.getSize();
            fontURL = font.getUrl();
        }
        const backgroundSize = orientationAsset.getBackgroundAsset().getSize();
        map.BackgroundImageWidth = backgroundSize.getWidth();
        map.BackgroundImageHeight = backgroundSize.getHeight();
        map.BackgroundImage = orientationAsset.getBackgroundAsset().getImage().getUrl();
        map.ButtonImage = orientationAsset.getButtonAsset().getImage().getUrl();
        for (const key in map) {
            if (map.hasOwnProperty(key)) {
                this._templateData[prefix + key] = map[key];
            }
        }
        this._promoIndexTemplate = this._promoIndexTemplate.replace(fontCSSKey, fontURL);
    }
}
