import PrivacyTemplate from 'html/Privacy.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';

import { ClientInfo } from 'Models/ClientInfo';
import { Campaign } from "Models/Campaign";
import { Platform } from "Constants/Platform";

export interface IPrivacyHandler {
    onPrivacy(url: string): void;
    onPrivacyClose(): void;
}

export interface IBuildInformation {
    UA: string;
    Platform: string;
    Campaign: string;
    APILevel: number;
    Group: number;
    SDK: string;
    WebView: string | null;
    WebviewHash: string | null;
    App: string;
    AppVersion: string;
    Game: string;
}

export class Privacy extends View<IPrivacyHandler> {
    public static createBuildInformation(clientInfo: ClientInfo, campaign: Campaign, nativeBridge: NativeBridge) {
        Privacy.buildInformation = {
            UA: window.navigator.userAgent,
            Platform: clientInfo.getPlatform() === Platform.IOS ? 'iOS' : 'Android',
            Campaign: campaign.getId(),
            APILevel: nativeBridge.getApiLevel(),
            Group: campaign.getAbGroup(),
            SDK: clientInfo.getSdkVersionName(),
            WebView: clientInfo.getWebviewVersion(),
            WebviewHash: clientInfo.getWebviewHash(),
            App: clientInfo.getApplicationName(),
            AppVersion: clientInfo.getApplicationVersion(),
            Game: clientInfo.getGameId()
        };
    }

    private static buildInformation: IBuildInformation;

    constructor(nativeBridge: NativeBridge, isCoppaCompliant: boolean) {
        super(nativeBridge, 'privacy');

        this._template = new Template(PrivacyTemplate);

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
