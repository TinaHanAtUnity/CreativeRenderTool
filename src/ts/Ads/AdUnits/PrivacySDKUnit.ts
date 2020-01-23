import { GDPREventAction, GDPREventSource } from 'Ads/Managers/UserPrivacyManager';
import { IPrivacySettings } from 'Privacy/IPrivacySettings';
import { IPrivacySDKViewHandler } from 'Ads/Views/Privacy/IPrivacySDKViewHandler';
import { PrivacySDKView } from 'Ads/Views/Privacy/PrivacySDKView';
import { PrivacyConfig } from 'Privacy/PrivacyConfig';
import { BasePrivacyUnit, IPrivacyUnitParameters } from 'Ads/AdUnits/BasePrivacyUnit';
import { RequestManager } from 'Core/Managers/RequestManager';

export class PrivacySDKUnit extends BasePrivacyUnit<PrivacySDKView> implements IPrivacySDKViewHandler {
    private _privacyConfig: PrivacyConfig;
    private _requestManager: RequestManager;

    constructor(parameters: IPrivacyUnitParameters) {
        super(parameters);

        this._requestManager = parameters.requestManager;
        this._unityPrivacyView = new PrivacySDKView(this.getViewParams(parameters));
        this._unityPrivacyView.addEventHandler(this);
    }

    public show(options: unknown): Promise<void> {
        this._showing = true;
        return this._privacyManager.getPrivacyConfig().then((privacyConfig) => {
            this._privacyConfig = privacyConfig;
            this._unityPrivacyView.setPrivacyConfig(privacyConfig);

            return super.show(options);
        }).catch((e: Error) => {
            this._core.Sdk.logWarning('Error opening Privacy view ' + e);
        });
    }

    public onPrivacyCompleted(userSettings: IPrivacySettings): void {
        this._core.Sdk.logDebug('PRIVACY: Got permissions: ' + JSON.stringify(userSettings));

        // TODO: Can we always use GDPREventSource.USER ?
        this.setConsent({
                ... userSettings.user,
                profiling: false
            },
            GDPREventAction.CONSENT_SAVE_CHOICES,
            GDPREventSource.USER);

        if (userSettings.user.agreedOverAgeLimit) {
            this.ageGateAgree();
        }

        this._unityPrivacyView.completeCallback();

        this.closePrivacy();
    }

    public onPrivacyReady(): void {
        this._unityPrivacyView.readyCallback(this._privacyConfig.getFlow(), {
            env: this._privacyConfig.getEnv(),
            user: this._privacyConfig.getUserSettings()
        });

        this._core.Sdk.logDebug('PRIVACY: Privacy ready');
    }

    public onPrivacyOpenUrl(url: string): void {
        this.openPrivacyUrl(url);
        this._unityPrivacyView.openUrlCallback(url);
    }

    public onPrivacyMetric(data: { [key: string]: unknown }): void {
        // EMPTY
    }
}
