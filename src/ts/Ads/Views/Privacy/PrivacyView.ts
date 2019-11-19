import { View } from 'Core/Views/View';
import { Template } from 'Core/Utilities/Template';
import { PrivacyFrameEventAdapter } from 'Privacy/PrivacyFrameEventAdapter';
import { PrivacyAdapterContainer } from 'Privacy/PrivacyAdapterContainer';
import { ICoreApi } from 'Core/ICore';
import { XHRequest } from 'Core/Utilities/XHRequest';
import { WebViewError } from 'Core/Errors/WebViewError';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { PrivacyConfig } from 'Privacy/PrivacyConfig';
import { IPrivacyViewParameters } from 'Ads/Views/Privacy/Privacy';
import { IPrivacyViewHandler } from 'Ads/Views/Privacy/IPrivacyViewHandler';

import DeviceOrientationScript from 'html/mraid/deviceorientation-support.html';
import PrivacyTemplate from 'html/Privacy-iframe.html';
import PrivacyContainer from 'html/consent/privacy-container.html';

export interface IUserPrivacySettings {
    user: {
        agreedOverAgeLimit: boolean;
        personalizedGamingExperience: boolean;
        personalizedAds: boolean;
        thirdParty: boolean;
    };
    env: { [key: string]: unknown };
}

export class PrivacyView extends View<IPrivacyViewHandler> {
    private readonly _coreApi: ICoreApi;
    private readonly _privacyManager: UserPrivacyManager;

    protected _iFrameAdapterContainer: PrivacyAdapterContainer;

    private _iFrame: HTMLIFrameElement;
    private _domContentLoaded = false;
    private _privacyConfig: PrivacyConfig;
    private _frameEventAdapter: PrivacyFrameEventAdapter;

    constructor(params: IPrivacyViewParameters) {
        super(params.platform, 'consent');
        this._template = new Template(PrivacyTemplate);
        this._privacyManager = params.privacyManager;
        this._iFrameAdapterContainer = new PrivacyAdapterContainer(this);
        this._coreApi = params.core;
    }

    private loadIframe() {
        this._iFrame = <HTMLIFrameElement> this._container.querySelector('#privacy-iframe');
        this._frameEventAdapter = new PrivacyFrameEventAdapter(this._coreApi, this._iFrameAdapterContainer, this._iFrame);
        this._iFrameAdapterContainer.connect(this._frameEventAdapter);
        this.createPrivacyFrame(PrivacyContainer)
            .then((privacyHtml) => {
                this._iFrame.srcdoc = privacyHtml;
            });
    }

    public setPrivacyConfig(privacyConfig: PrivacyConfig): void {
        this._privacyConfig = privacyConfig;
    }

    public render() {
        super.render();
        this.loadIframe();
    }

    private fetchPrivacyHtml(): Promise<string> {
        //TODO: fetch from cache?
        return XHRequest.get(this._privacyConfig.getWebViewUrl());
    }

    public createPrivacyFrame(container: string): Promise<string> {
        return this.fetchPrivacyHtml().then((privacyHtml) => {
            if (privacyHtml) {
                container = container.replace('<script id=\"deviceorientation-support\"></script>', DeviceOrientationScript);
                return container.replace('<body></body>', '<body>' + privacyHtml + '</body>');
            }

            throw new WebViewError('Unable to fetch privacy WebView!');
        });
    }

    public hide() {
        super.hide();
        this._iFrameAdapterContainer.disconnect();
    }

    public onPrivacyReady(): void {
        this._domContentLoaded = true;
        this._handlers.forEach(handler => handler.onPrivacyReady());
    }

    public readyCallback(data: { [key: string]: unknown }): void {
        this._frameEventAdapter.postMessage('readyCallback', data);
    }

    public onPrivacyCompleted(userSettings: IUserPrivacySettings): void {
        this._handlers.forEach(handler => handler.onPrivacyCompleted(userSettings));
    }

    public completeCallback(): void {
        this._frameEventAdapter.postMessage('completeCallback');
    }

    public onPrivacyEvent(name: string, data: { [key: string]: unknown }): void {
        this._handlers.forEach(handler => handler.onPrivacyEvent(name, data));
    }

    public eventCallback(eventName: string): void {
        this._frameEventAdapter.postMessage('eventCallback', eventName);
    }

    public postMessage(event: string, data?: unknown) {
        this._frameEventAdapter.postMessage(event, data);
    }
}
