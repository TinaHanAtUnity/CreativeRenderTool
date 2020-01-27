import { GDPREventAction, GDPREventSource } from 'Ads/Managers/UserPrivacyManager';
import { Privacy } from 'Ads/Views/Privacy/Privacy';
import { IPrivacyViewHandler } from 'Ads/Views/Privacy/IPrivacyViewHandler';
import { IPrivacyPermissions } from 'Privacy/Privacy';
import { BasePrivacyUnit, IPrivacyUnitParameters } from 'Ads/AdUnits/BasePrivacyUnit';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';

export class PrivacyUnit extends BasePrivacyUnit<Privacy> implements IPrivacyViewHandler {
    constructor(parameters: IPrivacyUnitParameters) {
        super(parameters);

        this._unityPrivacyView = new Privacy(this.getViewParams(parameters));
        this._privacyManager = parameters.privacyManager;

        const viewParams = this.getViewParams(parameters);
        this._unityPrivacyView = new Privacy(viewParams);
        this._unityPrivacyView.addEventHandler(this);
    }

    public show(options: unknown): Promise<void> {
        this._showing = true;
        return super.show(options).then(() => {
            if (typeof TestEnvironment.get('autoAcceptAgeGate') === 'boolean') {
                const ageGateValue = JSON.parse(TestEnvironment.get('autoAcceptAgeGate'));
                this.handleAutoAgeGate(ageGateValue);
            }

            if (TestEnvironment.get('autoAcceptConsent')) {
                const consentValues = JSON.parse(TestEnvironment.get('autoAcceptConsent'));
                this.handleAutoConsent(consentValues);
            }
        }).catch((e: Error) => {
            this._core.Sdk.logWarning('Error opening Privacy view ' + e);
        });
    }

    // IPrivacyViewHandler
    public onConsent(permissions: IPrivacyPermissions, userAction: GDPREventAction, source: GDPREventSource): void {
        this.setConsent(permissions, userAction, source);
    }

    // IPrivacyViewHandler
    public onClose(): void {
        this.closePrivacy();
    }

    // IPrivacyViewHandler
    public onAgeGateDisagree(): void {
        this.ageGateDisagree();
    }

    // IPrivacyViewHandler
    public onAgeGateAgree(): void {
        this.ageGateAgree();
    }

    // IPrivacyViewHandler
    public onPrivacy(url: string): void {
        this.openPrivacyUrl(url);
    }

    private handleAutoAgeGate(ageGate: boolean) {
        setTimeout(() => {
            this._core.Sdk.logInfo('setting autoAcceptAgeGate based on ' + ageGate);
            this._unityPrivacyView.testAutoAgeGate(ageGate);
        }, 3000);
    }

    private handleAutoConsent(consent: IPrivacyPermissions) {
        setTimeout(() => {
            if (consent.hasOwnProperty('ads')) {
                this._core.Sdk.logInfo('setting autoAcceptConsent with Personalized Consent based on ' + JSON.stringify(consent));
                this._unityPrivacyView.testAutoConsent(consent);
            }
        }, 3000);
    }
}
