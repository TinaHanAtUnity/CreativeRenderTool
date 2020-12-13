export class BatchInvocation {
    constructor(nativeBridge) {
        this._batch = [];
        this._nativeBridge = nativeBridge;
    }
    queue(className, methodName, parameters = []) {
        return this.rawQueue(className, methodName, parameters);
    }
    rawQueue(fullClassName, methodName, parameters = []) {
        return new Promise((resolve, reject) => {
            const id = this._nativeBridge.registerCallback(resolve, reject);
            this._batch.push([fullClassName, methodName, parameters, id.toString()]);
        });
    }
    getBatch() {
        return this._batch;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmF0Y2hJbnZvY2F0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvTmF0aXZlL0JyaWRnZS9CYXRjaEludm9jYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsTUFBTSxPQUFPLGVBQWU7SUFLeEIsWUFBWSxZQUEwQjtRQUY5QixXQUFNLEdBQXVCLEVBQUUsQ0FBQztRQUdwQyxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztJQUN0QyxDQUFDO0lBRU0sS0FBSyxDQUFJLFNBQWlCLEVBQUUsVUFBa0IsRUFBRSxhQUF3QixFQUFFO1FBQzdFLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBSSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFTSxRQUFRLENBQUksYUFBcUIsRUFBRSxVQUFrQixFQUFFLGFBQXdCLEVBQUU7UUFDcEYsT0FBTyxJQUFJLE9BQU8sQ0FBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQVEsRUFBRTtZQUM1QyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNoRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0UsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sUUFBUTtRQUNYLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0NBQ0oifQ==