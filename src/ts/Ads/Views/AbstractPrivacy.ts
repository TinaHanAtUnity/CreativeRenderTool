import { Campaign } from 'Ads/Models/Campaign';
import { Platform } from 'Core/Constants/Platform';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { ITemplateData, View } from 'Core/Views/View';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';

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

    private static buildInformation: IBuildInformation;

    constructor(platform: Platform, isCoppaCompliant: boolean, isGDPREnabled: boolean, id: string) {
        super(platform, id);
        this._templateData = {
            'isCoppaCompliant': isCoppaCompliant,
            'isGDPREnabled': isGDPREnabled,
            'buildInformation': AbstractPrivacy.buildInformation
        };
    }

    public static createBuildInformation(platform: Platform, clientInfo: ClientInfo, deviceInfo: AndroidDeviceInfo, campaign: Campaign, configuration: CoreConfiguration) {
        const date = new Date();
        AbstractPrivacy.buildInformation = {
            userAgent: window.navigator.userAgent,
            platform: platform === Platform.IOS ? 'iOS' : 'Android',
            campaign: campaign.getId(),
            apiLevel: deviceInfo.getApiLevel(),
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

    protected abstract onCloseEvent(event: Event): void;

    protected abstract onPrivacyEvent(event: Event): void;
}
