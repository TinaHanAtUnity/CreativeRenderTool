import { IPurchasing, IPurchasingApi } from './IPurchasing';
import { CustomPurchasingApi } from './Native/CustomPurchasing';
import { ICore } from '../Core/ICore';

export class Purchasing implements IPurchasing {

    public readonly Api: Readonly<IPurchasingApi>;

    constructor(core: ICore) {
        this.Api = {
            CustomPurchasing: new CustomPurchasingApi(core.NativeBridge)
        };
    }

}
