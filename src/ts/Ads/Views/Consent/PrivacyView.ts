import { View } from 'Core/Views/View';
import { ConsentPage, IConsentViewParameters } from 'Ads/Views/Consent/Consent';
import { Template } from 'Core/Utilities/Template';
import { PrivacyFrameEventAdapter } from 'Privacy/PrivacyFrameEventAdapter';
import { PrivacyAdapterContainer } from 'Privacy/PrivacyAdapterContainer';
import { ICore, ICoreApi } from 'Core/ICore';
import { XHRequest } from 'Core/Utilities/XHRequest';
import { WebViewError } from 'Core/Errors/WebViewError';
import { IConsentViewHandler } from 'Ads/Views/Consent/IConsentViewHandler';
import {
    IAllPermissions,
    IGranularPermissions, IPermissions,
    IUnityConsentPermissions,
    PrivacyMethod
} from 'Privacy/Privacy';
import { AgeGateChoice, GDPREventAction, GDPREventSource, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
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
    private readonly _privacyWebViewUrl = 'http://10.35.34.174/';
    private readonly _privacyManager: UserPrivacyManager;

    protected _iFrameAdapterContainer: PrivacyAdapterContainer;

    private _iFrame: HTMLIFrameElement;
    private _domContentLoaded = false;

    constructor(params: IConsentViewParameters) {
        super(params.platform, 'consent');
        this._template = new Template(PrivacyTemplate);
        this._coreApi = params.coreApi;
        this._core = params.core;
        this._privacyManager = params.privacyManager;
        this._iFrameAdapterContainer = new PrivacyAdapterContainer(this);
    }

    private loadIframe() {
        this._iFrame = <HTMLIFrameElement> this._container.querySelector('#privacy-iframe');
        this._iFrameAdapterContainer.connect(new PrivacyFrameEventAdapter(this._coreApi, this._iFrameAdapterContainer, this._iFrame));

        this._privacyManager.getPrivacyConfig().then((privacyConfig) => {
            this.createPrivacyFrame(PrivacyContainer.replace('{{ PRIVACY_ENVIRONMENT }}', JSON.stringify(privacyConfig.getEnv().getJson())))
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

    public onPrivacyCompleted(userSettings: IUserPrivacySettings) {
        this._coreApi.Sdk.logDebug('PRIVACY: Got permissions: ' + JSON.stringify(userSettings));
        let permissions: IUnityConsentPermissions;
        const source: GDPREventSource = GDPREventSource.USER;

        if (userSettings.isChild) {
            this._handlers.forEach(handler => handler.onAgeGateDisagree());
            this._handlers.forEach(handler => handler.onClose());
            return;
        } else {
            this._handlers.forEach(handler => handler.onAgeGateAgree());
        }

        if (userSettings.acceptTracking) {
            permissions = <IAllPermissions> {all: true};
        } else {
            permissions = <IGranularPermissions> { ads: userSettings.personalizedAds,
                gameExp: userSettings.personalizedGamingExperience,
                external: userSettings.thirdParty };
        }

        this._handlers.forEach(handler => handler.onConsent(permissions, source));
        this._handlers.forEach(handler => handler.onClose());
    }

    public onAgeGateAgree(): void {
        this._privacyManager.setUsersAgeGateChoice(AgeGateChoice.YES);
    }

    public onAgeGateDisagree(): void {
        this._privacyManager.setUsersAgeGateChoice(AgeGateChoice.NO);

        if (this._core.Ads.PrivacySDK.getGamePrivacy().getMethod() === PrivacyMethod.UNITY_CONSENT) {
            const permissions: IPermissions = {
                gameExp: false,
                ads: false,
                external: false
            };
            this._privacyManager.updateUserPrivacy(permissions, GDPREventSource.USER, ConsentPage.AGE_GATE);
        } else {
            this._core.Ads.PrivacySDK.setOptOutRecorded(true);
            this._core.Ads.PrivacySDK.setOptOutEnabled(true);

            const gamePrivacy = this._core.Ads.PrivacySDK.getGamePrivacy();
            const userPrivacy = this._core.Ads.PrivacySDK.getUserPrivacy();

            if (userPrivacy) {
                userPrivacy.update({
                    method: gamePrivacy.getMethod(),
                    version: 0,
                    permissions: {
                        all: false,
                        ads: false,
                        external: false,
                        gameExp: false
                    }
                });
            }

            this._privacyManager.sendGDPREvent(GDPREventAction.OPTOUT, GDPREventSource.USER);
        }
    }
}
