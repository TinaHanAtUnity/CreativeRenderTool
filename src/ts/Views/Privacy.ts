import PrivacyTemplate from 'html/Privacy.html';

import { NativeBridge } from 'Native/NativeBridge';
import { Template } from 'Utilities/Template';
import { AbstractPrivacy } from 'Views/AbstractPrivacy';

export class Privacy extends AbstractPrivacy {

    constructor(nativeBridge: NativeBridge, isCoppaCompliant: boolean) {
        super(nativeBridge, isCoppaCompliant, 'privacy');

        this._template = new Template(PrivacyTemplate);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.ok-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: 'a'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onBuildInformationEvent(event),
                selector: '.build-information-link'
            }
        ];
    }

    protected onCloseEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onPrivacyClose(undefined));
    }

    protected onPrivacyEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onPrivacy((<HTMLLinkElement>event.target).href));
    }

    private onBuildInformationEvent(event: Event): void {
        event.preventDefault();
        this._container.classList.toggle('show-build-information');
    }
}
