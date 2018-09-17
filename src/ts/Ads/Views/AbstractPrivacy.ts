import { Campaign } from 'Ads/Models/Campaign';
import { Platform } from 'Core/Constants/Platform';

import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ITemplateData, View } from 'Core/Views/View';

export interface IPrivacyHandler {
    onPrivacy(url: string): void;
    onPrivacyClose(): void;
    onGDPROptOut(optOutEnabled: boolean): void;
}

export interface IBuildInformation extends ITemplateData {
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
    creativeId: string | undefined;
    seatId: number | undefined;
    timestamp: string;
}

export abstract class AbstractPrivacy extends View<IPrivacyHandler> {

    public static createBuildInformation(clientInfo: ClientInfo, campaign: Campaign, nativeBridge: NativeBridge, configuration: CoreConfiguration) {
        const date = new Date();
        AbstractPrivacy.buildInformation = {
            userAgent: window.navigator.userAgent,
            platform: clientInfo.getPlatform() === Platform.IOS ? 'iOS' : 'Android',
            campaign: campaign.getId(),
            apiLevel: nativeBridge.getApiLevel(),
            group: configuration.getAbGroup().toNumber(),
            sdk: clientInfo.getSdkVersionName(),
            webview: clientInfo.getWebviewVersion(),
            webviewHash: clientInfo.getWebviewHash(),
            app: clientInfo.getApplicationName(),
            appVersion: clientInfo.getApplicationVersion(),
            creativeId: campaign.getCreativeId(),
            seatId: campaign.getSeatId(),
            timestamp: date.toUTCString()
        };
    }

    private static buildInformation: IBuildInformation;

    constructor(nativeBridge: NativeBridge, isCoppaCompliant: boolean, id: string) {
        super(nativeBridge, id);

        this._templateData = {
            'isCoppaCompliant': isCoppaCompliant,
            'buildInformation': AbstractPrivacy.buildInformation
        };
    }

    protected abstract onCloseEvent(event: Event): void;

    protected abstract onPrivacyEvent(event: Event): void;
}
