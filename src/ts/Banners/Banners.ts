import { BannerPlacementManager } from 'Banners/Managers/BannerPlacementManager';
import { BannerCampaignManager } from 'Banners/Managers/BannerCampaignManager';
import { BannerWebPlayerContainer } from 'Ads//Utilities/WebPlayer/BannerWebPlayerContainer';
import { BannerAdUnitParametersFactory } from 'Banners/AdUnits/BannerAdUnitParametersFactory';
import { BannerAdContext } from 'Banners/Context/BannerAdContext';
import { IApiModule, IModuleApi } from 'Core/Modules/IApiModule';
import { BannerApi } from 'Banners/Native/Banner';
import { BannerListenerApi } from 'Banners/Native/UnityBannerListener';
import { IParserModule } from '../Ads/Modules/IParserModule';
import { BannerCampaignParser } from './Parsers/BannerCampaignParser';
import { BannerAdUnitFactory } from './AdUnits/BannerAdUnitFactory';
import { ICore } from '../Core/ICore';
import { IAds } from '../Ads/IAds';
import { IAnalytics } from '../Analytics/IAnalytics';

export interface IBannersApi extends IModuleApi {
    Banner: BannerApi;
    Listener: BannerListenerApi;
}

export class Banners implements IApiModule {

    public readonly Api: IBannersApi;

    public BannerAdContext: BannerAdContext;

    private readonly _parserHtml: BannerCampaignParser;
    private readonly _parserJs: BannerCampaignParser;
    private readonly _adUnitFactory: BannerAdUnitFactory;

    constructor(core: ICore, ads: IAds, analytics: IAnalytics) {
        this.Api = {
            Banner: new BannerApi(core.NativeBridge),
            Listener: new BannerListenerApi(core.NativeBridge)
        };

        const bannerPlacementManager = new BannerPlacementManager(ads.Api, ads.Config);
        bannerPlacementManager.sendBannersReady();

        const bannerCampaignManager = new BannerCampaignManager(core.NativeBridge.getPlatform(), core.Api, core.Config, ads.Config, ads.AssetManager, ads.SessionManager, ads.AdMobSignalFactory, core.RequestManager, core.ClientInfo, core.DeviceInfo, core.MetaDataManager, core.JaegerManager);
        const bannerWebPlayerContainer = new BannerWebPlayerContainer(core.NativeBridge.getPlatform(), ads.Api);
        const bannerAdUnitParametersFactory = new BannerAdUnitParametersFactory(core.NativeBridge.getPlatform(), core.Api, ads.Api, core.RequestManager, core.MetaDataManager, core.Config, ads.Config, ads.Container, core.DeviceInfo, core.ClientInfo, ads.SessionManager, core.FocusManager, analytics.AnalyticsManager, ads.AdMobSignalFactory, ads.GdprManager, bannerWebPlayerContainer, ads.ProgrammaticTrackingService, core.StorageBridge);
        this.BannerAdContext = new BannerAdContext(this.Api, bannerAdUnitParametersFactory, bannerCampaignManager, bannerPlacementManager, core.FocusManager, core.DeviceInfo);
    }

    public canParse(contentType: string) {
        return contentType === BannerCampaignParser.ContentTypeHTML || contentType === BannerCampaignParser.ContentTypeJS;
    }

    public getParser(contentType: string) {
        switch(contentType) {
            case BannerCampaignParser.ContentTypeHTML:
                return this._parserHtml;
            case BannerCampaignParser.ContentTypeJS:
                return this._parserJs;
            default:
                throw new Error('Banner module cannot handle content type: ' + contentType);
        }
    }

    public getParsers() {
        return [
            this._parserJs,
            this._parserHtml
        ];
    }

    public getAdUnitFactory() {
        return this._adUnitFactory;
    }

}
