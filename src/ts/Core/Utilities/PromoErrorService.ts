import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { Platform } from 'Core/Constants/Platform';

interface IPromoErrorServiceParams {
    auctionID: string | undefined;
    corrID: string | undefined;
    country: string | undefined;
    projectID: string | undefined;
    gameID: string | undefined;
    placementID: string | undefined;
    productID: string | undefined;
    platform: Platform;
    gamerToken: string;
    errorCode: number;
    errorMessage: string;
}

export class PromoErrorService {
    public static report(requestManager: RequestManager, promoErrorServiceParams: IPromoErrorServiceParams): Promise<INativeResponse> {
        return requestManager.post('https://events.iap.unity3d.com/events/v1/errors', JSON.stringify(promoErrorServiceParams));
    }
}
