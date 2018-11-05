import { BackendApi } from 'Backend/BackendApi';

export class CustomPurchasing extends BackendApi {
    public available() {
        return false;
    }

    public purchaseItem(productId: string, extras: any) {
        // EMPTY
    }

    public refreshCatalog() {
        // EMPTY
    }
}
