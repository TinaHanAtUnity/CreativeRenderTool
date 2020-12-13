import { CallbackContainer } from 'Core/Native/Bridge/CallbackContainer';
export class AppleStore {
    constructor(store) {
        this._callbackId = 1;
        this._store = store;
        this._callbacks = {};
        this._productRequests = {};
        this._store.iOS.Products.onProductRequestComplete.subscribe((id, result) => this.onProductRequestComplete(id, result));
        this._store.iOS.Products.onProductRequestErrorNoProducts.subscribe((id) => this.onProductRequestErrorNoProducts(id));
        this._store.iOS.Products.onProductRequestFailed.subscribe((id, error) => this.onProductRequestFailed(id, error));
    }
    getProductInfo(productId) {
        const id = this._callbackId++;
        const promise = new Promise((resolve, reject) => {
            this._callbacks[id] = new CallbackContainer(resolve, reject);
        });
        this._productRequests[id] = productId;
        this._store.iOS.Products.requestProductInfos([productId], id);
        return promise;
    }
    onProductRequestComplete(requestId, products) {
        const productId = this._productRequests[requestId];
        if (productId && products[productId]) {
            this.finishProductRequest(true, requestId, products[productId]);
        }
        this.finishProductRequest(false, requestId);
    }
    onProductRequestErrorNoProducts(requestId) {
        this.finishProductRequest(false, requestId);
    }
    onProductRequestFailed(requestId, errorMessage) {
        this.finishProductRequest(false, requestId);
    }
    finishProductRequest(success, requestId, result) {
        const callback = this._callbacks[requestId];
        if (callback) {
            if (success) {
                callback.resolve(result);
            }
            else {
                callback.reject();
            }
            delete this._callbacks[requestId];
        }
        if (this._productRequests[requestId]) {
            delete this._productRequests[requestId];
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwbGVTdG9yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9TdG9yZS9VdGlsaXRpZXMvQXBwbGVTdG9yZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUV6RSxNQUFNLE9BQU8sVUFBVTtJQU1uQixZQUFZLEtBQWdCO1FBSnBCLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBSzVCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7UUFFM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFJLENBQUMsUUFBUSxDQUFDLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN4SCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUksQ0FBQyxRQUFRLENBQUMsK0JBQStCLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN0SCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUksQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RILENBQUM7SUFFTSxjQUFjLENBQUMsU0FBaUI7UUFDbkMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRTlCLE1BQU0sT0FBTyxHQUFHLElBQUksT0FBTyxDQUFnQixDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUMzRCxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksaUJBQWlCLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2pFLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQztRQUV0QyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUUvRCxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRU8sd0JBQXdCLENBQUMsU0FBaUIsRUFBRSxRQUFnRDtRQUNoRyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFbkQsSUFBSSxTQUFTLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ2xDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1NBQ25FO1FBRUQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRU8sK0JBQStCLENBQUMsU0FBaUI7UUFDckQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRU8sc0JBQXNCLENBQUMsU0FBaUIsRUFBRSxZQUFvQjtRQUNsRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFTyxvQkFBb0IsQ0FBQyxPQUFnQixFQUFFLFNBQWlCLEVBQUUsTUFBc0I7UUFDcEYsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUU1QyxJQUFJLFFBQVEsRUFBRTtZQUNWLElBQUksT0FBTyxFQUFFO2dCQUNULFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDNUI7aUJBQU07Z0JBQ0gsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ3JCO1lBRUQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQ3JDO1FBRUQsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDbEMsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDM0M7SUFDTCxDQUFDO0NBQ0oifQ==