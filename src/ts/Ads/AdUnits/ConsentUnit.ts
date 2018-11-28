import { AdUnitContainer, AdUnitContainerSystemMessage, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { Platform } from 'Core/Constants/Platform';
import { GDPRConsent, IGDPRConsentHandler } from 'Ads/Views/Consent/GDPRConsent';

export interface IConsentUnitParameters {
    platform: Platform;
    gdprManager: GdprManager;
    adUnitContainer: AdUnitContainer;
}

export class ConsentUnit implements IGDPRConsentHandler {
    private _donePromiseResolve: () => void;
    private _showing: boolean;
    private _adUnitContainer: AdUnitContainer;
    private _gdprConsentView: GDPRConsent;

    constructor(parameters: IConsentUnitParameters) {
        this._gdprConsentView = new GDPRConsent({
            platform: parameters.platform,
            gdprManager: parameters.gdprManager
        });
        this._adUnitContainer = parameters.adUnitContainer;
        this._gdprConsentView.addEventHandler(this);
    }

    public show(options: any): Promise<void> {
        this._showing = true;
        return (<AdUnitContainer>this._adUnitContainer).open('Consent', ['webview'], false, Orientation.NONE, true, true, true, false, options).then(() => {
            const donePromise = new Promise<void>((resolve) => {
                this._donePromiseResolve = resolve;
            });
            this._adUnitContainer.addEventHandler(this);
            this._gdprConsentView.render();
            document.body.appendChild(this._gdprConsentView.container());
            this._gdprConsentView.show();
            return donePromise;
        }).catch((e: Error) => {
            // this._core.Api.Sdk.logWarning('Error opening Consent view ' + e);
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
            this._donePromiseResolve();
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

    // IGDPRConsentHandler
    public onConsent(consent: boolean): void {
        // TODO: Implement
    }

    // IGDPRConsentHandler
    public onShowOptions(): void {
        // TODO: Implement
    }

    // IGDPRConsentHandler
    public onConsentHide(): void {
        this._adUnitContainer.close();
    }
}