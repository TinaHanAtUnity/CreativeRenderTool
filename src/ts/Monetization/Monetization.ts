import { IApiModule } from '../Core/Modules/IApiModule';
import { IMonetizationApi } from './IMonetization';
import { PlacementContentsApi } from './Native/PlacementContents';
import { MonetizationListenerApi } from './Native/MonetizationListener';
import { ICore } from '../Core/ICore';

export class Monetization implements IApiModule {

    public readonly Api: Readonly<IMonetizationApi>;

    constructor(core: ICore) {
        this.Api = {
            Listener: new MonetizationListenerApi(core.NativeBridge),
            PlacementContents: new PlacementContentsApi(core.NativeBridge)
        };
    }

}
