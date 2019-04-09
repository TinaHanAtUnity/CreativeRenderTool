import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { VideoAdUnit } from 'Ads/AdUnits/VideoAdUnit';
import { AndroidVideoEventHandler } from 'Ads/EventHandlers/AndroidVideoEventHandler';
import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { IosVideoEventHandler } from 'Ads/EventHandlers/IosVideoEventHandler';
import { VideoEventHandler } from 'Ads/EventHandlers/VideoEventHandler';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { Video } from 'Ads/Models/Assets/Video';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { Platform } from 'Core/Constants/Platform';
import { IAbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { Placement } from 'Ads/Models/Placement';
import { PrivacyMethod } from 'Ads/Models/Privacy';

export abstract class AbstractAdUnitFactory<T extends Campaign, Params extends IAdUnitParameters<T>> {
    private _adUnitParametersFactory: IAbstractAdUnitParametersFactory<T, Params>;

    constructor(parametersFactory: IAbstractAdUnitParametersFactory<T, Params>) {
        this._adUnitParametersFactory = parametersFactory;
    }

    public create(campaign: T, placement: Placement, orientation: Orientation, gamerServerId: string, options: unknown) {
        const params = this._adUnitParametersFactory.create(campaign, placement, orientation, gamerServerId, options);
        const adUnit =  this.createAdUnit(params);
        params.privacy.setupReportListener(adUnit);
        return adUnit;
    }

    protected abstract createAdUnit(parameters: Params): AbstractAdUnit;

    protected prepareVideoPlayer<T1 extends VideoEventHandler, T2 extends VideoAdUnit, T3 extends Campaign, T4 extends OperativeEventManager, ParamsType extends IVideoEventHandlerParams<T2, T3, T4>>(VideoEventHandlerConstructor: new(p: ParamsType) => T1, params: ParamsType): T1 {
        const adUnit = params.adUnit;
        const videoEventHandler = new VideoEventHandlerConstructor(params);

        params.ads.VideoPlayer.addEventHandler(videoEventHandler);

        adUnit.onClose.subscribe(() => {
            params.ads.VideoPlayer.removeEventHandler(videoEventHandler);
        });

        if (params.platform === Platform.ANDROID) {
            this.prepareAndroidVideoPlayer(params);
        } else if(params.platform === Platform.IOS) {
            this.prepareIosVideoPlayer(params);
        }

        return videoEventHandler;
    }

    protected prepareAndroidVideoPlayer(params: IVideoEventHandlerParams) {
        const adUnit = params.adUnit;
        const androidVideoEventHandler = new AndroidVideoEventHandler(params);

        params.ads.VideoPlayer.Android!.addEventHandler(androidVideoEventHandler);

        adUnit.onClose.subscribe(() => {
            params.ads.VideoPlayer.Android!.removeEventHandler(androidVideoEventHandler);
        });
    }

    protected prepareIosVideoPlayer(params: IVideoEventHandlerParams) {
        const adUnit = params.adUnit;
        const iosVideoEventHandler = new IosVideoEventHandler(params);

        params.ads.VideoPlayer.iOS!.addEventHandler(iosVideoEventHandler);

        adUnit.onClose.subscribe(() => {
            params.ads.VideoPlayer.iOS!.removeEventHandler(iosVideoEventHandler);
        });
    }

    protected getVideoEventHandlerParams(adUnit: VideoAdUnit, video: Video, adUnitStyle: AdUnitStyle | undefined, params: IAdUnitParameters<Campaign>): IVideoEventHandlerParams {
        return {
            platform: params.platform,
            adUnit: adUnit,
            campaign: params.campaign,
            operativeEventManager: params.operativeEventManager,
            thirdPartyEventManager: params.thirdPartyEventManager,
            coreConfig: params.coreConfig,
            adsConfig: params.adsConfig,
            placement: params.placement,
            video: video,
            adUnitStyle: adUnitStyle,
            clientInfo: params.clientInfo,
            core: params.core,
            ads: params.ads,
            programmaticTrackingService: params.programmaticTrackingService
        };
    }
}
