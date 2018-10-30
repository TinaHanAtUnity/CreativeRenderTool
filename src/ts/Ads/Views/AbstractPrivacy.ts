import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { View } from 'Core/Views/View';

export interface IPrivacyHandler {
    onPrivacy(url: string): void;
    onPrivacyClose(): void;
    onGDPROptOut(optOutEnabled: boolean): void;
}

export abstract class AbstractPrivacy extends View<IPrivacyHandler> {

    constructor(nativeBridge: NativeBridge, isCoppaCompliant: boolean, isGDPREnabled: boolean, id: string) {
        super(nativeBridge, id);
        this._templateData = {
            'isCoppaCompliant': isCoppaCompliant,
            'isGDPREnabled': isGDPREnabled
        };
    }

    protected abstract onCloseEvent(event: Event): void;

    protected abstract onPrivacyEvent(event: Event): void;
}
