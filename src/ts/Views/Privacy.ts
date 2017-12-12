import PrivacyTemplate from 'html/Privacy.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';

export interface IPrivacyHandler {
    onPrivacy(url: string): void;
    onPrivacyClose(): void;
}

export interface IBuildInformation {
    userAgent: string;
    platform: string;
    campaignId: string;
    apiLevel: number;
    abGroup: number;
    sdkVersion: number;
    sdkVersionName: string;
    webviewVersion: string | null;
    webviewHash: string | null;
    applicationName: string;
    applicationVersion: string;
    gameId: string;
}

export class Privacy extends View<IPrivacyHandler> {
    constructor(nativeBridge: NativeBridge, isCoppaCompliant: boolean, buildInformation?: IBuildInformation) {
        super(nativeBridge, 'privacy');

        this._template = new Template(PrivacyTemplate);

        this._templateData = {
            'isCoppaCompliant': isCoppaCompliant,
            'buildInformation': buildInformation
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
            },
            {
                event: 'click',
                listener: (event: Event) => this.onBuildInformationEvent(event),
                selector: '.build-information-link'
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

    private onBuildInformationEvent(event: Event): void {
        event.preventDefault();
        this._container.classList.toggle('show-build-information');
    }
}
