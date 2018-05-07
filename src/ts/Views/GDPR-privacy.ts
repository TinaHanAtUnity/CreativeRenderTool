import { Privacy } from 'Views/Privacy';
import { NativeBridge } from 'Native/NativeBridge';

import Template from 'html/GDPR-privacy.html';

export class GDPRPrivacy extends Privacy {
    constructor(nativeBridge: NativeBridge, isCoppaCompliant: boolean) {
        super(nativeBridge, isCoppaCompliant, Template, 'gdpr-privacy');

        this._bindings.push({
                event: 'click',
                listener: (event: Event) => this.onLeftSideClick(event),
                selector: '.left-side-link'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onOkEvent(event),
                selector: '.close-button'
            });
    }

    public render(): void {
        super.render();
        // TODO: Get this data from backend
        const isGDPRAgree = true;
        const elId = isGDPRAgree ? 'gdpr-agree-radio' : 'gdpr-refuse-radio';

        const activeRadioButton = <HTMLInputElement>this._container.querySelector(`#${elId}`);
        activeRadioButton.checked = true;

        this.setCardState();
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
