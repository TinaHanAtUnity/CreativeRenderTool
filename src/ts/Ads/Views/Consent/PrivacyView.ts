import {View} from 'Core/Views/View';
import {ConsentPage, IConsentViewParameters} from 'Ads/Views/Consent/Consent';
import {Template} from 'Core/Utilities/Template';
import {PrivacyFrameEventAdapter} from 'Privacy/PrivacyFrameEventAdapter';
import {Observable0} from 'Core/Utilities/Observable';
import {PrivacyAdapterContainer} from 'Privacy/PrivacyAdapterContainer';
import {ICore, ICoreApi} from 'Core/ICore';
import {XHRequest} from 'Core/Utilities/XHRequest';
import {WebViewError} from 'Core/Errors/WebViewError';
import {IConsentViewHandler} from 'Ads/Views/Consent/IConsentViewHandler';
import {
    IAllPermissions,
    IGranularPermissions, IPermissions,
    IProfilingPermissions,
    IUnityConsentPermissions,
    PrivacyMethod
} from 'Privacy/Privacy';
import {AgeGateChoice, GDPREventAction, GDPREventSource, UserPrivacyManager} from 'Ads/Managers/UserPrivacyManager';
import {Platform} from 'Core/Constants/Platform';

import DeviceOrientationScript from 'html/mraid/deviceorientation-support.html';
import PrivacyTemplate from 'html/Privacy-iframe.html';
import PrivacyContainer from 'html/consent/privacy-container.html';

export interface IPrivacyPermissions {
    isChild: boolean;
    acceptTracking: boolean;
    personalizedGamingExperience: boolean;
    personalizedAds: boolean;
    thirdParty: boolean;
}

export class PrivacyView extends View<IConsentViewHandler> {
    private readonly onLoaded = new Observable0();
    private readonly _core: ICore;
    private readonly _coreApi: ICoreApi;
    private readonly privacyWebviewUrl = 'http://10.35.33.171:4000/build/index.html';
    private readonly _privacyManager: UserPrivacyManager;

    protected _iframeAdapterContainer: PrivacyAdapterContainer;

    private _iframe: HTMLIFrameElement;
    private _domContentLoaded = false;

    constructor(params: IConsentViewParameters) {
        super(params.platform, 'consent');
        this._template = new Template(PrivacyTemplate);
        this._coreApi = params.coreApi;
        this._core = params.core;
        this._privacyManager = params.privacyManager;
        this._iframeAdapterContainer = new PrivacyAdapterContainer(this);
    }

    private loadIframe() {
        this._iframe = <HTMLIFrameElement> this._container.querySelector('#privacy-iframe');
        this._iframeAdapterContainer.connect(new PrivacyFrameEventAdapter(this._coreApi, this._iframeAdapterContainer, this._iframe));

        this._privacyManager.getPrivacyConfig().then((privacyConfig) => {
            this.createPrivacyFrame(PrivacyContainer.replace('{{ PRIVACY_ENVIRONMENT }}', privacyConfig.getEnv().getJson().toString()))
                .then((privacyHtml) => {
                    this._iframe.srcdoc = privacyHtml;
                });
        }).catch((e) => {
            this._coreApi.Sdk.logError('## PRIVACY: failed to create privacy iframe: ' + e.message);
        });
    }

    public render() {
        super.render();
        this.loadIframe();
    }

    private fetchPrivacyHtml(): Promise<string> {
        //TODO: fetch from cache?
        return XHRequest.get(this.privacyWebviewUrl);
    }

    public createPrivacyFrame(container: string): Promise<string> {
        return this.fetchPrivacyHtml().then((privacyHtml) => {
            if (privacyHtml) {
                container = container.replace('<script id=\"deviceorientation-support\"></script>', DeviceOrientationScript);
                return container.replace('<body></body>', '<body>' + privacyHtml + '</body>');
            }

            throw new WebViewError('##PRIVACY: Unable to fetch privacy webview');
        });
    }

    public hide() {
        super.hide();
        this._iframeAdapterContainer.disconnect();
    }

    public onPrivacyLoaded(): void {
        this._domContentLoaded = true;
        this._coreApi.Sdk.logDebug('##PRIVACY: Unity Privacy has loaded!');
    }

    public onPrivacyCollected(userSettings: IPrivacyPermissions) {
        console.log('##Privacy: got permissions: ' + JSON.stringify(userSettings));
        let permissions: IUnityConsentPermissions;
        let source: GDPREventSource = GDPREventSource.USER;

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
