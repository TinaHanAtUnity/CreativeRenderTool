export class PrivacyAdapterContainer {
    constructor(handler) {
        this._isConnected = false;
        this._handler = handler;
    }
    connect(eventAdapter) {
        if (this._isConnected) {
            throw new Error('Trying to connect even though already connected. Disconnect should be called first.');
        }
        this._eventAdapter = eventAdapter;
        if (!this._isConnected) {
            this._eventAdapter.connect();
            this._isConnected = true;
        }
    }
    disconnect() {
        this._eventAdapter.disconnect();
        this._isConnected = false;
    }
    onPrivacyCompleted(params) {
        this._handler.onPrivacyCompleted(params);
    }
    onPrivacyReady() {
        this._handler.onPrivacyReady();
    }
    onPrivacyOpenUrl(url) {
        this._handler.onPrivacyOpenUrl(url);
    }
    onPrivacyMetric(data) {
        this._handler.onPrivacyMetric(data);
    }
    onPrivacyFetchUrl(data) {
        this._handler.onPrivacyFetchUrl(data);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeUFkYXB0ZXJDb250YWluZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdHMvUHJpdmFjeS9Qcml2YWN5QWRhcHRlckNvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxNQUFNLE9BQU8sdUJBQXVCO0lBS2hDLFlBQVksT0FBNkI7UUFIakMsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFJekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7SUFDNUIsQ0FBQztJQUVNLE9BQU8sQ0FBQyxZQUF1QztRQUNsRCxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQyxxRkFBcUYsQ0FBQyxDQUFDO1NBQzFHO1FBRUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7UUFFbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztTQUM1QjtJQUNMLENBQUM7SUFFTSxVQUFVO1FBQ2IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNoQyxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztJQUM5QixDQUFDO0lBRU0sa0JBQWtCLENBQUMsTUFBK0I7UUFDckQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRU0sY0FBYztRQUNqQixJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFTSxnQkFBZ0IsQ0FBQyxHQUFXO1FBQy9CLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVNLGVBQWUsQ0FBQyxJQUFnQztRQUNuRCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRU0saUJBQWlCLENBQUMsSUFBNEI7UUFDakQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQyxDQUFDO0NBQ0oifQ==