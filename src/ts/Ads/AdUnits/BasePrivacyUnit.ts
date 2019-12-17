import { View } from 'Core/Views/View';
import { IPrivacyViewHandler } from 'Ads/Views/Privacy/IPrivacyViewHandler';
import { IPrivacySDKViewHandler } from 'Ads/Views/Privacy/IPrivacySDKViewHandler';
import { Orientation, IAdUnit, AdUnitContainer, AdUnitContainerSystemMessage } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ICoreApi } from 'Core/ICore';
import { UserPrivacyManager, AgeGateChoice, GDPREventAction, GDPREventSource } from 'Ads/Managers/UserPrivacyManager';
import { PrivacyEvent, PrivacyMetrics } from 'Privacy/PrivacyMetrics';
import { PrivacyMethod, IPrivacyPermissions, UserPrivacy } from 'Privacy/Privacy';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { ConsentPage, IPrivacyViewParameters } from 'Ads/Views/Privacy/Privacy';
import { Platform } from 'Core/Constants/Platform';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ABGroup } from 'Core/Models/ABGroup';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { RequestManager } from 'Core/Managers/RequestManager';

export interface IPrivacyUnitParameters {
    abGroup: ABGroup;
    platform: Platform;
    privacyManager: UserPrivacyManager;
    requestManager: RequestManager;
    adUnitContainer: AdUnitContainer;
    adsConfig: AdsConfiguration;
    core: ICoreApi;
    deviceInfo: DeviceInfo;
    pts: ProgrammaticTrackingService;
    privacySDK: PrivacySDK;
}

export abstract class BasePrivacyUnit<T extends View<IPrivacyViewHandler | IPrivacySDKViewHandler>> implements IAdUnit {
    private _donePromiseResolve: () => void;
    private _adUnitContainer: AdUnitContainer;
    private _privacySDK: PrivacySDK;
    private _adsConfig: AdsConfiguration;
    private readonly _platform: Platform;
    private readonly _landingPage: ConsentPage;

    private _useTransparency: boolean;

    protected _core: ICoreApi;
    protected _showing: boolean;
    protected _privacyManager: UserPrivacyManager;
    protected _unityPrivacyView: T;

    constructor(parameters: IPrivacyUnitParameters) {
        this._adUnitContainer = parameters.adUnitContainer;
        this._platform = parameters.platform;
        this._privacyManager = parameters.privacyManager;
        this._adsConfig = parameters.adsConfig;
        this._core = parameters.core;
        this._privacySDK = parameters.privacySDK;

        this._landingPage = this._privacySDK.isAgeGateEnabled() ? ConsentPage.AGE_GATE : ConsentPage.HOMEPAGE;

        this._useTransparency = true;
        if (this._platform === Platform.IOS && IosUtils.isAdUnitTransparencyBroken(parameters.deviceInfo.getOsVersion())) {
            this._useTransparency = false;
        }
    }

    public show(options: unknown): Promise<void> {
        return this._adUnitContainer.open(this, ['webview'], false, Orientation.NONE, true, this._useTransparency, true, false, options).then(() => {
            const donePromise = new Promise<void>((resolve) => {
                this._donePromiseResolve = resolve;
            });
            this._adUnitContainer.addEventHandler(this);
            this._unityPrivacyView.render();
            document.body.appendChild(this._unityPrivacyView.container());

            this._unityPrivacyView.show();

            if (this._privacySDK.isAgeGateEnabled()) {
                PrivacyMetrics.trigger(PrivacyEvent.AGE_GATE_SHOW);
            } else if (this._privacySDK.getGamePrivacy().getMethod() === PrivacyMethod.UNITY_CONSENT) {
                PrivacyMetrics.trigger(PrivacyEvent.CONSENT_SHOW);
            }

            return donePromise;
        });
    }

    // IAdUnitContainerListener
    public onContainerShow(): void {
        // Blank
    }

    // IAdUnitContainerListener
    public onContainerDestroy(): void {
        if (this._showing) {
            this._showing = false;
            this._adUnitContainer.removeEventHandler(this);
            if (this._unityPrivacyView.container().parentElement) {
                document.body.removeChild(this._unityPrivacyView.container());
            }

            // Fixes browser build for android. TODO: find a neater way
            setTimeout(() => {
                this._donePromiseResolve();
            }, 0);
        }
    }

    // IAdUnitContainerListener
    public onContainerBackground(): void {
        // Blank
    }

    // IAdUnitContainerListener
    public onContainerForeground(): void {
        // Blank
    }

    // IAdUnitContainerListener
    public onContainerSystemMessage(message: AdUnitContainerSystemMessage): void {
        // Blank
    }

    public description(): string {
        return 'Privacy';
    }

    public setConsent(permissions: IPrivacyPermissions, userAction: GDPREventAction, source: GDPREventSource): void {
        if (UserPrivacy.permissionsEql(permissions, UserPrivacy.PERM_ALL_TRUE)) {
            PrivacyMetrics.trigger(PrivacyEvent.CONSENT_ACCEPT_ALL, permissions);
        } else if (UserPrivacy.permissionsEql(permissions, UserPrivacy.PERM_ALL_FALSE)) {
            PrivacyMetrics.trigger(PrivacyEvent.CONSENT_NOT_ACCEPTED, permissions);
        } else {
            PrivacyMetrics.trigger(PrivacyEvent.CONSENT_PARTIALLY_ACCEPTED, permissions);
        }
        this._privacyManager.updateUserPrivacy(permissions, source, userAction, this._landingPage);
    }

    public closePrivacy(): void {
        this._adUnitContainer.close().then(() => {
            if (this._platform !== Platform.IOS) {
                // Android will not trigger onCointainerDestroy if close()-was called, iOS will
                this.onContainerDestroy();
            }
        });
    }

    // IConsentViewHandler
    public ageGateDisagree(): void {
        this._privacyManager.setUsersAgeGateChoice(AgeGateChoice.NO);

        const permissions: IPrivacyPermissions = {
            gameExp: false,
            ads: false,
            external: false
        };

        this._privacyManager.updateUserPrivacy(permissions, GDPREventSource.USER, GDPREventAction.AGE_GATE_DISAGREE, ConsentPage.AGE_GATE);
    }

    public ageGateAgree(): void {
        this._privacyManager.setUsersAgeGateChoice(AgeGateChoice.YES);
    }

    public openPrivacyUrl(url: string): void {
        if (this._platform === Platform.IOS) {
            this._core.iOS!.UrlScheme.open(url);
        } else if (this._platform === Platform.ANDROID) {
            this._core.Android!.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }

    protected getViewParams(parameters: IPrivacyUnitParameters): IPrivacyViewParameters {
        let viewParams: IPrivacyViewParameters = {
            platform: parameters.platform,
            privacyManager: parameters.privacyManager,
            landingPage: this._landingPage,
            pts: parameters.pts,
            language: parameters.deviceInfo.getLanguage(),
            consentABTest: false,
            ageGateLimit: this._privacySDK.getAgeGateLimit(),
            core: this._core
        };

        if (this._platform === Platform.ANDROID) {
            viewParams = {
                ... viewParams,
                apiLevel: (<AndroidDeviceInfo>parameters.deviceInfo).getApiLevel()
            };
        } else if (this._platform === Platform.IOS) {
            viewParams = {
                ... viewParams,
                osVersion: parameters.deviceInfo.getOsVersion()
            };
        }

        return viewParams;
    }
}
