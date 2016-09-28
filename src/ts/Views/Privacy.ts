/// <amd-dependency path='text!html/Privacy.html' name='PrivacyTemplate' />
declare var PrivacyTemplate: string;

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { Observable0, Observable1 } from 'Utilities/Observable';

export class Privacy extends View {

    public onPrivacy: Observable1<string> = new Observable1();
    public onClose: Observable0 = new Observable0();

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
        this.onPrivacy.trigger((<HTMLLinkElement>event.target).href);
    }

    private onOkEvent(event: Event): void {
        event.preventDefault();
        this.onClose.trigger();
    }

}
