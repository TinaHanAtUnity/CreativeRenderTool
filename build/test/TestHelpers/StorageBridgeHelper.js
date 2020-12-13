export class StorageBridgeHelper {
    static waitForPublicStorageBatch(storageBridge) {
        return new Promise((resolve, reject) => {
            const storageObserver = () => {
                storageBridge.onPublicStorageWrite.unsubscribe(storageObserver);
                resolve();
            };
            storageBridge.onPublicStorageWrite.subscribe(storageObserver);
        });
    }
    static waitForPrivateStorageBatch(storageBridge) {
        return new Promise((resolve, reject) => {
            const storageObserver = () => {
                storageBridge.onPrivateStorageWrite.unsubscribe(storageObserver);
                resolve();
            };
            storageBridge.onPrivateStorageWrite.subscribe(storageObserver);
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RvcmFnZUJyaWRnZUhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvVGVzdEhlbHBlcnMvU3RvcmFnZUJyaWRnZUhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxNQUFNLE9BQU8sbUJBQW1CO0lBQ3JCLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxhQUE0QjtRQUNoRSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLE1BQU0sZUFBZSxHQUFHLEdBQUcsRUFBRTtnQkFDekIsYUFBYSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDaEUsT0FBTyxFQUFFLENBQUM7WUFDZCxDQUFDLENBQUM7WUFDRixhQUFhLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ2xFLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxhQUE0QjtRQUNqRSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLE1BQU0sZUFBZSxHQUFHLEdBQUcsRUFBRTtnQkFDekIsYUFBYSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDakUsT0FBTyxFQUFFLENBQUM7WUFDZCxDQUFDLENBQUM7WUFDRixhQUFhLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ25FLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKIn0=