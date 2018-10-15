import { CustomPurchasingApi } from 'Purchasing/Native/CustomPurchasing';
import { MonetizationListenerApi } from 'Monetization/Native/MonetizationListener';
import { PlacementContentsApi } from 'Monetization/Native/PlacementContents';

export interface IMonetizationServices {
    CustomPurchasing: CustomPurchasingApi;
    Listener: MonetizationListenerApi;
    PlacementContents: PlacementContentsApi;
}
