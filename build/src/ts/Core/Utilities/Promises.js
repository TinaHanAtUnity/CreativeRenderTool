export class TimeoutError extends Error {
    constructor(message) {
        super(message);
    }
}
export class Promises {
    static withTimeout(promise, timeout) {
        let timeoutID;
        const rejection = new Promise((resolve, reject) => {
            timeoutID = window.setTimeout(() => {
                reject(new TimeoutError(`Operation timed out after ${timeout} ms`));
            }, timeout);
        });
        return Promise.race([
            promise,
            rejection
        ]).then((result) => {
            window.clearTimeout(timeoutID);
            return result;
        });
    }
    /**
     * Converts a Promise<T> to Promise<void> because sometimes TypeScript types are a little
     * too strict.
     */
    static voidResult(promise) {
        return promise.then(() => { return; });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvbWlzZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9VdGlsaXRpZXMvUHJvbWlzZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxPQUFPLFlBQWEsU0FBUSxLQUFLO0lBQ25DLFlBQVksT0FBZTtRQUN2QixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkIsQ0FBQztDQUNKO0FBRUQsTUFBTSxPQUFPLFFBQVE7SUFDVixNQUFNLENBQUMsV0FBVyxDQUFJLE9BQW1CLEVBQUUsT0FBZTtRQUM3RCxJQUFJLFNBQWlCLENBQUM7UUFDdEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDOUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUMvQixNQUFNLENBQUMsSUFBSSxZQUFZLENBQUMsNkJBQTZCLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN4RSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFtQixPQUFPLENBQUMsSUFBSSxDQUFDO1lBQzVCLE9BQU87WUFDUCxTQUFTO1NBQ1osQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ2YsTUFBTSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMvQixPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7O09BR0c7SUFDSSxNQUFNLENBQUMsVUFBVSxDQUFJLE9BQW1CO1FBQzNDLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0MsQ0FBQztDQUNKIn0=