import { View } from 'Core/Views/View';
import { IConsentViewParameters } from 'Ads/Views/Consent/Consent';
import { Template } from 'Core/Utilities/Template';
import { PrivacyFrameEventAdapter } from 'Privacy/PrivacyFrameEventAdapter';
import { PrivacyAdapterContainer } from 'Privacy/PrivacyAdapterContainer';
import { ICore, ICoreApi } from 'Core/ICore';
import { XHRequest } from 'Core/Utilities/XHRequest';
import { WebViewError } from 'Core/Errors/WebViewError';
import { IConsentViewHandler } from 'Ads/Views/Consent/IConsentViewHandler';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import DeviceOrientationScript from 'html/mraid/deviceorientation-support.html';
import PrivacyTemplate from 'html/Privacy-iframe.html';
import PrivacyContainer from 'html/consent/privacy-container.html';

export interface IUserPrivacySettings {
    isChild: boolean;
    acceptTracking: boolean;
    personalizedGamingExperience: boolean;
    personalizedAds: boolean;
    thirdParty: boolean;
}

export class PrivacyView extends View<IConsentViewHandler> {
    private readonly _core: ICore;
    private readonly _coreApi: ICoreApi;
    private readonly _privacyManager: UserPrivacyManager;

    protected _iFrameAdapterContainer: PrivacyAdapterContainer;

    private _iFrame: HTMLIFrameElement;
    private _domContentLoaded = false;
    private _privacyWebViewUrl: string;

    constructor(params: IConsentViewParameters) {
        super(params.platform, 'consent');
        this._template = new Template(PrivacyTemplate);
        this._privacyManager = params.privacyManager;
        this._iFrameAdapterContainer = new PrivacyAdapterContainer(this);
        this._coreApi = params.core;
    }

    private loadIframe() {
        this._iFrame = <HTMLIFrameElement> this._container.querySelector('#privacy-iframe');
        this._iFrameAdapterContainer.connect(new PrivacyFrameEventAdapter(this._coreApi, this._iFrameAdapterContainer, this._iFrame));

        this._privacyManager.getPrivacyConfig().then((privacyConfig) => {
            this._privacyWebViewUrl = privacyConfig.getWebViewUrl();
            this.createPrivacyFrame(
                PrivacyContainer.replace('{{ PRIVACY_ENVIRONMENT }}', JSON.stringify(privacyConfig.getEnv().getJson()))
                .replace('{{ PRIVACY_USER_SETTINGS }}', JSON.stringify(privacyConfig.getUserSettings().getJson())))
                .then((privacyHtml) => {
                    this._iFrame.srcdoc = privacyHtml;
                });
        }).catch((e) => {
            this._coreApi.Sdk.logError('PRIVACY: failed to create privacy iFrame: ' + e.message);
        });
    }

    public render() {
        super.render();
        this.loadIframe();
    }

    private fetchPrivacyHtml(): Promise<string> {
        //TODO: fetch from cache?
        return XHRequest.get(this._privacyWebViewUrl);
    }

    public createPrivacyFrame(container: string): Promise<string> {
        return this.fetchPrivacyHtml().then((privacyHtml) => {
            if (privacyHtml) {
                container = container.replace('<script id=\"deviceorientation-support\"></script>', DeviceOrientationScript);
                return container.replace('<body></body>', '<body>' + privacyHtml + '</body>');
            }

            throw new WebViewError('PRIVACY: Unable to fetch privacy WebView');
        });
    }

    public hide() {
        super.hide();
        this._iFrameAdapterContainer.disconnect();
    }

    public onPrivacyReady(): void {
        this._domContentLoaded = true;
        this._coreApi.Sdk.logDebug('PRIVACY: Privacy WebView is ready!');
    }

    public onPrivacyCompleted(userSettings: IUserPrivacySettings): void {
        this._coreApi.Sdk.logDebug('PRIVACY: Got permissions: ' + JSON.stringify(userSettings));
        this._handlers.forEach(handler => handler.onClose());
    }

    public onPrivacyEvent(name: string, data: { [key: string]: unknown }): void {
        this._coreApi.Sdk.logDebug('Got event: ' + name + ' with data: ' + JSON.stringify(data));
    }
}
