import PrivacyTemplate from 'html/Privacy.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';

import { ClientInfo } from 'Models/ClientInfo';
import { Campaign } from 'Models/Campaign';
import { Platform } from 'Constants/Platform';

export interface IPrivacyHandler {
    onPrivacy(url: string): void;

    onPrivacyClose(): void;
}

export interface IBuildInformation {
    userAgent: string;
    platform: string;
    campaign: string;
    apiLevel: number;
    group: number;
    sdk: string;
    webview: string | null;
    webviewHash: string | null;
    app: string;
    appVersion: string;
}

export class Privacy extends View<IPrivacyHandler> {
    public static createBuildInformation(clientInfo: ClientInfo, campaign: Campaign, nativeBridge: NativeBridge) {
        Privacy.buildInformation = {
            userAgent: window.navigator.userAgent,
            platform: clientInfo.getPlatform() === Platform.IOS ? 'iOS' : 'Android',
            campaign: campaign.getId(),
            apiLevel: nativeBridge.getApiLevel(),
            group: campaign.getAbGroup(),
            sdk: clientInfo.getSdkVersionName(),
            webview: clientInfo.getWebviewVersion(),
            webviewHash: clientInfo.getWebviewHash(),
            app: clientInfo.getApplicationName(),
            appVersion: clientInfo.getApplicationVersion()
        };
    }

    private static buildInformation: IBuildInformation;

    constructor(nativeBridge: NativeBridge, isCoppaCompliant: boolean, altTemplate?: string, altId?: string) {
        super(nativeBridge, altId || 'privacy');

        if (typeof altTemplate === 'string') {
            this._template = new Template(altTemplate);
        } else {
            this._template = new Template(PrivacyTemplate);
        }

        this._templateData = {
            'isCoppaCompliant': isCoppaCompliant,
            'buildInformation': Privacy.buildInformation
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

    protected onOkEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onPrivacyClose());
    }

    private onPrivacyEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onPrivacy((<HTMLLinkElement>event.target).href));
    }

    private onBuildInformationEvent(event: Event): void {
        event.preventDefault();
        this._container.classList.toggle('show-build-information');
    }
}
