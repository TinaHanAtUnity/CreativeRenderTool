import { Privacy } from 'Views/Privacy';
import { NativeBridge } from 'Native/NativeBridge';

import Template from 'html/GDPR-privacy.html';

export class GDPRPrivacy extends Privacy {
    constructor(nativeBridge: NativeBridge, isCoppaCompliant: boolean) {
        super(nativeBridge, isCoppaCompliant, Template, 'gdpr-privacy');
    }

    public render(): void {
        super.render();
        // TODO: Get this data from backend
        const isGDPRAgree = true;
        const elId = isGDPRAgree ? 'gdpr-agree-radio' : 'gdpr-refuse-radio';

        const activeRadioButton = <HTMLInputElement>this._container.querySelector(`#${elId}`);
        activeRadioButton.checked = true;
    }
}
