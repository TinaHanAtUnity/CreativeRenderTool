import { MonetizationListenerApi } from 'Monetization/Native/MonetizationListener';
import { PlacementContentsApi } from 'Monetization/Native/PlacementContents';
import { CustomPurchasingApi } from 'Purchasing/Native/CustomPurchasing';

export interface IMonetizationServices {
    Listener: MonetizationListenerApi;
    PlacementContents: PlacementContentsApi;
    CustomPurchasing: CustomPurchasingApi;
}
