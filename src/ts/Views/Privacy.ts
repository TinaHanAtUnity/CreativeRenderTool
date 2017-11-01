import PrivacyTemplate from 'html/Privacy.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';

export interface IPrivacyHandler {
    onPrivacy(url: string): void;
    onPrivacyClose(): void;
}

export class Privacy extends View<IPrivacyHandler> {
    constructor(nativeBridge: NativeBridge, isCoppaCompliant: boolean) {
        super(nativeBridge, 'privacy');

        this._template = new Template(PrivacyTemplate);

        this._templateData = {
            'isCoppaCompliant': isCoppaCompliant
        };

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onOkEvent(event),
                selector: '.ok-button'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: 'a'
            }
        ];
    }

    private onPrivacyEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onPrivacy((<HTMLLinkElement>event.target).href));
    }

    private onOkEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onPrivacyClose());
    }
}
