import { Model } from 'Core/Models/Model';
export class StoreTransaction extends Model {
    constructor(timestamp, productId, price, currency, receipt, transactionId) {
        super('StoreTransaction', StoreTransaction.Schema, {
            ts: timestamp,
            receipt: receipt,
            productId: productId,
            price: price,
            currency: currency,
            transactionId: transactionId
        });
    }
    getTimestamp() {
        return this.get('ts');
    }
    getReceipt() {
        return this.get('receipt');
    }
    getProductId() {
        return this.get('productId');
    }
    getPrice() {
        return this.get('price');
    }
    getCurrency() {
        return this.get('currency');
    }
    getTransactionId() {
        return this.get('transactionId');
    }
    getDTO() {
        return {
            ts: this.getTimestamp(),
            receipt: this.getReceipt(),
            productId: this.getProductId(),
            amount: this.getPrice(),
            currency: this.getCurrency(),
            transactionId: this.getTransactionId()
        };
    }
}
StoreTransaction.Schema = {
    ts: ['number'],
    receipt: ['string'],
    productId: ['string'],
    price: ['number'],
    currency: ['string'],
    transactionId: ['string']
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RvcmVUcmFuc2FjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9TdG9yZS9Nb2RlbHMvU3RvcmVUcmFuc2FjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFXLE1BQU0sbUJBQW1CLENBQUM7QUFXbkQsTUFBTSxPQUFPLGdCQUFpQixTQUFRLEtBQXdCO0lBVTFELFlBQVksU0FBaUIsRUFBRSxTQUFpQixFQUFFLEtBQWEsRUFBRSxRQUFnQixFQUFFLE9BQWUsRUFBRSxhQUFxQjtRQUNySCxLQUFLLENBQUMsa0JBQWtCLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxFQUFFO1lBQy9DLEVBQUUsRUFBRSxTQUFTO1lBQ2IsT0FBTyxFQUFFLE9BQU87WUFDaEIsU0FBUyxFQUFFLFNBQVM7WUFDcEIsS0FBSyxFQUFFLEtBQUs7WUFDWixRQUFRLEVBQUUsUUFBUTtZQUNsQixhQUFhLEVBQUUsYUFBYTtTQUMvQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sWUFBWTtRQUNmLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRU0sVUFBVTtRQUNiLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRU0sWUFBWTtRQUNmLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRU0sUUFBUTtRQUNYLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRU0sV0FBVztRQUNkLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRU0sZ0JBQWdCO1FBQ25CLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRU0sTUFBTTtRQUNULE9BQU87WUFDSCxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUN2QixPQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUMxQixTQUFTLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUM5QixNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUN2QixRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUM1QixhQUFhLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFO1NBQ3pDLENBQUM7SUFDTixDQUFDOztBQXJEYSx1QkFBTSxHQUErQjtJQUMvQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUM7SUFDZCxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUM7SUFDbkIsU0FBUyxFQUFFLENBQUMsUUFBUSxDQUFDO0lBQ3JCLEtBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQztJQUNqQixRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUM7SUFDcEIsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDO0NBQzVCLENBQUMifQ==