import { ICore } from 'Core/ICore';
import { IPurchasing, IPurchasingApi } from 'Purchasing/IPurchasing';
import { CustomPurchasingApi } from 'Purchasing/Native/CustomPurchasing';

export class Purchasing implements IPurchasing {

    public readonly Api: Readonly<IPurchasingApi>;

    constructor(core: ICore) {
        this.Api = {
            CustomPurchasing: new CustomPurchasingApi(core.NativeBridge)
        };
    }

}
