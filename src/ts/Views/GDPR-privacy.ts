import { NativeBridge } from 'Native/NativeBridge';

import GDPRPrivacyTemplate from 'html/GDPR-privacy.html';
import { AbstractPrivacy } from 'Views/AbstractPrivacy';
import { Template } from 'Utilities/Template';

export class GDPRPrivacy extends AbstractPrivacy {

    private _optOutEnabled: boolean;

    constructor(nativeBridge: NativeBridge, isCoppaCompliant: boolean, optOutEnabled: boolean) {
        super(nativeBridge, isCoppaCompliant, 'gdpr-privacy');

        this._template = new Template(GDPRPrivacyTemplate);

        this._optOutEnabled = optOutEnabled;

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onLeftSideClick(event),
                selector: '.left-side-link'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.close-button'
            }
        ];
    }

    public render(): void {
        super.render();

        const elId = this._optOutEnabled ? 'gdpr-refuse-radio' : 'gdpr-agree-radio';

        const activeRadioButton = <HTMLInputElement>this._container.querySelector(`#${elId}`);
        activeRadioButton.checked = true;

        this.setCardState();
    }

    protected onCloseEvent(event: Event): void {
        event.preventDefault();
        const gdprRefuceRadioButton = <HTMLInputElement>this._container.querySelector('#gdpr-refuse-radio');
        this._handlers.forEach(handler => handler.onPrivacyClose(gdprRefuceRadioButton.checked));
    }

    protected onPrivacyEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onPrivacy((<HTMLLinkElement>event.target).href));
    }

    private onLeftSideClick(event: Event): void {
        event.preventDefault();
        const buildInformationActive = this._container.classList.contains('flip');
        this.setCardState(!buildInformationActive);
    }

    private setCardState(isFlipped: boolean = false): void {
        const linkEL = <HTMLDivElement>this._container.querySelector('.left-side-link');
        if (isFlipped) {
            linkEL.innerText = 'Privacy info';
            this._container.classList.add('flip');
        } else {
            linkEL.innerText = 'Build info';
            this._container.classList.remove('flip');
        }
    }
}
