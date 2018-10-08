import { MonetizationListenerApi } from 'Monetization/Native/MonetizationListener';
import { PlacementContentsApi } from 'Monetization/Native/PlacementContents';

export interface IMonetizationServices {
    Listener: MonetizationListenerApi;
    PlacementContents: PlacementContentsApi;
}
