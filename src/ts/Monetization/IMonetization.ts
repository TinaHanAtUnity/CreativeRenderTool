import { MonetizationListenerApi } from 'Monetization/Native/MonetizationListener';
import { PlacementContentsApi } from 'Monetization/Native/PlacementContents';
import { IApiModule, IModuleApi } from '../Core/Modules/IApiModule';

export interface IMonetizationApi extends IModuleApi {
    Listener: MonetizationListenerApi;
    PlacementContents: PlacementContentsApi;
}

export interface IMonetization extends IApiModule {
    readonly Api: Readonly<IMonetizationApi>;
}
