import { IVideoAdUnitParameters, VideoAdUnit } from 'Ads/AdUnits/VideoAdUnit';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { Campaign } from 'Ads/Models/Campaign';
import { IStoreHandler, IStoreHandlerDownloadParameters } from 'Ads/EventHandlers/StoreHandler/StoreHandler';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';

export interface IVideoOverlayDownloadParameters extends IStoreHandlerDownloadParameters {
    videoProgress: number;
}

export class OverlayEventHandlerWithDownloadSupport<T extends Campaign> extends OverlayEventHandler<T> {

    private _storeHandler: IStoreHandler;
    private _overlay: AbstractVideoOverlay | undefined;
    protected _thirdPartyEventManager: ThirdPartyEventManager;

    constructor(adUnit: VideoAdUnit<T>, parameters: IVideoAdUnitParameters<T>, storeHandler: IStoreHandler, adUnitStyle?: AdUnitStyle) {
        super(adUnit, parameters, adUnitStyle);
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._overlay = this._adUnit.getOverlay();
        this._storeHandler = storeHandler;
    }

    public onOverlayDownload(parameters: IVideoOverlayDownloadParameters): void {
        this.setCallButtonEnabled(false);
        this._storeHandler.onDownload(parameters);
        this.onOverlaySkip(parameters.videoProgress);
        this.setCallButtonEnabled(true);
    }

    private setCallButtonEnabled(enabled: boolean): void {
        if (this._overlay) {
            this._overlay.setCallButtonEnabled(enabled);
        }
    }
}
