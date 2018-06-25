import { View } from 'Views/View';
import { NativeBridge } from 'Native/NativeBridge';
import { Placement } from 'Models/Placement';

import CloserTemplate from 'html/closer.html';
import { Template } from 'Utilities/Template';
import { GDPRPrivacy } from 'Views/GDPRPrivacy';
import { Observable0 } from 'Utilities/Observable';
import { IPrivacyHandler, AbstractPrivacy } from 'Views/AbstractPrivacy';

export interface ICloseHandler {
    onClose(skipped: boolean): void;
    onGDPRPopupSkipped(): void;
}

export class Closer extends View<ICloseHandler> implements IPrivacyHandler {

    public readonly onPrivacyOpened: Observable0 = new Observable0();
    public readonly onPrivacyClosed: Observable0 = new Observable0();

    private _placement: Placement;
    private _allowClose: boolean;
    private _canReward = false;
    private _privacy: AbstractPrivacy;

    private _progressElement: HTMLElement;
    private _GDPRPopupElement: HTMLElement;
    private _privacyButtonElement: HTMLElement;
    private _showGDPRBanner: boolean;
    private _gdprPopupClicked: boolean = false;

    constructor(nativeBridge: NativeBridge, placement: Placement, privacy: AbstractPrivacy, showGDPRBanner: boolean) {
        super(nativeBridge, 'closer');
        this._template = new Template(CloserTemplate);
        this._placement = placement;
        this._privacy = privacy;
        this._showGDPRBanner = showGDPRBanner;

        this._bindings = [
            {
                event: 'click',
                selector: '.close',
                listener: () => this.onCloseClick()
            },
            {
                event: 'click',
                listener: (event: Event) => this.onGDPRPopupEvent(event),
                selector: '.gdpr-link'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: '.icon-gdpr'
            },
        ];

        this._privacy.render();
        this._privacy.hide();
        document.body.appendChild(this._privacy.container());
        this._privacy.addEventHandler(this);
    }

    public onPrivacy(url: string): void {
        // do nothing
    }

    public onPrivacyClose(): void {
        if (this._privacy) {
            this._privacy.hide();
        }
        this.onPrivacyClosed.trigger();
    }

    public hide(): void {
        super.hide();

        if (this._privacy) {
            document.body.removeChild(this._privacy.container());
        }

        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._handlers.forEach(handler => handler.onGDPRPopupSkipped());
        }

        this.onPrivacyClosed.unsubscribe();
        this.onPrivacyOpened.unsubscribe();
    }

    public show() {
        super.show();
    }

    public render() {
        super.render();
        this._GDPRPopupElement = <HTMLElement>this._container.querySelector('.gdpr-pop-up');
        this._privacyButtonElement = <HTMLElement>this._container.querySelector('.privacy-button');
    }

    public onGDPROptOut(optOutEnabled: boolean): void {
        // do nothing
    }

    public update(progress: number, total: number) {
        if (progress >= (total * 0.75)) {
            this._canReward = true;
        }

        total = this._placement.allowSkip() ? this._placement.allowSkipInSeconds() : total;
        const secondsLeft = this.clampLower(Math.floor(total - progress), 0);
        let progressFraction = progress / total;
        if (secondsLeft <= 0) {
            this._allowClose = true;
        }
        progressFraction = this.clampHigher(progressFraction, 1);
        this.updateCircle(progressFraction);
    }

    public choosePrivacyShown(): void {
        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._GDPRPopupElement.style.visibility = 'visible';
            this._privacyButtonElement.style.pointerEvents = '1';
            this._privacyButtonElement.style.visibility = 'hidden';
        } else {
            this._privacyButtonElement.style.visibility = 'visible';
            this._GDPRPopupElement.style.pointerEvents = '1';
            this._GDPRPopupElement.style.visibility = 'hidden';
        }
    }

    private onGDPRPopupEvent(event: Event) {
        event.preventDefault();

        if (!this._gdprPopupClicked) {
            this._gdprPopupClicked = true;
            this.choosePrivacyShown();
        }
        this.onPrivacyOpened.trigger();
        this._privacy.show();
    }

    private onPrivacyEvent(event: Event) {
        event.preventDefault();
        this.onPrivacyOpened.trigger();
        this._privacy.show();
    }

    private updateCircle(fraction: number) {
        const wrapperElement = <HTMLElement>this._container.querySelector('.progress-wrapper');
        const leftCircleElement = <HTMLElement>this._container.querySelector('.circle-left');
        const rightCircleElement = <HTMLElement>this._container.querySelector('.circle-right');

        const degrees = fraction * 360;
        leftCircleElement.style.webkitTransform = 'rotate(' + degrees + 'deg)';

        if(fraction >= 0.5) {
            wrapperElement.style.webkitAnimationName = 'close-progress-wrapper';
            rightCircleElement.style.webkitAnimationName = 'right-spin';
        }
    }

    private onCloseClick() {
        if (this._allowClose) {
            this._handlers.forEach((h) => h.onClose(!this._canReward));
        }
    }

    private clampLower(number: number, floor: number): number {
        return number < floor ? floor : number;
    }

    private clampHigher(number: number, ceil: number): number {
        return number > ceil ? ceil : number;
    }
}
