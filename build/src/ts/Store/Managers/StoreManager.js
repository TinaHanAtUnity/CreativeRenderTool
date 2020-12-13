import { Observable1 } from 'Core/Utilities/Observable';
export class StoreManager {
    constructor(store, analyticsManager) {
        this.onStoreTransaction = new Observable1();
        this._store = store;
        this._analyticsManager = analyticsManager;
        this.onStoreTransaction.subscribe((transaction) => this._analyticsManager.onTransactionSuccess(transaction));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RvcmVNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1N0b3JlL01hbmFnZXJzL1N0b3JlTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFHeEQsTUFBTSxPQUFnQixZQUFZO0lBTTlCLFlBQVksS0FBZ0IsRUFBRSxnQkFBbUM7UUFMMUQsdUJBQWtCLEdBQUcsSUFBSSxXQUFXLEVBQW9CLENBQUM7UUFNNUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO1FBRTFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ2pILENBQUM7Q0FDSiJ9