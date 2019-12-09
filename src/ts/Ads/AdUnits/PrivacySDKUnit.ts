import { GDPREventAction, GDPREventSource } from 'Ads/Managers/UserPrivacyManager';
import { IPrivacySettings } from 'Privacy/IPrivacySettings';
import { IPrivacySDKViewHandler } from 'Ads/Views/Privacy/IPrivacySDKViewHandler';
import { PrivacySDKView } from 'Ads/Views/Privacy/PrivacyView';
import { PrivacyConfig } from 'Privacy/PrivacyConfig';
import { BasePrivacyUnit, IPrivacyUnitParameters } from 'Ads/AdUnits/BasePrivacyUnit';

export class PrivacySDKUnit extends BasePrivacyUnit<PrivacySDKView> implements IPrivacySDKViewHandler {
    private _privacyConfig: PrivacyConfig;

    constructor(parameters: IPrivacyUnitParameters) {
        super(parameters);

        this._unityPrivacyView = new PrivacySDKView(this.getViewParams(parameters));
        this._unityPrivacyView.addEventHandler(this);
    }

    public onPrivacyCompleted(userSettings: IPrivacySettings): void {
        this._core.Sdk.logDebug('PRIVACY: Got permissions: ' + JSON.stringify(userSettings));
        this._unityPrivacyView.completeCallback();

        this.setConsent({
                ... userSettings.user,
                profiling: false
            },
            GDPREventAction.CONSENT_SAVE_CHOICES,
            GDPREventSource.USER);

        if (userSettings.user.agreedOverAgeLimit) {
            this.ageGateAgree();
        }

        this.closePrivacy();
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

    public onPrivacyEvent(name: string, data: { [key: string]: unknown }): void {
        this._unityPrivacyView.eventCallback(name);
        this._core.Sdk.logDebug('PRIVACY: Got event: ' + name + ' with data: ' + JSON.stringify(data));
    }
}
