import { IAds } from 'Ads/IAds';
import { ICore } from 'Core/ICore';
import { IApiModule } from 'Core/Modules/IApiModule';
import { IMonetization, IMonetizationApi } from 'Monetization/IMonetization';
import { NativePromoPlacementContentEventManager } from 'Monetization/Managers/NativePromoPlacementContentManager';
import { PlacementContentManager } from 'Monetization/Managers/PlacementContentManager';
import { MonetizationListenerApi } from 'Monetization/Native/MonetizationListener';
import { PlacementContentsApi } from 'Monetization/Native/PlacementContents';
import { NativePromoEventHandler } from 'Promo/EventHandlers/NativePromoEventHandler';
import { IPromo } from 'Promo/IPromo';
import { IPurchasing } from 'Purchasing/IPurchasing';

export class Monetization implements IApiModule, IMonetization {

    public readonly Api: Readonly<IMonetizationApi>;

    public PlacementContentManager: PlacementContentManager;
    public NativePromoPlacementContentEventManager: NativePromoPlacementContentEventManager;
    public NativePromoEventHandler: NativePromoEventHandler;

    private _core: ICore;
    private _ads: IAds;
    private _promo: IPromo;
    private _purchasing: IPurchasing;

    private _initialized = false;

    constructor(core: ICore, ads: IAds, promo: IPromo, purchasing: IPurchasing) {
        this._core = core;
        this._ads = ads;
        this._promo = promo;
        this._purchasing = purchasing;

        this.Api = {
            Listener: new MonetizationListenerApi(core.NativeBridge),
            PlacementContents: new PlacementContentsApi(core.NativeBridge)
        };
    }

    public initialize() {
        this._core.ClientInfo.setMonetizationInUse(true);

        this.PlacementContentManager = new PlacementContentManager(this.Api, this._promo.Api, this._ads.Config, this._ads.CampaignManager, this._ads.PlacementManager, this._core);
        this.NativePromoEventHandler = new NativePromoEventHandler(this._core.Api, this._ads.Api, this._purchasing.Api, this._core.ClientInfo, this._ads.ThirdPartyEventManagerFactory, this._core.MetaDataManager);
        this._ads.RefreshManager.subscribeNativePromoEvents(this.NativePromoEventHandler);
        this.NativePromoPlacementContentEventManager = new NativePromoPlacementContentEventManager(this.Api, this._ads.Config, this.NativePromoEventHandler);
        this._initialized = true;
    }

    public isInitialized() {
        return this._initialized;
    }

}
