import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { GDPREventAction, GDPREventSource, GdprManager } from 'Ads/Managers/GdprManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { IPrivacyHandler } from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';

export class PrivacyEventHandler implements IPrivacyHandler {

    private _platform: Platform;
    private _core: ICoreApi;
    private _gdprManager: GdprManager;
    private _configuration: AdsConfiguration;
    private _placement: Placement;

    constructor(parameters: IAdUnitParameters<Campaign>) {
        this._platform = parameters.platform;
        this._core = parameters.core;
        this._gdprManager = parameters.gdprManager;
        this._configuration = parameters.adsConfig;
        this._placement = parameters.placement;
    }

    public onPrivacy(url: string): void {
        if (this._platform === Platform.IOS) {
            this._core.iOS!.UrlScheme.open(url);
        } else if (this._platform === Platform.ANDROID) {
            this._core.Android!.Intent.launch({
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
