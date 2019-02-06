import { IVideoAdUnitParameters, VideoAdUnit } from 'Ads/AdUnits/VideoAdUnit';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { Campaign } from 'Ads/Models/Campaign';
import { IStoreHandler, IStoreHandlerDownloadParameters } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { IOperativeEventParams } from 'Ads/Managers/OperativeEventManager';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';

export interface IVideoOverlayDownloadParameters extends IStoreHandlerDownloadParameters {
    videoDuration: number;
    videoProgress: number;
    skipEnabled: boolean;
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
        if (!parameters.skipEnabled) {
            // This is for the install now button test in rewarded ad video overlay.
            const operativeEventParams = this.getOperativeEventParams(parameters);
            this._operativeEventManager.sendThirdQuartile(operativeEventParams);
            this._operativeEventManager.sendView(operativeEventParams);
            this.sendClickEventToKafka(parameters);
        }
        this._storeHandler.onDownload(parameters);
        if (parameters.skipEnabled) {
            this.onOverlaySkip(parameters.videoProgress);
        }
        this.setCallButtonEnabled(true);
    }

    private setCallButtonEnabled(enabled: boolean): void {
        if (this._overlay) {
            this._overlay.setCallButtonEnabled(enabled);
        }
    }

    private getOperativeEventParams(parameters: IVideoOverlayDownloadParameters): IOperativeEventParams {
        return {
            placement: this._placement,
            videoOrientation: this.getVideoOrientation(),
            adUnitStyle: parameters.adUnitStyle,
            asset: this._adUnit.getVideo()
        };
    }

    private sendClickEventToKafka(parameters: IVideoOverlayDownloadParameters) {
        const currentSession = this._campaign.getSession();
        const kafkaObject: { [key: string]: unknown } = {};
        kafkaObject.type = 'rewarded_video_overlay_cta_button_click';
        kafkaObject.auctionId = currentSession.getId();
        kafkaObject.number1 = parameters.videoDuration / 1000;
        kafkaObject.number2 = parameters.videoProgress / 1000;
        kafkaObject.number3 = parameters.videoProgress / parameters.videoDuration;
        HttpKafka.sendEvent('ads.sdk2.events.aui.experiments.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }
}
