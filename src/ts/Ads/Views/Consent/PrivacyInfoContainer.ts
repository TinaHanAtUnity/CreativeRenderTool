import { View } from 'Core/Views/View';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import PrivacyInfoTemplate from 'html/consent/privacy-info.html';
import { Template } from 'Core/Utilities/Template';

interface IPrivacyInfoContainerHandler {
}

export class PrivacyInfoContainer extends View<IPrivacyInfoContainerHandler> {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'privacy-info-container');

        this._template = new Template(PrivacyInfoTemplate);

        this._bindings = [];
    }

}
