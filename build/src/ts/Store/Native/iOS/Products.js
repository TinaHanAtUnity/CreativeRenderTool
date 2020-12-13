import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { EventCategory } from 'Core/Constants/EventCategory';
import { Observable1, Observable2 } from 'Core/Utilities/Observable';
var IosStoreEvent;
(function (IosStoreEvent) {
    IosStoreEvent[IosStoreEvent["PRODUCT_REQUEST_COMPLETE"] = 0] = "PRODUCT_REQUEST_COMPLETE";
    IosStoreEvent[IosStoreEvent["PRODUCT_REQUEST_ERROR_NO_PRODUCTS"] = 1] = "PRODUCT_REQUEST_ERROR_NO_PRODUCTS";
    IosStoreEvent[IosStoreEvent["PRODUCT_REQUEST_FAILED"] = 2] = "PRODUCT_REQUEST_FAILED";
    IosStoreEvent[IosStoreEvent["RECEIVED_TRANSACTION"] = 3] = "RECEIVED_TRANSACTION";
})(IosStoreEvent || (IosStoreEvent = {}));
export class ProductsApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Products', ApiPackage.STORE, EventCategory.STORE);
        this.onProductRequestErrorNoProducts = new Observable1();
        this.onProductRequestComplete = new Observable2();
        this.onProductRequestFailed = new Observable2();
        this.onTransaction = new Observable1();
    }
    requestProductInfos(productIds, requestId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'requestProductInfos', [productIds, requestId]);
    }
    startTransactionObserver() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'startTransactionObserver');
    }
    stopTransactionObserver() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'stopTransactionObserver');
    }
    getReceipt() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getReceipt');
    }
    handleEvent(event, parameters) {
        switch (event) {
            case IosStoreEvent[IosStoreEvent.PRODUCT_REQUEST_COMPLETE]:
                this.onProductRequestComplete.trigger(parameters[0], parameters[1]);
                break;
            case IosStoreEvent[IosStoreEvent.PRODUCT_REQUEST_ERROR_NO_PRODUCTS]:
                this.onProductRequestErrorNoProducts.trigger(parameters[0]);
                break;
            case IosStoreEvent[IosStoreEvent.PRODUCT_REQUEST_FAILED]:
                this.onProductRequestFailed.trigger(parameters[0], parameters[1]);
                break;
            case IosStoreEvent[IosStoreEvent.RECEIVED_TRANSACTION]:
                this.onTransaction.trigger(parameters[0]);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZHVjdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvU3RvcmUvTmF0aXZlL2lPUy9Qcm9kdWN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRXJFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBR3JFLElBQUssYUFLSjtBQUxELFdBQUssYUFBYTtJQUNkLHlGQUF3QixDQUFBO0lBQ3hCLDJHQUFpQyxDQUFBO0lBQ2pDLHFGQUFzQixDQUFBO0lBQ3RCLGlGQUFvQixDQUFBO0FBQ3hCLENBQUMsRUFMSSxhQUFhLEtBQWIsYUFBYSxRQUtqQjtBQXdDRCxNQUFNLE9BQU8sV0FBWSxTQUFRLFNBQVM7SUFNdEMsWUFBWSxZQUEwQjtRQUNsQyxLQUFLLENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQU4zRCxvQ0FBK0IsR0FBRyxJQUFJLFdBQVcsRUFBVSxDQUFDO1FBQzVELDZCQUF3QixHQUFHLElBQUksV0FBVyxFQUFrRCxDQUFDO1FBQzdGLDJCQUFzQixHQUFHLElBQUksV0FBVyxFQUFrQixDQUFDO1FBQzNELGtCQUFhLEdBQUcsSUFBSSxXQUFXLEVBQXVCLENBQUM7SUFJdkUsQ0FBQztJQUVNLG1CQUFtQixDQUFDLFVBQW9CLEVBQUUsU0FBaUI7UUFDOUQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUscUJBQXFCLEVBQUUsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUNuSCxDQUFDO0lBRU0sd0JBQXdCO1FBQzNCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLDBCQUEwQixDQUFDLENBQUM7SUFDL0YsQ0FBQztJQUVNLHVCQUF1QjtRQUMxQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO0lBQzlGLENBQUM7SUFFTSxVQUFVO1FBQ2IsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBUyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUVNLFdBQVcsQ0FBQyxLQUFhLEVBQUUsVUFBcUI7UUFDbkQsUUFBUSxLQUFLLEVBQUU7WUFDWCxLQUFLLGFBQWEsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUM7Z0JBQ3RELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQVMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUEwQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEgsTUFBTTtZQUVWLEtBQUssYUFBYSxDQUFDLGFBQWEsQ0FBQyxpQ0FBaUMsQ0FBQztnQkFDL0QsSUFBSSxDQUFDLCtCQUErQixDQUFDLE9BQU8sQ0FBUyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEUsTUFBTTtZQUVWLEtBQUssYUFBYSxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQztnQkFDcEQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBUyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQVUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xGLE1BQU07WUFFVixLQUFLLGFBQWEsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUM7Z0JBQ2xELElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFzQixVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0QsTUFBTTtZQUVWO2dCQUNJLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQzVDO0lBQ0wsQ0FBQztDQUNKIn0=