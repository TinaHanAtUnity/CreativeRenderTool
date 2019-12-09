import { GDPREventAction, GDPREventSource } from 'Ads/Managers/UserPrivacyManager';
import { Privacy } from 'Ads/Views/Privacy/Privacy';
import { IPrivacyViewHandler } from 'Ads/Views/Privacy/IPrivacyViewHandler';
import { IPrivacyPermissions } from 'Privacy/Privacy';
import { BasePrivacyUnit, IPrivacyUnitParameters } from 'Ads/AdUnits/BasePrivacyUnit';

export class PrivacyUnit extends BasePrivacyUnit<Privacy> implements IPrivacyViewHandler {
    constructor(parameters: IPrivacyUnitParameters) {
        super(parameters);

        this._unityPrivacyView = new Privacy(this.getViewParams(parameters));
        this._unityPrivacyView.addEventHandler(this);
    }

    public show(options: unknown): Promise<void> {
        this._showing = true;
        return super.show(options).catch((e: Error) => {
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
}
