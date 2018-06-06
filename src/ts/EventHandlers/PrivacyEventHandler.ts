import { NativeBridge } from 'Native/NativeBridge';
import { IPrivacyHandler } from 'Views/AbstractPrivacy';
import { IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { Configuration } from 'Models/Configuration';
import { Campaign } from 'Models/Campaign';
import { Platform } from 'Constants/Platform';
import { Placement } from 'Models/Placement';
import { GdprManager, GDPREventSource, GDPREventAction } from 'Managers/GdprManager';

export class PrivacyEventHandler implements IPrivacyHandler {

    private _nativeBridge: NativeBridge;
    private _gdprManager: GdprManager;
    private _configuration: Configuration;
    private _placement: Placement;

    constructor(nativeBridge: NativeBridge, parameters: IAdUnitParameters<Campaign>) {
        this._nativeBridge = nativeBridge;
        this._gdprManager = parameters.gdprManager;
        this._configuration = parameters.configuration;
        this._placement = parameters.placement;
    }

    public onPrivacy(url: string): void {
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            this._nativeBridge.UrlScheme.open(url);
        } else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._nativeBridge.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }

    public onPrivacyClose(): void {
        //
    }

    public onGDPROptOut(optOutEnabled: boolean): void {
        if(this._configuration.isOptOutRecorded()) {
            if(optOutEnabled !== this._configuration.isOptOutEnabled()) {
                this._configuration.setOptOutEnabled(optOutEnabled);
                if (optOutEnabled) {
                    // optout needs to send the source because we need to tell if it came from consent metadata or gdpr banner
                    this._gdprManager.sendGDPREvent(GDPREventAction.OPTOUT, GDPREventSource.USER);
                } else {
                    this._gdprManager.sendGDPREvent(GDPREventAction.OPTIN);
                }
            }
        } else {
            this._configuration.setOptOutRecorded(true);
            this._configuration.setOptOutEnabled(optOutEnabled);

            // if default choice was not changed and no previous answer has been recorded, we must treat this event
            // as skip because user has not pressed any button and opening the privacy dialog might have been just a misclick
            if (optOutEnabled) {
                // optout needs to send the source because we need to tell if it came from consent metadata or gdpr banner
                this._gdprManager.sendGDPREvent(GDPREventAction.OPTOUT, GDPREventSource.USER);
            } else {
                this._gdprManager.sendGDPREvent(GDPREventAction.SKIP);
            }
        }
    }
}
