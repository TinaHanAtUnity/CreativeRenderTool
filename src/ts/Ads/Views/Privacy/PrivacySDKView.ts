import { View } from 'Core/Views/View';
import { Template } from 'Core/Utilities/Template';
import { PrivacyFrameEventAdapter } from 'Privacy/PrivacyFrameEventAdapter';
import { PrivacyAdapterContainer } from 'Privacy/PrivacyAdapterContainer';
import { ICoreApi } from 'Core/ICore';
import { WebViewError } from 'Core/Errors/WebViewError';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { PrivacyConfig } from 'Privacy/PrivacyConfig';
import { IPrivacyFetchUrlParams, IUserPrivacySettings, IPrivacySettings } from 'Privacy/IPrivacySettings';
import { IPrivacySDKViewHandler } from 'Ads/Views/Privacy/IPrivacySDKViewHandler';
import { ConsentPage } from 'Ads/Views/Privacy/Privacy';
import { Platform } from 'Core/Constants/Platform';

import DeviceOrientationScript from 'html/mraid/deviceorientation-support.html';
import PrivacyTemplate from 'html/Privacy-iframe.html';
import PrivacyContainer from 'html/consent/privacy-container.html';

export interface IPrivacySDKViewParameters {
    platform: Platform;
    privacyManager: UserPrivacyManager;
    landingPage: ConsentPage;
    language: string;
    apiLevel?: number;
    osVersion?: string;
    consentABTest: boolean;
    ageGateLimit: number;
    core: ICoreApi;
}

export class PrivacySDKView extends View<IPrivacySDKViewHandler> {
    private readonly _coreApi: ICoreApi;
    private readonly _privacyManager: UserPrivacyManager;

    protected _iFrameAdapterContainer: PrivacyAdapterContainer;

    private _iFrame: HTMLIFrameElement;
    private _domContentLoaded = false;
    private _privacyConfig: PrivacyConfig;
    private _frameEventAdapter: PrivacyFrameEventAdapter;

    constructor(params: IPrivacySDKViewParameters) {
        super(params.platform, 'privacy-sdk-container');
        this._template = new Template(PrivacyTemplate);
        this._privacyManager = params.privacyManager;
        this._coreApi = params.core;
    }

    private loadIframe() {
        this._iFrame = <HTMLIFrameElement> this._container.querySelector('#privacy-iframe');
        this._iFrameAdapterContainer = new PrivacyAdapterContainer(this);
        this._frameEventAdapter = new PrivacyFrameEventAdapter(this._coreApi, this._iFrameAdapterContainer, this._iFrame);

        try {
            this._iFrameAdapterContainer.connect(this._frameEventAdapter);
        } catch (e) {
            this._handlers.forEach(handler => handler.onPrivacyViewError(e.message));
            return;
        }

        this._iFrame.onerror = (event) => {
            this._handlers.forEach(handler => handler.onPrivacyViewError(event));
            return true;
        };

        this._iFrame.srcdoc = this.loadPrivacyHtml(PrivacyContainer);
    }

    public setPrivacyConfig(privacyConfig: PrivacyConfig): void {
        this._privacyConfig = privacyConfig;
    }

    public render() {
        super.render();
        this.loadIframe();
    }

    public loadPrivacyHtml(container: string): string {
        let privacyHtml = this._privacyConfig.getHtml();

        if (privacyHtml) {
            container = container.replace('<script id=\"deviceorientation-support\"></script>', DeviceOrientationScript);
            privacyHtml = privacyHtml.replace(/\$/g, '$$$');
            return container.replace('<body></body>', '<body>' + privacyHtml + '</body>');
        }

        throw new WebViewError('Unable to fetch privacy WebView!');
    }

    public hide() {
        super.hide();

        if (this._iFrameAdapterContainer) {
            this._iFrameAdapterContainer.disconnect();
        }
    }

    public onPrivacyReady(): void {
        if (this._domContentLoaded) {
            return;
        }

        this._iFrame.onerror = () => {
            return;
        };

        this._domContentLoaded = true;
        this._handlers.forEach(handler => handler.onPrivacyReady());
    }

    public readyCallback(flow: { [key: string]: unknown }, data: { env: { [key: string]: unknown }; user: IUserPrivacySettings }): void {
        this._frameEventAdapter.postMessage('readyCallback', {
            ... data,
            flow
        });
    }

    public onPrivacyCompleted(privacySettings: IPrivacySettings): void {
        this._handlers.forEach(handler => handler.onPrivacyCompleted(privacySettings));
    }

    public completeCallback(): void {
        this._frameEventAdapter.postMessage('completeCallback');
    }

    public onPrivacyOpenUrl(url: string): void {
        this._handlers.forEach(handler => handler.onPrivacyOpenUrl(url));
    }

    public openUrlCallback(url: string): void {
        this._frameEventAdapter.postMessage('openUrlCallback', url);
    }

    public onPrivacyMetric(data: string): void {
        this._handlers.forEach(handler => handler.onPrivacyMetric(data));
    }

    public metricCallback(): void {
        this._frameEventAdapter.postMessage('metricCallback');
    }

    public onPrivacyFetchUrl(data: IPrivacyFetchUrlParams): void {
        this._handlers.forEach(handler => handler.onPrivacyFetchUrl(data));
    }

    public fetchUrlCallback(response: string, property: string): void {
        this._frameEventAdapter.postMessage('fetchUrlCallback', { response, property });
    }

    public postMessage(event: string, data?: unknown) {
        this._frameEventAdapter.postMessage(event, data);
    }
}
