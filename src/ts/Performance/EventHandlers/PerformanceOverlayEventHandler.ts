import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';
import { Request } from 'Core/Utilities/Request';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Platform } from 'Core/Constants/Platform';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { IEndScreenDownloadParameters } from 'Ads/EventHandlers/EndScreenEventHandler';
import { IOperativeEventParams } from 'Ads/Managers/OperativeEventManager';
import { RequestError } from 'Core/Errors/RequestError';
import { Video } from 'Ads/Models/Assets/Video';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { StoreName, PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { DownloadEventHandler, IDownloadEventHandler, IDownloadParameters } from 'Ads/EventHandlers/DownloadEventHandler';

export interface IVideoOverlayDownloadParameters extends IDownloadParameters {
    videoProgress: number;
}

export class PerformanceOverlayEventHandler extends OverlayEventHandler<PerformanceCampaign> {

    private _performanceOverlay?: AbstractVideoOverlay;
    private _downloadHelper: IDownloadEventHandler;
    protected _performanceAdUnit: PerformanceAdUnit;
    protected _thirdPartyEventManager: ThirdPartyEventManager;

    constructor(nativeBridge: NativeBridge, adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters, downloadHelper: IDownloadEventHandler) {
        super(nativeBridge, adUnit, parameters, parameters.adUnitStyle);
        this._performanceAdUnit = adUnit;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._performanceOverlay = this._performanceAdUnit.getOverlay();
        this._downloadHelper = downloadHelper;
    }

    public onOverlayDownload(parameters: IVideoOverlayDownloadParameters): void {
        this.setCallButtonEnabled(false);
        this._downloadHelper.onDownload(parameters);

        //TODO: is there need to skip these if app store url or id is missing?
        this.onOverlaySkip(parameters.videoProgress);
        this.setCallButtonEnabled(true);
    }

    public onOverlaySkip(position: number): void {
        super.onOverlaySkip(position);

        const endScreen = this._performanceAdUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
        this._performanceAdUnit.onFinish.trigger();

        this._thirdPartyEventManager.sendPerformanceTrackingEvent(this._campaign, ICometTrackingUrlEvents.SKIP);
    }

    private getVideo(): Video | undefined {
        return this._performanceAdUnit.getVideo();
    }

    private getOperativeEventParams(parameters: IVideoOverlayDownloadParameters): IOperativeEventParams {
        return {
            placement: this._placement,
            videoOrientation: this.getVideoOrientation(),
            adUnitStyle: parameters.adUnitStyle,
            asset: this.getVideo()
        };
    }

    private setCallButtonEnabled(enabled: boolean): void {
        if (this._performanceOverlay) {
            this._performanceOverlay.setCallButtonEnabled(enabled);
        }
    }
}
