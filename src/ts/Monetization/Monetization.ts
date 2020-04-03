import { IAds } from 'Ads/IAds';
import { ICore } from 'Core/ICore';
import { IApiModule } from 'Core/Modules/IApiModule';
import { IMonetization, IMonetizationApi } from 'Monetization/IMonetization';
import { PlacementContentManager } from 'Monetization/Managers/PlacementContentManager';
import { MonetizationListenerApi } from 'Monetization/Native/MonetizationListener';
import { PlacementContentsApi } from 'Monetization/Native/PlacementContents';

export class Monetization implements IApiModule, IMonetization {

    public readonly Api: Readonly<IMonetizationApi>;

    public PlacementContentManager: PlacementContentManager;

    private _core: ICore;
    private _ads: IAds;

    private _initialized = false;

    constructor(core: ICore, ads: IAds) {
        this._core = core;
        this._ads = ads;

        this.Api = {
            Listener: new MonetizationListenerApi(core.NativeBridge),
            PlacementContents: new PlacementContentsApi(core.NativeBridge)
        };
    }

    public initialize() {
        this._core.ClientInfo.setMonetizationInUse(true);

        this.PlacementContentManager = new PlacementContentManager(this.Api, this._ads.Config, this._ads.CampaignManager);
        this._initialized = true;
    }

    public isInitialized() {
        return this._initialized;
    }

}
